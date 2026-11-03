#!/usr/bin/env node
/*
 * rescale-srt.mjs — move an SRT that is already on the SOURCE clock onto an
 * edited master that plays the take faster (or slower).
 *
 *   node rescale-srt.mjs <in.srt> --speed <k> --out <out.srt>
 *
 * This is the honest fallback for align-srt.mjs: use it when the approved
 * caption text and the spoken audio share one clock and only the playback rate
 * changed (a straight 1.2x / 0.9x edit with no title offset). It does NOT fix
 * a transcript whose timings came from a different pass — that needs
 * align-srt.mjs, which takes the words from the copy and the times from ASR.
 *
 * Every timecode is divided by k (start and end alike, so cue lengths shrink
 * with the speech). Text is untouched. Cues are renumbered 1..n in clock order.
 *
 * Exit codes: 0 ok · 2 usage · 3 unreadable/malformed SRT
 */
import fs from "node:fs";

const HELP = `rescale-srt.mjs — divide every SRT timecode by a speed factor.

usage:
  node rescale-srt.mjs <in.srt> --speed <k> --out <out.srt> [options]

arguments:
  <in.srt>              subtitles already on the source clock (text is kept)

options:
  --speed <k>           playback factor of the edited master; required.
                        1.2 for a 1.2x take, 0.9 for a 10% slow-down.
  --out <file>          output SRT (required; "-" writes the SRT to stdout)
  --threshold <f>       accepted for pipeline symmetry; this script ignores it
                        (there is no alignment to score)
  --report <file>       write the JSON report to a file as well
  --json                print the JSON report instead of the human line
  --quiet               print nothing on success
  --help                show this help

exit codes: 0 ok · 2 usage · 3 unreadable/malformed SRT
`;

/* ------------------------------------------------------------------- cli */

function fail(code, message) {
  process.stderr.write(`rescale-srt: error: ${message}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  const boolean = new Set(["json", "quiet", "help"]);
  const known = new Set(["out", "speed", "threshold", "report", ...boolean]);
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

const { positionals: POS, values: VAL } = parseArgs(process.argv.slice(2));
if (POS.length !== 1) fail(2, `expected exactly 1 SRT file, got ${POS.length} (use --help)`);
if (!VAL.out) fail(2, "missing --out <file> (use --help)");
if (VAL.out.startsWith("--")) fail(2, `--out needs a file path, got ${VAL.out}`);
if (VAL.speed === undefined) fail(2, "missing --speed <k> (use --help)");
const speed = Number(VAL.speed);
if (!Number.isFinite(speed) || speed <= 0) fail(2, `bad --speed: ${VAL.speed}`);
if (VAL.threshold !== undefined && !(Number(VAL.threshold) >= 0 && Number(VAL.threshold) <= 1))
  fail(2, `bad --threshold: ${VAL.threshold}`);

/* --------------------------------------------------------------- srt i/o */

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

/* Floor given to a cue that the division left with no length at all. */
const MIN_HOLD = 0.6;

let raw;
try {
  raw = fs.readFileSync(POS[0], "utf8");
} catch (err) {
  fail(3, `cannot read ${POS[0]}: ${err.message}`);
}

const blocks = raw.replace(/\r\n?/g, "\n").trim().split(/\n{2,}/).filter((b) => b.trim());
if (!blocks.length) fail(3, `${POS[0]} contains no cue blocks`);

let dropped = 0;
const cues = [];
for (const block of blocks) {
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
  const i = lines.findIndex((l) => l.includes("-->"));
  const start = i < 0 ? null : stamp(lines[i].split("-->")[0].trim());
  const end = i < 0 ? null : stamp(lines[i].split("-->")[1].trim());
  const text = i < 0 ? "" : lines.slice(i + 1).join(" ");
  if (start === null || end === null || !(end > start) || !text) {
    dropped++;
    continue;
  }
  cues.push({ start, end, text });
}
if (!cues.length) fail(3, `${POS[0]}: no cue with a valid timecode and text`);
cues.sort((a, b) => a.start - b.start);

/* ------------------------------------------------------------ rescale */

const out = cues.map((c) => ({ start: r3(c.start / speed), end: r3(c.end / speed), text: c.text }));

let overlaps = 0;
let minDurFixes = 0;
for (let i = 1; i < out.length; i++) {
  if (out[i].start < out[i - 1].end) {
    overlaps++;
    out[i - 1].end = r3(Math.max(out[i - 1].start + 0.05, out[i].start - 0.001));
  }
  if (out[i].end <= out[i].start) {
    out[i].end = r3(out[i].start + MIN_HOLD);
    minDurFixes++;
  }
}

const srtText = out.map((c, i) => `${i + 1}\n${fmt(c.start)} --> ${fmt(c.end)}\n${c.text}`).join("\n\n") + "\n";

if (VAL.out !== "-") {
  try {
    fs.writeFileSync(VAL.out, srtText, "utf8");
  } catch (err) {
    fail(3, `cannot write ${VAL.out}: ${err.message}`);
  }
} else {
  process.stdout.write(srtText);
}

const report = {
  tool: "rescale-srt",
  version: 1,
  input: POS[0],
  cues: out.length,
  cuesDropped: dropped,
  speed,
  sourceClockEndSec: r3(cues.at(-1).end),
  firstCueStartSec: out[0].start,
  lastCueEndSec: out.at(-1).end,
  overlapsFixed: overlaps,
  minDurationFixes: minDurFixes,
};

if (VAL.report) {
  try {
    fs.writeFileSync(VAL.report, JSON.stringify(report, null, 2) + "\n", "utf8");
  } catch (err) {
    fail(3, `cannot write --report ${VAL.report}: ${err.message}`);
  }
}

if (!VAL.quiet) {
  const sink = VAL.out === "-" ? process.stderr : process.stdout;
  if (VAL.json) sink.write(JSON.stringify(report, null, 2) + "\n");
  else
    sink.write(
      [
        `rescaled ${out.length} cues by 1/${speed} → ${VAL.out === "-" ? "stdout" : VAL.out}`,
        `  clock        source ends ${fmt(report.sourceClockEndSec)} · film ends ${report.lastCueEndSec}s`,
        `  first cue    ${report.firstCueStartSec}s${report.firstCueStartSec < 0.1 ? "  (under the 0.1s floor — check the intro)" : ""}`,
        `  overlaps     ${overlaps} fixed by trimming the earlier cue`,
        `  min duration ${minDurFixes} cue(s) given a ${MIN_HOLD}s floor`,
        dropped ? `  dropped      ${dropped} malformed block(s)` : "  dropped      none",
        "",
      ].join("\n")
    );
}
