---
name: persian-subtitle-films
description: Build Persian (RTL, Vazirmatn) subtitle films and Reels from an SRT using HyperFrames and HyperMotion — a token-driven brand look, a deterministic caption engine, motion recipes, capped rendering and visual QA on 2:1 (1920×960) or 9:16 (1080×1920) canvases. Use for any Persian or RTL video made from a transcript or subtitle file: subtitle films, voiceover explainers, launch clips, Instagram Reels, YouTube Shorts, talking-head edits with burned captions, or a transparent graphic overlay laid on top of the user's own footage.
sources:
  - video-generation/editing-workflows
  - video-generation/explainers
  - video-generation/motion-graphics
  - video-generation/cinematic-promos
  - ui-ux-skills/visual-design
  - custom-skills/cool-render
  - custom-skills/srt-caption-timing
---

# Persian subtitle films

One system for turning an SRT into a finished, on-brand Persian video: **the
canvas is code, the timeline is deterministic, and the SRT is the script.** Its
cues drive the captions, the scene rhythm and the total length. Nothing is
invented: no facts, no numbers, no footage, no external assets unless the user
supplies them.

The look is a token block, not a hard-coded brand. `brand.example.json` ships one
example palette (graphite ground, single mint accent); pass your own and every
template, host and composition is re-tokened at scaffold time.

## Two video types

| Type | What it is | Template | Read |
|---|---|---|---|
| **1 — Standalone film** | Full-frame video from the SRT: title, captions, end card, H.264 MP4. | `templates/video-2x1/` | this file + `references/srt-workflow.md` + `references/formats.md` |
| **2 — Overlay layer** | Transparent graphic layer composited **above the user's own footage**: liquid-glass cards, Material icons, typing, counters, SFX. WebM VP9 + alpha (ProRes 4444 blows any size budget). | `templates/overlay-2x1/` | `references/overlay.md` |

Type 2 never shifts the SRT and never paints a background. When the request says
"بالای ویدیوی اصلی" / "overlay" / "لایه روی ویدیو", build type 2.

## Non-negotiables

1. **Canvas comes from the format**, never from a 16:9 preset: `2x1` = 1920 × 960,
   `9x16` = 1080 × 1920, 30 fps unless the user says otherwise. The root element
   carries `data-width` / `data-height`; `srt.mjs --format` writes matching hosts.
2. **`<html lang="fa" dir="rtl">`** and `text-align: start`. All copy is Persian.
   Latin fragments (URLs, code, brand names) get `dir="ltr"` + `unicode-bidi: isolate`.
3. **Vazirmatn only** (100–900, self-hosted woff2 in `assets/fonts/`). No Google
   Fonts, no fallback Latin face, no letter-spacing on Persian words.
4. **Never split Persian text into letters.** Cursive shaping breaks. Animate whole
   words (`inline-block`, split on spaces only, ZWNJ stays inside the word).
5. **HyperFrames contract**: every timed element has `class="clip"`, `data-start`,
   `data-duration`; each composition registers `window.__timelines["<id>"]` after its
   tweens; no timers, no `Date.now()`, no unseeded `Math.random()`, no `repeat: -1`.
6. **One accent colour** — used on one word, one rule, one dot per beat. A second
   micro-accent may mark one word per shot, never more. No purple/blue gradients, no
   glass cards in a standalone film, no emoji.
7. **Facts are sacred.** Text comes from the SRT or from the user. Do not add
   numbers, claims, names or CTAs that are not in the source.
8. **Hold after landing**: a readable line holds ≥ `0.5 s + 0.3 s × words`; end card
   ≥ 2 s; caption groups never drift after landing.
9. **Check before render**: `npx hyperframes check --json` must pass, stills must be
   reviewed, then render. Never render from a failing composition.
10. **Thermal and size caps** (packaged as `custom-skills/cool-render` in this
    repository): run renders, snapshots and ASR through its `cool-run` wrapper with
    an explicit `--workers` count (never `auto`), one heavy job at a time, output
    CFR 30 fps and inside the delivery budget. Slow renders are the requirement,
    not the risk.

## Workflow

### 1. Intake (when the SRT arrives)

Ask at most these, in one message — skip anything already answered:

1. The `.srt` file (and the audio/video file if there is one).
2. The one sentence the viewer must remember.
3. Format: default **1920 × 960 (2:1)**; ask only if they named another ratio —
   Instagram Reels and Shorts need `9x16`.
4. Music/SFX: none by default; if they have a track, get the file.
5. The brand element to show: logo, site, handle or CTA — verbatim.

Then scaffold and work autonomously; do not pause per scene.

```bash
node <skill-dir>/scripts/new-video.mjs <slug> --format 2x1 --brand brand.json
# creates videos/<slug>/ from the template, re-tokened for your brand
```

Put the SRT at `videos/<slug>/input/script.fa.srt`. If the copy was corrected by
hand after an ASR pass and the media was sped up or jump-cut, re-time it first
with `custom-skills/srt-caption-timing` — this skill assumes the SRT is already on
the delivered media's clock.

Drop GSAP at `videos/<slug>/assets/vendor/gsap.min.js` (`npm i gsap@3` and copy
`node_modules/gsap/dist/gsap.min.js`). It is not shipped here: its licence does not
permit redistribution.

### 2. Parse and plan

```bash
node <skill-dir>/scripts/srt.mjs parse videos/<slug>/input/script.fa.srt \
  --out videos/<slug>/timeline.json --format 2x1
node <skill-dir>/scripts/srt.mjs plan videos/<slug>/timeline.json \
  --out videos/<slug>/timeline.json
```

`parse` normalises Persian characters, validates timings, strips SRT tags and
records the canvas in `timeline.meta`; `plan` groups cues into caption cards
(7 words / 68 chars / 2 lines on 2:1, 60 chars / 3 lines on 9:16), splits long cues,
merges gaps and derives scene boundaries from silences ≥ 0.9 s. Fix the report
before building — never silently drop a cue.

Write `SPEC.md` in the project root from `references/spec-template.md`: numbers for
the look, one line per scene, the frames to QA. Read `references/brand-look.md` for
the token roles and `references/formats.md` for canvas-specific geometry.

### 3. Build

```bash
node <skill-dir>/scripts/srt.mjs build videos/<slug>
```

Writes static caption groups into `compositions/captions-01.html`,
`captions-02.html`, … — six cards per file — adds one captions host per file to
`index.html` (all on track 20), sets the root / title / end-card durations, and
writes `notes/srt-report.md` with every timing it changed.

Then author the non-caption scenes by hand (`compositions/title.html`,
`compositions/endcard.html`, optional chapter cards, keyword chips) following
`references/hypermotion.md` and `references/srt-workflow.md`.

**If the user also supplied audio/video**, add it as a timed `<audio>` / `<video>`
in `index.html` (`id`, `data-start`, `data-duration`, `data-volume`; video gets
`muted` or `data-has-audio="true"`). Captions are authored from the SRT, not
re-transcribed.

### 4. Check and review

```bash
cd videos/<slug>
COOL=<cool-render-dir>/scripts/cool-run        # optional, see non-negotiable 10
$COOL npx hyperframes check --json
$COOL npx hyperframes snapshot --at 0.2,1.5,4,8 --out review/stills   # or --review
```

Look at the stills at 100%, at 1600 px and at 200 px wide. Persian must read
right-to-left, with no clipped descenders (ی، ج، ع), no cut ZWNJ, no flipped Latin
fragment, one card on screen at a time, and nothing over the subject's face.

Expected warnings: `timeline_track_too_dense` on a six-card captions file and
`film_silent` when no audio was supplied. Anything else, especially a lint
*error*, gets fixed before the next step. Then preview:

```bash
npx hyperframes preview --background
```

### 5. Render

```bash
cd videos/<slug>
COOL=<cool-render-dir>/scripts/cool-run
FIT=<cool-render-dir>/scripts/fit-size
$COOL npx hyperframes render -o renders/<slug>_<format>.mp4 --quality delivery \
  --workers 2 --video-bitrate 12M --max-bitrate 14M
$FIT renders/<slug>_<format>.mp4 200          # only if over budget
ffprobe -v error -show_entries stream=width,height,r_frame_rate,codec_name \
  -show_entries format=size -of json renders/<slug>_<format>.mp4
```

Keep `--workers` explicit and the bitrate capped; export CFR 30 fps; assert the
size after the fit. Type 2 renders to WebM with alpha instead — see
`references/overlay.md`.

Deliver: the MP4, the project folder, `brief.md`, `SPEC.md`, `timeline.json`,
`notes/srt-report.md` and the fonts licence note.

## Files

| Path | Read when |
|---|---|
| `references/brand-look.md` | Token roles, background, type scale, do/don't, exact numbers |
| `references/formats.md` | Choosing or adding a canvas; the 9:16 geometry and safe zones |
| `references/srt-workflow.md` | Persian caption rules, grouping, timing, emphasis, QA |
| `references/hypermotion.md` | Motion vocabulary, easing, RTL direction, per-scene recipes |
| `references/hyperframes-contract.md` | Attributes, timeline rules, per-format quirks, lint fixes |
| `references/spec-template.md` | Write `SPEC.md` before the first scene |
| `references/overlay.md` | Type 2: transparent layer, liquid glass, icons, typing, SFX, alpha render |
| `assets/hypermotion.js` | Motion helper used inside compositions |
| `assets/fonts/` | Self-hosted Vazirmatn woff2 + `vazirmatn.css` |
| `templates/video-2x1/` | Working starter project (title, captions, end card) |
| `templates/overlay-2x1/` | Working transparent overlay starter (glass chip + typing terminal) |
| `scripts/new-video.mjs` | Scaffold a project for a format and a brand file |
| `scripts/srt.mjs` | Parse / plan / build an SRT into caption compositions |
| `scripts/fetch-icons.mjs` | Download Material Symbols SVGs and regenerate `modules/icons.js` |
| `brand.example.json` | Shape of the brand file passed to `new-video.mjs` |
| `examples/sample.fa.srt` | Parser smoke test |

## What this skill does not ship

Redistribution rules, not laziness — restore these before the first render:

| Missing | Why | Restore |
|---|---|---|
| `assets/vendor/gsap.min.js` (3 copies in the private original) | GSAP's no-charge licence covers use, not redistribution | `npm i gsap@3`, copy `node_modules/gsap/dist/gsap.min.js` into each project's `assets/vendor/` |
| `templates/overlay-2x1/assets/audio/*.mp3` (5 files) | Mixkit's licence allows using the sounds in your work, not sharing the files | see `templates/overlay-2x1/assets/audio/README.md` for the exact filenames and sources |

Everything else — fonts (OFL), Material icons (Apache-2.0), `hypermotion.js`, all
scripts and references — ships complete.

## About "HyperMotion"

There is no production npm package named `hypermotion` (the registry entry is an
unreleased React experiment). In this skill **HyperMotion** is the project's own
deterministic GSAP motion layer: `assets/hypermotion.js`, loaded inside every
HyperFrames composition, built on the GSAP timeline HyperFrames already seeks.
Use it; do not install an npm package by that name.

## One-line brief for the agent

> Read the SRT, pick the canvas, plan the cards, write `SPEC.md`, build the
> HyperFrames project in Vazirmatn RTL on the brand's tokens, check, review stills,
> render capped and small.
