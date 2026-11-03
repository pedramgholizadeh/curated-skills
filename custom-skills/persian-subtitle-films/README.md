# Persian subtitle films

A production workflow skill: an SRT in, a finished Persian video out — captions,
title, end card, motion and a capped render, all authored as HTML and rendered
frame-by-frame by [HyperFrames](https://github.com/heygen-com/hyperframes).

The brand is a token block, not a hard-coded identity. `brand.example.json` shows
the shape; `scripts/new-video.mjs --brand` writes it into the scaffold, so nothing
downstream has to know the palette. Two canvases ship: `2x1` (1920 × 960) and
`9x16` (1080 × 1920, Instagram Reels / YouTube Shorts) — see
`references/formats.md`.

## Prerequisites

- Node 20+, `ffmpeg` on PATH.
- `hyperframes` (Apache-2.0) — `npx hyperframes@0.9.8 check|snapshot|render`.
- GSAP 3, installed locally into `assets/vendor/gsap.min.js` (not redistributed here).
- Optional but recommended: the `cool-render` skill in this repository, which
  wraps renders and encodes at half CPU with a size and frame-rate cap.

## Contents

| Path | What it is |
|---|---|
| `SKILL.md` | the workflow: intake → parse → plan → build → check → render |
| `scripts/srt.mjs` | SRT → caption compositions, format-aware |
| `scripts/new-video.mjs` | scaffold a project for a format and a brand file |
| `scripts/fetch-icons.mjs` | pull Material Symbols SVGs for overlay projects |
| `assets/hypermotion.js` | the deterministic GSAP motion layer |
| `assets/fonts/` | Vazirmatn 100–900 woff2 + `vazirmatn.css` (OFL) |
| `templates/video-2x1/` | working standalone film project |
| `templates/overlay-2x1/` | working transparent overlay project |
| `references/` | brand look, formats, SRT rules, motion, HyperFrames contract, spec template, overlay |
| `brand.example.json` | the brand file shape |
| `examples/sample.fa.srt` | parser smoke test |

Trimmed for licensing, with restore steps in `SKILL.md`: GSAP builds and the five
Mixkit sound effects used by the overlay template. Fonts (OFL) and Material
Symbols icons (Apache-2.0) ship complete.
