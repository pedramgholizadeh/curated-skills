#!/usr/bin/env node
/*
 * align-srt.mjs — put approved caption TEXT on an accurate word CLOCK.
 *
 *   node align-srt.mjs <approved.srt> <asr.srt> --out <timed.srt> [options]
 *
 * approved.srt   the copy the viewer reads (proofread, correct spelling). Its
 *                timings may be shifted or rounded; its WORDS are the truth.
 * asr.srt        a machine transcript of the same speech (word-accurate clock).
 *                Its SPELLING is untrustworthy; its TIMES are the truth.
 *
 * Algorithm (see ../references/timing-rules.md):
 *   1. normalise both sides to lowercase letter/number token sets — script
 *      agnostic (Latin, Cyrillic, Arabic script all align), so no alphabet is
 *      assumed;
 *   2. greedy monotonic window match: each approved cue is matched to the
 *      contiguous run of ASR cues sharing the most tokens; the run with the
 *      best score wins if it clears --threshold, and the search cursor never
 *      moves backwards;
 *   3. cues that clear no window (usually an ASR gap: the model dropped a
 *      passage) are interpolated locally between their nearest confident
 *      neighbours, weighted by character length — never globally;
 *   4. monotonic + positive-duration enforcement;
 *   5. every time is divided by --speed so captions land on the edited clock.
 *
 * Text is NEVER rewritten: the output carries the approved copy verbatim.
 *
 * Exit codes: 0 ok · 2 usage · 3 unreadable/malformed SRT
 *             4 alignment failure (transcripts do not match / too weak)
 */
import fs from "node:fs";

const HELP = `align-srt.mjs — re-time an approved transcript onto an ASR word clock.

usage:
  node align-srt.mjs <approved.srt> <asr.srt> --out <timed.srt> [options]

arguments:
  <approved.srt>  correct wording, untrusted timings (the caption copy)
  <asr.srt>       speech-to-text output, trusted timings, garbled spelling

options:
  --out <file>        output SRT (required; "-" writes the SRT to stdout)
  --speed <k>         playback factor of the edited master, e.g. 1.2 (default 1)
  --threshold <f>     minimum match score for a confident cue (default 0.34)
  --min-overlap <f>   minimum shared-token ratio between the two transcripts
                      before the run is rejected as the wrong pairing (default 0.12)
  --gap <sec>         silence length reported as an ASR gap (default 2)
  --report <file>     also write the detailed JSON report (clamps, gaps, runs)
  --json              print the JSON summary instead of the human report
  --quiet             print nothing on success
  --help              show this help

exit codes: 0 ok · 2 usage · 3 unreadable/malformed SRT · 4 alignment failure
`;

/* ------------------------------------------------------------------- cli */

function fail(code, message) {
  process.stderr.write(`align-srt: error: ${message}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  const boolean = new Set(["json", "quiet", "help"]);
  const known = new Set(["out", "speed", "threshold", "min-overlap", "gap", "report", ...boolean]);
  const values = {};
  const positionals = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      process.stdout.write(HELP);
      process.exit(0);
    }
    if (a.startsWith("--")) {
      const name = a.slice(2);
      if (!known.has(name)) fail(2, `unknown flag: --${name} (use --help)`);
      if (boolean.has(name)) {
        values[name] = true;
        continue;
      }
      const next = argv[i + 1];
      if (next === undefined || (next.startsWith("--") && known.has(next.slice(2))))
        fail(2, `--${name} needs a value`);
      values[name] = next;
      i++;
      continue;
    }
    if (a.startsWith("-") && a.length > 1) fail(2, `unknown short flag: ${a} (use --help)`);
    positionals.push(a);
  }
  return { positionals, values };
}

function num(values, name, dflt, { min = -Infinity, max = Infinity, positive = false } = {}) {
  if (values[name] === undefined) return dflt;
  const n = Number(values[name]);
  if (!Number.isFinite(n) || n < min || n > max || (positive && n <= 0))
    fail(2, `bad --${name}: ${values[name]}`);
  return n;
}

const { positionals: POS, values: VAL } = parseArgs(process.argv.slice(2));
if (POS.length !== 2) fail(2, `expected exactly 2 SRT files, got ${POS.length} (use --help)`);
if (!VAL.out) fail(2, "missing --out <file> (use --help)");
if (VAL.out === "--report" || VAL.out.startsWith("--")) fail(2, `--out needs a file path, got ${VAL.out}`);

const opts = {
  speed: num(VAL, "speed", 1, { positive: true }),
  threshold: num(VAL, "threshold", 0.34, { min: 0, max: 1 }),
  minOverlap: num(VAL, "min-overlap", 0.12, { min: 0, max: 1 }),
  gap: num(VAL, "gap", 2, { positive: true }),
  json: Boolean(VAL.json),
  quiet: Boolean(VAL.quiet),
};

/* --------------------------------------------------------------- srt i/o */

/*
 * Script-agnostic normalisation. The order matters:
 *   1. drop BOM, zero-width spaces and bidi controls (they never carry words);
 *   2. delete ZWNJ (U+200C, the Persian word connector) and tatweel (U+0640,
 *      Arabic justification stretch) — both are GLUE, not word boundaries, so
 *      joining "می‌کنم" and "میکنم" into one token is what rescues a match;
 *   3. NFD, strip combining diacritics (é→e, Russian ё→е, Arabic ḍ/ā forms);
 *   4. lowercase, then recompose to NFC so output tokens stay canonical;
 *   5. punctuation → space, split on whitespace.
 * No alphabet is assumed and none is required.
 */
/* Minimum hold given to an unresolved cue, in seconds (mirrors the downstream
 * caption planner's MIN_CARD so a placeholder is at least readable). */
const MIN_CARD = 0.6;

const normalise = (s) =>
  s
    .replace(/[\uFEFF\u200B-\u200F\u061C\u202A-\u202E]/g, "")
    .replace(/[\u200C\u0640]/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036F]/g, "")
    .toLowerCase()
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

const stamp = (raw) => {
  const m = raw.match(/(\d+):(\d{2}):(\d{2})[,.](\d{1,3})/);
  if (!m) return null;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4].padEnd(3, "0")) / 1000;
};

const fmt = (t) => {
  const total = Math.max(0, Math.round(t * 1000));
  const pad = (n, w = 2) => String(n).padStart(w, "0");
  return `${pad(Math.floor(total / 3600000))}:${pad(Math.floor(total / 60000) % 60)}:${pad(
    Math.floor(total / 1000) % 60
  )},${pad(total % 1000, 3)}`;
};

const r3 = (n) => Math.round(n * 1000) / 1000;

function readSrt(file, label) {
  let raw;
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch (err) {
    fail(3, `cannot read the ${label} file ${file}: ${err.message}`);
  }
  const blocks = raw.replace(/\r\n?/g, "\n").trim().split(/\n{2,}/).filter((b) => b.trim());
  if (!blocks.length) fail(3, `the ${label} file ${file} contains no cue blocks`);
  let dropped = 0;
  const cues = [];
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const i = lines.findIndex((l) => l.includes("-->"));
    const start = i < 0 ? null : stamp(lines[i].split("-->")[0].trim());
    const end = i < 0 ? null : stamp(lines[i].split("-->")[1].trim());
    const text = i < 0 ? "" : lines.slice(i + 1).join(" ").trim();
    const tokens = normalise(text);
    if (start === null || end === null || !(end > start) || !tokens.length) {
      dropped++;
      continue;
    }
    cues.push({ start, end, text, tokens, chars: text.replace(/\s+/g, "").length });
  }
  if (!cues.length) fail(3, `the ${label} file ${file}: no cue with a valid timecode and words`);
  cues.sort((a, b) => a.start - b.start);
  return { cues, dropped };
}

const approved = readSrt(POS[0], "approved");
const asr = readSrt(POS[1], "asr");
const A = approved.cues;
const T = asr.cues;
const filmEnd = T.at(-1).end;

/* Global sanity check: do these two files describe the same speech at all? */
const asrBag = new Set(T.flatMap((c) => c.tokens));
const appTokens = A.flatMap((c) => c.tokens);
const shared = new Set(appTokens.filter((t) => asrBag.has(t))).size;
const tokenMatchRatio = shared / Math.max(1, new Set(appTokens).size);

/* ------------------------------------------------ 1. monotonic window match */

let pointer = 0;
const rows = A.map((cue, index) => {
  const set = new Set(cue.tokens);
  const cueDur = cue.end - cue.start;
  let best = { score: 0, from: -1, to: -1 };
  /* scan at most 4 new windows forward and at most 8 ASR cues per run */
  for (let a = pointer; a < Math.min(pointer + 4, T.length); a++) {
    const bag = new Set();
    for (let b = a; b < Math.min(a + 8, T.length); b++) {
      for (const t of T[b].tokens) bag.add(t);
      let hit = 0;
      for (const t of set) if (bag.has(t)) hit++;
      const score = hit / set.size - Math.abs(T[b].end - T[a].start - cueDur) / 12;
      if (score > best.score) best = { score, from: a, to: b };
    }
  }
  if (best.from < 0 || best.score < opts.threshold)
    return {
      ...cue,
      index: index + 1,
      start: null,
      end: null,
      approvedStart: r3(cue.start),
      approvedEnd: r3(cue.end),
      method: "interpolated",
      score: r3(Math.max(0, best.score)),
    };

  pointer = Math.max(pointer, best.to);
  return {
    ...cue,
    index: index + 1,
    approvedStart: r3(cue.start),
    approvedEnd: r3(cue.end),
    start: r3(T[best.from].start),
    end: r3(T[best.to].end),
    method: "matched",
    score: r3(best.score),
    asrFrom: best.from + 1,
    asrTo: best.to + 1,
    asrCues: best.to - best.from + 1,
    drift: r3(T[best.to].end - T[best.from].start - cueDur),
  };
});

/* ------------------------------ 2. local interpolation across ASR gaps */

const interpRuns = [];
for (let i = 0; i < rows.length; i++) {
  if (rows[i].start !== null) continue;
  let j = i;
  while (j < rows.length && rows[j].start === null) j++;
  const before = rows.slice(0, i).findLast((c) => c.start !== null);
  const after = rows.slice(j).find((c) => c.start !== null);
  const lo = before ? before.end : 0;
  const hi = after ? after.start : filmEnd;
  const run = rows.slice(i, j);
  /*
   * Weight by character count INSIDE the [lo, hi] window only. Global
   * proportional timing (cue chars / film chars × film length) is the classic
   * trap: one long opening cue slides everything behind it by minutes.
   */
  const chars = run.reduce((n, c) => n + c.chars, 0);
  /*
   * Degenerate window (hi <= lo): an over-long greedy match on one side
   * swallowed the space between two neighbours, so there is nothing left to
   * interpolate across. Character weighting would emit a 1 ms card and the
   * approved duration would shove the whole tail late. Both are worse than a
   * placeholder: give each cue the minimum readable hold, let the monotonic
   * pass chain them, and mark them UNRESOLVED so the report names the cues
   * whose copy has to be re-blocked.
   */
  const degenerate = hi - lo < 0.25;
  let cursor = lo;
  run.forEach((c) => {
    const share = degenerate ? MIN_CARD : (Math.max(hi - lo, 0.001) * c.chars) / Math.max(1, chars);
    c.start = r3(cursor);
    c.end = r3(cursor + share);
    cursor += share;
    if (degenerate) c.method = "unresolved";
  });
  interpRuns.push({
    cues: run.map((c) => c.index),
    lo: r3(lo),
    hi: r3(hi),
    width: r3(hi - lo),
    degenerate,
    basis: degenerate ? `placeholder ${MIN_CARD}s hold — re-block the approved copy so block lengths track the speech` : "character weight inside the gap",
  });
  i = j - 1;
}

/* ---------------------------------------- 3. monotonic + positive duration */

const clamps = [];
for (let i = 1; i < rows.length; i++) {
  const prev = rows[i - 1];
  const cur = rows[i];
  const pushed = r3(Math.max(0, prev.end - cur.start));
  const shortened = r3(Math.max(0, prev.end - cur.end));
  if (pushed > 0) cur.start = r3(prev.end);
  if (cur.end <= cur.start) cur.end = r3(cur.start + MIN_CARD);
  if (shortened > 0) prev.end = r3(Math.max(prev.start + 0.05, cur.start - 0.001));
  if (pushed > 0 || shortened > 0)
    clamps.push({ cue: cur.index, method: cur.method, pushedSec: pushed, prevShortenedSec: shortened });
}

/* ------------------------------------------------------------ 4. output */

const master = rows.map((c) => ({ ...c, start: r3(c.start / opts.speed), end: r3(c.end / opts.speed) }));
const srtText = master.map((c, i) => `${i + 1}\n${fmt(c.start)} --> ${fmt(c.end)}\n${c.text}`).join("\n\n") + "\n";

let overlaps = 0;
for (let i = 1; i < master.length; i++) if (master[i].start < master[i - 1].end) overlaps++;

const asrGaps = [];
for (let i = 1; i < T.length; i++) {
  const width = r3(T[i].start - T[i - 1].end);
  if (width >= opts.gap) asrGaps.push({ afterAsrCue: i, from: r3(T[i - 1].end), to: r3(T[i].start), width });
}

const matched = rows.filter((c) => c.method === "matched");
const interpolated = rows.filter((c) => c.method === "interpolated");
const unresolved = rows.filter((c) => c.method === "unresolved");
const unmatched = interpolated.length + unresolved.length;
const weak = matched.filter((c) => c.score < opts.threshold + 0.08);

const summary = {
  tool: "align-srt",
  version: 1,
  inputs: {
    approved: POS[0],
    approvedCues: A.length,
    approvedCuesDropped: approved.dropped,
    asr: POS[1],
    asrCues: T.length,
    asrCuesDropped: asr.dropped,
  },
  speed: opts.speed,
  threshold: opts.threshold,
  cues: master.length,
  matched: matched.length,
  interpolated: interpolated.length,
  unresolved: unresolved.length,
  unresolvedCues: unresolved.map((c) => c.index),
  weak: weak.length,
  minMatchScore: matched.length ? Math.min(...matched.map((c) => c.score)) : null,
  tokenMatchRatio: r3(tokenMatchRatio),
  maxDurationDriftSec: matched.length ? r3(Math.max(...matched.map((c) => Math.abs(c.drift)))) : 0,
  monotonicClamps: clamps.length,
  clampedCues: clamps.map((c) => c.cue),
  outputOverlaps: overlaps,
  filmStartSec: master[0].start,
  filmEndSec: master.at(-1).end,
  approvedClockEndSec: r3(rows.at(-1).end),
  asrClockEndSec: r3(filmEnd),
  asrGapCount: asrGaps.length,
  largestAsrGapSec: asrGaps.length ? Math.max(...asrGaps.map((g) => g.width)) : 0,
  interpRunCount: interpRuns.length,
};

/* ------------------------------------------------------ hard failure modes */

const reject = (message) => {
  fail(4, `${message} — nothing was written${VAL.out === "-" ? "" : ` to ${VAL.out}`}.`);
};

if (tokenMatchRatio < opts.minOverlap)
  reject(
    `the two transcripts share only ${(tokenMatchRatio * 100).toFixed(1)}% of the approved tokens ` +
      `(--min-overlap ${(opts.minOverlap * 100).toFixed(0)}%): wrong language, wrong recording, or a ` +
      `transcript that is not of this take`
  );

if (unmatched === master.length)
  reject(
    `no approved cue cleared the match threshold ${opts.threshold}, so every timestamp would be invented. ` +
      `Check the argument order: <approved.srt> <asr.srt>`
  );

const interpShare = unmatched / master.length;
if (interpShare > 0.5)
  reject(
    `${unmatched}/${master.length} cues (${(interpShare * 100).toFixed(0)}%) found no word overlap with the ` +
      `ASR clock — that is a mismatch, not a gap. Try a lower --threshold only if the wording really does differ`
  );

if (VAL.out !== "-") {
  try {
    fs.writeFileSync(VAL.out, srtText, "utf8");
  } catch (err) {
    fail(3, `cannot write ${VAL.out}: ${err.message}`);
  }
} else {
  process.stdout.write(srtText);
}

if (VAL.report) {
  try {
    fs.writeFileSync(VAL.report, JSON.stringify({ ...summary, clamps, asrGaps, interpRuns }, null, 2) + "\n", "utf8");
  } catch (err) {
    fail(3, `cannot write --report ${VAL.report}: ${err.message}`);
  }
}

/* ------------------------------------------------------------- reporting */

if (!VAL.quiet) {
  /* with --out - the SRT owns stdout, so the report goes to stderr */
  const sink = VAL.out === "-" ? process.stderr : process.stdout;
  if (opts.json) {
    sink.write(JSON.stringify(summary, null, 2) + "\n");
  } else {
    const warnings = [];
    for (const c of weak)
      warnings.push(`low-confidence match: cue ${c.index} score ${c.score.toFixed(2)} over ${c.asrCues} ASR cue(s) — "${c.text.slice(0, 40)}"`);
    for (const g of asrGaps)
      warnings.push(`ASR gap ${g.from}s–${g.to}s (${g.width}s) after ASR cue ${g.afterAsrCue} — cues inside it were interpolated`);
    for (const cl of clamps)
      if (cl.pushedSec > 0) warnings.push(`monotonic clamp: cue ${cl.cue} start pushed ${cl.pushedSec}s onto the previous end`);
    for (const r of interpRuns.filter((x) => x.degenerate))
      warnings.push(`unresolved cue(s) ${r.cues.join(", ")}: greedy matches left a ${r.width}s window between ${r.lo} and ${r.hi} — each got the ${MIN_CARD}s placeholder. Re-block the approved copy so cue durations match the speech, then re-run.`);
    sink.write(
      [
        `aligned ${master.length} approved cues onto ${T.length} ASR cues → ${VAL.out === "-" ? "stdout" : VAL.out}`,
        `  matched      ${matched.length}  (min score ${summary.minMatchScore === null ? "n/a" : summary.minMatchScore})`,
        `  interpolated ${interpolated.length}  in ${interpRuns.filter((r) => !r.degenerate).length} gap window(s): ${interpolated.map((c) => c.index).join(", ") || "-"}`,
        `  unresolved   ${unresolved.length}  (greedy matches left no window): ${unresolved.map((c) => c.index).join(", ") || "-"}`,
        `  weak         ${weak.length}  (score within 0.08 of threshold ${opts.threshold})`,
        `  shared tokens ${new Set(appTokens).size ? `${(tokenMatchRatio * 100).toFixed(1)}%` : "n/a"} of the approved vocabulary`,
        `  drift        max |asr span − approved duration| ${summary.maxDurationDriftSec}s on the source clock`,
        `  clamps       ${clamps.length} monotonic fix(es)`,
        `  clock        approved ends ${fmt(summary.approvedClockEndSec)} · asr ends ${fmt(summary.asrClockEndSec)} · film ${summary.filmEndSec}s at speed ${opts.speed}`,
        warnings.length ? `  warnings\n    ${warnings.join("\n    ")}` : "  warnings     none",
        "",
      ].join("\n")
    );
  }
}
