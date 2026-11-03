#!/usr/bin/env node
/*
 * srt.mjs — Persian SRT → HyperFrames captions on a chosen canvas.
 *
 *   node srt.mjs parse <file.srt> [--out timeline.json] [--format 2x1|9x16]
 *   node srt.mjs plan  <timeline.json> [--out timeline.json]
 *   node srt.mjs build <project-dir>
 *   node srt.mjs all   <project-dir> [--srt input/script.fa.srt]
 *
 * Deterministic: no clock, no randomness. The same SRT always yields the
 * same timeline and the same HTML.
 */
import fs from "node:fs";
import path from "node:path";

/* Two canvases proved in production. Card size, caption band, reading-speed
   * floor and host dimensions all come from the active format: `parse` picks it
   * with --format and stores it in timeline.meta; `plan` and `build` inherit it.
   * Add a format by copying a block — nothing else in this file is canvas-aware.
   */
const FORMATS = {
  "2x1": {
    name: "2x1",
    width: 1920,
    height: 960,
    maxWords: 7,
    maxChars: 68,
    maxLineChars: 34,
    maxLines: 2,
    capBottom: 88,
    capPadding: 220,
    capMaxWidth: 1480,
    capSize: 76,
    capLineHeight: 1.45,
    minGap: 0.06,
    minCard: 0.9,
    charsPerSec: 16,
    /* Plain type on a rendered ground: no pill, no border. */
    pill: "",
  },
  "9x16": {
    name: "9x16",
    width: 1080,
    height: 1920,
    maxWords: 7,
    maxChars: 60,
    maxLineChars: 22,
    maxLines: 3,
    capBottom: 470,
    capPadding: 60,
    capMaxWidth: 940,
    capSize: 60,
    capLineHeight: 1.4,
    minGap: 0.04,
    minCard: 0.7,
    charsPerSec: 20,
    /* Captions ride over real footage in Reels, so they need a scrim pill. */
    pill: `
      background: rgba(18, 20, 19, 0.62);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 5px;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        0 18px 44px rgba(0, 0, 0, 0.4);
      padding: 10px 30px 14px;`,
  },
};

const MAX_DUR = 6.5;
const MAX_READ_SPEED = 18;

let MAX_WORDS, MAX_CHARS, MAX_LINE_CHARS, MAX_LINES, MIN_GAP, MIN_CARD, CHARS_PER_SEC, FMT;

function setFormat(name) {
  const f = FORMATS[name];
  if (!f) throw new Error(`unknown format "${name}" (have: ${Object.keys(FORMATS).join(", ")})`);
  FMT = f;
  MAX_WORDS = f.maxWords;
  MAX_CHARS = f.maxChars;
  MAX_LINE_CHARS = f.maxLineChars;
  MAX_LINES = f.maxLines;
  MIN_GAP = f.minGap;
  MIN_CARD = f.minCard;
  CHARS_PER_SEC = f.charsPerSec;
  return f;
}

function formatFromMeta(meta) {
  if (meta && FORMATS[meta.format]) return meta.format;
  const hit = Object.values(FORMATS).find((f) => meta && f.width === meta.width && f.height === meta.height);
  return hit ? hit.name : "2x1";
}

setFormat("2x1");

/* ------------------------------------------------------------------ utils */

const round = (n) => Math.round(n * 1000) / 1000;
const visible = (s) => s.replace(/\u200c/g, "").replace(/\s/g, "").length;

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeFa(input) {
  let s = input
    .replace(/\uFEFF/g, "")
    .replace(/\u064A/g, "\u06CC")
    .replace(/\u0643/g, "\u06A9")
    .replace(/\u00A0/g, " ")
    .replace(/[\u200E\u200F\u061C]/g, "")
    .replace(/[\u0660-\u0669]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 0x06f0))
    .replace(/\s+([،؛؟!])/g, "$1")
    .replace(/([،؛؟!])(?=\S)/g, "$1 ")
    .replace(/[ \t]{2,}/g, " ");

  s = s
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");
  return s.trim();
}

function parseTree(text) {
  let s = text
    .replace(/\{\\[^}]*\}/g, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  return normalizeFa(s);
}

function parseTime(raw) {
  const m = raw.match(/(?:(\d+):)?(\d{1,2}):(\d{2})[,.](\d{1,3})/);
  if (!m) return null;
  const h = Number(m[1] || 0);
  const min = Number(m[2]);
  const sec = Number(m[3]);
  const ms = Number(m[4].padEnd(3, "0"));
  return h * 3600 + min * 60 + sec + ms / 1000;
}

function tokensOf(text) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      let text = raw;
      let hot = false;
      let uline = false;
      if (/^\*\*[^*]+\*\*$/.test(text)) {
        hot = true;
        text = text.slice(2, -2);
      }
      if (/^__[^_]+__$/.test(text)) {
        uline = true;
        text = text.slice(2, -2);
      }
      return { text, hot, uline, chars: visible(text) };
    });
}

const sentenceEnd = (t) => /[.!؟]$/.test(t);
const softEnd = (t) => /[،؛]$/.test(t);
const verbPrefix = (t) => /^(می|نمی)/.test(t);

function lineLen(words) {
  return words.reduce((n, w, i) => n + w.chars + (i ? 1 : 0), 0);
}

function wrap(rows, maxChars = MAX_LINE_CHARS) {
  const lines = [];
  let line = [];
  let len = 0;
  for (const w of rows) {
    const add = (line.length ? 1 : 0) + w.chars;
    if (line.length && len + add > maxChars) {
      lines.push(line);
      line = [];
      len = 0;
    }
    line.push(w);
    len += (line.length > 1 ? 1 : 0) + w.chars;
  }
  if (line.length) lines.push(line);

  // Two rows: rebalance so no row is a single orphan word and the verb is not
  // cut away from its prefix ("ادیت / میکنه").
  if (lines.length === 2 && rows.length > 3) {
    let best = null;
    for (let k = 1; k < rows.length; k++) {
      const a = rows.slice(0, k);
      const b = rows.slice(k);
      const la = lineLen(a);
      const lb = lineLen(b);
      if (la > maxChars || lb > maxChars || a.length < 2 || b.length < 2) continue;
      const score = Math.abs(la - lb) + (verbPrefix(b[0].text) ? 30 : 0);
      if (!best || score < best.score) best = { k, score };
    }
    if (best) return [rows.slice(0, best.k), rows.slice(best.k)];
  }
  return lines;
}

/* ------------------------------------------------------------------ parse */

function parseSrt(file) {
  const raw = fs.readFileSync(file, "utf8");
  const cues = [];
  const issues = [];
  const blocks = raw.replace(/\r\n?/g, "\n").split(/\n{2,}/);
  let replaced = 0;

  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.trim() !== "");
    if (!lines.length) continue;
    let i = 0;
    if (/^\d+$/.test(lines[0].trim())) i = 1;
    const timeLine = lines[i];
    if (!timeLine || !timeLine.includes("-->")) {
      if (block.trim()) issues.push({ kind: "block", detail: "block without a timecode" });
      continue;
    }
    const [a, b] = timeLine.split("-->");
    const start = parseTime(a);
    const end = parseTime(b);
    if (start == null || end == null || end <= start) {
      issues.push({ kind: "time", detail: `bad timecode: ${timeLine.trim()}` });
      continue;
    }
    const text = parseTree(lines.slice(i + 1).join(" "));
    if (!text) {
      issues.push({ kind: "empty", detail: `cue at ${round(start)}s is empty` });
      continue;
    }
    if (text.includes("\uFFFD")) replaced++;
    cues.push({ start: round(start), end: round(end), text });
  }

  cues.sort((x, y) => x.start - y.start);

  // Fix overlaps by trimming the earlier cue.
  let overlaps = 0;
  for (let i = 1; i < cues.length; i++) {
    if (cues[i].start < cues[i - 1].end) {
      overlaps++;
      cues[i - 1].end = round(Math.max(cues[i - 1].start + 0.2, cues[i].start - 0.04));
    }
  }

  const long = cues.filter((c) => c.end - c.start > 7);
  const speed = cues.map((c) => ({
    cue: c,
    cps: visible(c.text) / Math.max(0.001, c.end - c.start),
  }));
  const fast = speed.filter((s) => s.cps > MAX_READ_SPEED);
  const latinOnly = cues.filter((c) => /[A-Za-z]/.test(c.text) && !/[\u0600-\u06FF]/.test(c.text));
  const arabicScript = cues.filter((c) => /[\u0600-\u06FF]/.test(c.text) && /[\u064A\u0643]/.test(c.text));

  const report = {
    cues: cues.length,
    duration: cues.length ? round(cues[cues.length - 1].end) : 0,
    overlaps,
    long: long.length,
    fast: fast.length,
    empty: issues.filter((x) => x.kind === "empty").length,
    latinOnly: latinOnly.length,
    badEncoding: replaced,
    issues,
  };

  return {
    version: 1,
    meta: { source: path.basename(file), fps: 30, format: FMT.name, width: FMT.width, height: FMT.height },
    report,
    cues,
  };
}

/* ------------------------------------------------------------------- plan */

function planCards(input) {
  setFormat(formatFromMeta(input.meta));
  const cues = input.cues.map((c, i) => ({ ...c, index: i }));

  // Flatten cues into words with proportional timings (cue-level SRT only).
  const words = [];
  for (const cue of cues) {
    const toks = tokensOf(cue.text);
    if (!toks.length) continue;
    const total = toks.reduce((n, t) => n + Math.max(1, t.chars), 0);
    const dur = Math.max(0.2, cue.end - cue.start);
    let cursor = 0;
    for (const t of toks) {
      const share = (Math.max(1, t.chars) / total) * dur;
      words.push({
        ...t,
        cue: cue.index,
        start: round(cue.start + cursor),
        end: round(cue.start + cursor + share),
      });
      cursor += share;
    }
  }

  const cards = [];
  let cur = null;

  const close = () => {
    if (!cur) return;
    cur.text = cur.words.map((w) => w.text).join(" ");
    cur.chars = cur.words.reduce((n, w) => n + w.chars + 1, -1);
    cur.rows = wrap(cur.words);
    cur.firstStart = cur.words[0].start;
    cur.lastEnd = cur.words[cur.words.length - 1].end;
    cards.push(cur);
    cur = null;
  };

  for (const w of words) {
    if (!cur) {
      cur = { words: [w], cueSet: new Set([w.cue]) };
      continue;
    }
    const last = cur.words[cur.words.length - 1];
    const gap = w.start - last.end;
    const candidate = [...cur.words, w];
    const chars = candidate.reduce((n, x) => n + x.chars + 1, -1);
    const rows = wrap(candidate);
    const nextCue = w.cue !== last.cue;
    const breakNow =
      candidate.length > MAX_WORDS ||
      chars > MAX_CHARS ||
      rows.length > MAX_LINES ||
      w.end - cur.words[0].start > MAX_DUR ||
      (nextCue && gap > 0.12);

    if (breakNow) {
      close();
      cur = { words: [w], cueSet: new Set([w.cue]) };
      continue;
    }
    cur.words.push(w);
    cur.cueSet.add(w.cue);
    if ((sentenceEnd(w.text) && cur.words.length >= 2) || (softEnd(w.text) && cur.words.length >= 4)) {
      close();
    }
  }
  close();

  // Retime cards: start offsets, minimum reading time, hard gaps.
  let prevEnd = 0;
  cards.forEach((card, i) => {
    const minStart = i === 0 ? 0.15 : prevEnd + MIN_GAP;
    card.start = round(Math.max(card.firstStart, minStart));
    const minDur = Math.max(MIN_CARD, card.chars / CHARS_PER_SEC + 0.35);
    card.end = round(Math.max(card.lastEnd + 0.12, card.start + minDur));
    const next = cards[i + 1];
    if (next) {
      const ceiling = Math.max(card.start + 0.6, next.firstStart - MIN_GAP);
      card.end = round(Math.min(card.end, ceiling));
    }
    card.end = round(Math.min(card.end, card.start + MAX_DUR));
    if (card.end - card.start < 0.45) {
      card.end = round(card.start + 0.45);
    }
    card.cps = round(card.chars / Math.max(0.001, card.end - card.start));
    prevEnd = card.end;
  });

  cards.forEach((card, i) => {
    card.id = `cap-${String(i + 1).padStart(3, "0")}`;
    delete card.cueSet;
  });

  // Chapters: silences of 0.9 s or more between cues.
  const chapters = [];
  for (let i = 1; i < cues.length; i++) {
    const gap = cues[i].start - cues[i - 1].end;
    if (gap >= 0.9) {
      chapters.push({ at: round(cues[i].start), during: round(gap), afterCue: i });
    }
  }

  const lastEnd = cues.length ? cues[cues.length - 1].end : 0;
  const duration = round(Math.max(lastEnd, cards.length ? cards[cards.length - 1].end : 0));

  const report = {
    ...input.report,
    cards: cards.length,
    firstCard: cards.length ? cards[0].start : null,
    lastCardEnd: cards.length ? cards[cards.length - 1].end : null,
    duration,
    chapters: chapters.length,
    slowCards: cards.filter((c) => c.cps > MAX_READ_SPEED).map((c) => ({ id: c.id, cps: c.cps, text: c.text })),
    longCards: cards.filter((c) => c.end - c.start > MAX_DUR).length,
  };

  return { ...input, report, chapters, cards };
}

/* ------------------------------------------------------------------ build */

const captionCss = (f) => `
    #root {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .cap {
      position: absolute;
      inset-inline: 0;
      bottom: ${f.capBottom}px;
      padding-inline: ${f.capPadding}px;
      text-align: center;
      z-index: 2;
    }

    .cap-line {
      display: block;
      width: fit-content;
      max-width: ${f.capMaxWidth}px;
      margin-inline: auto;
      color: var(--color-ink);
      font-size: var(--cap-size, ${f.capSize}px);
      font-weight: 700;
      line-height: ${f.capLineHeight};${f.pill}
      text-align: center;
      text-wrap: balance;
      overflow: visible;
      text-shadow: 0 2px 22px rgba(0, 0, 0, 0.55);
      opacity: 0;
      will-change: opacity, transform, filter;
    }

    .cap-row {
      display: block;
    }

    .cap-word {
      display: inline-block;
      white-space: nowrap;
    }

    .cap-word.hot {
      color: var(--color-accent);
    }

    .cap-word.uline {
      color: var(--color-accent);
      border-bottom: 4px solid var(--color-accent);
      padding-bottom: 3px;
    }

    .cap-latin {
      direction: ltr;
      unicode-bidi: isolate;
    }
`;

function wordHtml(w) {
  const isLatin = /[A-Za-z]/.test(w.text) && !/[\u0600-\u06FF]/.test(w.text);
  const cls = ["cap-word", w.hot ? "hot" : "", w.uline ? "uline" : ""].filter(Boolean).join(" ");
  const inner = escapeHtml(w.text);
  return `<span class="${cls}">${isLatin ? `<span class="cap-latin">${inner}</span>` : inner}</span>`;
}

function cardHtml(card) {
  const rows = card.rows.map((line) => `          <span class="cap-row">${line.map(wordHtml).join("\n            ")}</span>`).join("\n");
  const duration = round(card.end - card.start);
  return `      <div id="${card.id}" class="clip cap" data-start="${card.start}" data-duration="${duration}" data-track-index="20" data-hold>
        <div id="${card.id}-line" class="cap-line">
${rows}
        </div>
      </div>`;
}

function captionsFile(cards, compositionId) {
  const markup = cards.map(cardHtml).join("\n");
  const tweens = cards
    .map((card) => {
      const exitAt = round(Math.max(card.start + 0.05, card.end - 0.12));
      // No visibility flip: the runtime hides a clip outside its own window,
      // and the exit tween already ends at opacity 0.
      return `    tl.fromTo(
      "#${card.id}-line",
      { opacity: 0, y: 8, filter: "blur(5px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.18, ease: "power3.out" },
      ${card.start}
    );
    tl.to("#${card.id}-line", { opacity: 0, duration: 0.12, ease: "power2.in" }, ${exitAt});`;
    })
    .join("\n");

  return `<template>
  <style>${captionCss(FMT)}  </style>

  <div id="root" data-composition-id="${compositionId}" data-width="${FMT.width}" data-height="${FMT.height}">
${markup}
  </div>

  <script>
    const tl = gsap.timeline({ paused: true });

${tweens}

    window.__timelines["${compositionId}"] = tl;
    tl.seek(0);
  </script>
</template>
`;
}

/* Eight cards per file keeps each timeline readable and lint-quiet. */
const CARDS_PER_FILE = 6;

function captionHosts(chunks, endStart) {
  return chunks
    .map(
      (id, i) => `      <div
        id="${id}-host"
        class="scene-host"
        data-composition-id="${id}"
        data-composition-src="compositions/${id}.html"
        data-start="0"
        data-duration="${endStart}"
        data-width="${FMT.width}"
        data-height="${FMT.height}"
        data-track-index="20"
        data-track-kind="captions"
      ></div>`,
    )
    .join("\n");
}

function patchAttr(html, hostId, attr, value) {
  const re = new RegExp(`(<div\\s+id="${hostId}"[^>]*?\\s${attr}=")[^"]*(")`);
  return html.replace(re, `$1${value}$2`);
}

function updateRoot(html, { endStart, total, titleDuration, hideTitle, hostsHtml }) {
  html = html.replace(/(<div\s+id="root"[\s\S]*?data-duration=")[\d.]+(")/, `$1${total}$2`);

  const marked = /<!-- captions:start -->[\s\S]*?<!-- captions:end -->/;
  if (marked.test(html)) {
    html = html.replace(
      marked,
      `<!-- captions:start -->\n${hostsHtml}\n      <!-- captions:end -->`,
    );
  } else {
    // Older projects: replace the single placeholder host.
    html = html.replace(
      /<div\s+id="captions-host"[\s\S]*?<\/div>/,
      hostsHtml,
    );
  }

  html = patchAttr(html, "endcard-host", "data-start", endStart);
  html = patchAttr(html, "endcard-host", "data-duration", 3);
  html = patchAttr(html, "title-host", "data-duration", titleDuration);
  if (hideTitle) {
    html = html.replace(/(<div\s+id="title-host"[^>]*?)(>)/, `$1 data-hidden$2`);
    html = html.replace(/\sdata-hidden\s+data-hidden/g, " data-hidden");
  }
  return html;
}

function build(projectDir) {
  const timelinePath = path.join(projectDir, "timeline.json");
  if (!fs.existsSync(timelinePath)) throw new Error(`missing ${timelinePath}; run parse + plan first`);
  const timeline = JSON.parse(fs.readFileSync(timelinePath, "utf8"));
  if (!timeline.cards || !timeline.cards.length) throw new Error("timeline has no cards; run `plan` first");
  setFormat(formatFromMeta(timeline.meta));

  const cards = timeline.cards;
  const lastCueEnd = timeline.cues.length ? timeline.cues[timeline.cues.length - 1].end : 0;
  const lastCardEnd = cards[cards.length - 1].end;
  const firstCard = cards[0].start;

  let endStart = round(Math.max(lastCardEnd + 0.24, lastCueEnd + 0.3, 4));
  const ENDCARD = 3.0;
  const total = round(endStart + ENDCARD);

  const TITLE_DUR = 3.6;
  const hideTitle = firstCard < TITLE_DUR + 0.2;
  const titleDuration = hideTitle ? 0.01 : TITLE_DUR;

  const compDir = path.join(projectDir, "compositions");
  fs.mkdirSync(compDir, { recursive: true });
  for (const file of fs.readdirSync(compDir)) {
    if (/^captions(-\d+)?\.html$/.test(file)) fs.rmSync(path.join(compDir, file));
  }

  const ids = [];
  for (let i = 0; i < cards.length; i += CARDS_PER_FILE) {
    const id = `captions-${String(ids.length + 1).padStart(2, "0")}`;
    ids.push(id);
    fs.writeFileSync(
      path.join(compDir, `${id}.html`),
      captionsFile(cards.slice(i, i + CARDS_PER_FILE), id),
      "utf8",
    );
  }

  const indexHtmlPath = path.join(projectDir, "index.html");
  const indexHtml = fs.readFileSync(indexHtmlPath, "utf8");
  fs.writeFileSync(
    indexHtmlPath,
    updateRoot(indexHtml, {
      endStart,
      total,
      titleDuration,
      hideTitle,
      hostsHtml: captionHosts(ids, endStart),
    }),
    "utf8",
  );

  fs.mkdirSync(path.join(projectDir, "notes"), { recursive: true });
  const report = timeline.report;
  const lines = [
    "# SRT report",
    "",
    `- Cues: ${report.cues}`,
    `- Cards: ${timeline.cards.length}`,
    `- Duration: ${report.duration} s → film ${total} s (end card 3 s)`,
    `- First card: ${firstCard} s`,
    `- Chapters (silence ≥ 0.9 s): ${timeline.chapters.length}`,
    `- Title scene: ${hideTitle ? "skipped (speech starts before 1.2 s)" : `${titleDuration} s`}`,
    `- Overlaps fixed: ${report.overlaps}`,
    `- Long cues: ${report.long}`,
    `- Fast cues (>${MAX_READ_SPEED} chars/s): ${report.fast}`,
    `- Latin-only cues: ${report.latinOnly}`,
    `- Bad encoding: ${report.badEncoding}`,
    "",
    "## Cards over reading speed",
    "",
    report.slowCards && report.slowCards.length
      ? report.slowCards.map((c) => `- ${c.id} — ${c.cps.toFixed(1)} chars/s — ${c.text}`).join("\n")
      : "- none",
    "",
    "## Chapters",
    "",
    timeline.chapters.length
      ? timeline.chapters.map((c) => `- ${c.at}s (silence ${c.during}s)`).join("\n")
      : "- none",
    "",
  ];
  fs.writeFileSync(path.join(projectDir, "notes", "srt-report.md"), lines.join("\n"), "utf8");

  console.log(`captions: ${cards.length} cards in ${ids.length} file(s)`);
  console.log(`film: ${total}s (captions until ${endStart}s, end card 3s)`);
  console.log(`wrote ${ids.map((id) => `compositions/${id}.html`).join(", ")} and patched index.html`);
}

/* -------------------------------------------------------------------- cli */

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function argValue(args, flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
}

function main() {
  const [cmd, target, ...rest] = process.argv.slice(2);
  if (!cmd) {
    console.log(
      "usage: srt.mjs parse|plan|build|all <file|project> [--out file] [--srt path] [--format 2x1|9x16]",
    );
    process.exit(1);
  }

  if (cmd === "parse") {
    if (!target) throw new Error("parse needs an .srt file");
    const fmtArg = argValue(process.argv.slice(2), "--format");
    if (fmtArg) setFormat(fmtArg);
    const timeline = parseSrt(target);
    const out = argValue(process.argv.slice(2), "--out") || path.join(path.dirname(target), "timeline.json");
    writeJson(out, timeline);
    console.log(JSON.stringify(timeline.report, null, 2));
    console.log(`wrote ${out}`);
    return;
  }

  if (cmd === "plan") {
    if (!target) throw new Error("plan needs timeline.json");
    const planned = planCards(readJson(target));
    const out = argValue(process.argv.slice(2), "--out") || target;
    writeJson(out, planned);
    console.log(JSON.stringify(planned.report, null, 2));
    console.log(`wrote ${out}`);
    return;
  }

  if (cmd === "build") {
    if (!target) throw new Error("build needs a project directory");
    build(path.resolve(target));
    return;
  }

  if (cmd === "all") {
    const dir = path.resolve(target);
    const srt = argValue(process.argv.slice(2), "--srt") || path.join(dir, "input", "script.fa.srt");
    if (!fs.existsSync(srt)) throw new Error(`missing SRT: ${srt}`);
    const timelinePath = path.join(dir, "timeline.json");
    if (fs.existsSync(timelinePath)) {
      /* Re-parse on the canvas the project already chose, unless --format says otherwise. */
      const prev = readJson(timelinePath);
      setFormat(argValue(process.argv.slice(2), "--format") || formatFromMeta(prev.meta));
    } else if (argValue(process.argv.slice(2), "--format")) {
      setFormat(argValue(process.argv.slice(2), "--format"));
    }
    writeJson(timelinePath, parseSrt(srt));
    writeJson(timelinePath, planCards(readJson(timelinePath)));
    build(dir);
    return;
  }

  throw new Error(`unknown command: ${cmd}`);
}

try {
  main();
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(1);
}
