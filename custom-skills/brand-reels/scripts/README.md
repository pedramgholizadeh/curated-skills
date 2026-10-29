# scripts/

The runnable studio. Copy these files into your project, then edit `brand.json` and write reel scenarios in `data/reels/`.

## Required project layout

The paths below are hard-wired into `render.mjs`, `engine.js` and `page.html`, so keep them exactly:

```
your-project/
├── brand.json               # copy scripts/brand.example.json → brand.json, then edit
├── assets/
│   ├── fonts/               # your text font + MaterialSymbolsRounded.woff2
│   └── logo.png             # referenced as brand.json.logo
├── data/
│   └── reels/
│       └── <key>.json       # one scenario per reel (see assets/scenario.example.json)
├── studio/
│   ├── engine.js            # canvas renderer — reads brand.json + reel json
│   ├── page.html            # font @font-face host + <canvas>
│   ├── score.js             # synthesized music bed + SFX (BPM-parametrized)
│   ├── audio.html           # headless host for score.js
│   ├── render.mjs           # the pipeline below
│   └── validate.mjs         # scenario linter
├── out/<key>/               # contact sheets, frames, score.wav (generated)
├── data/scores/<key>.m4a    # audio track (generated)
└── media/<key>.mp4          # final reel (generated)
```

Point `page.html`'s `@font-face` `src` URLs and `family` names at the fonts named in `brand.json` (`fonts.text`, `fonts.icon`).

## Dependencies

- **Node 18+**, `npm i puppeteer-core` (Chrome/Chromium found automatically; override with `--chrome=/path` or `CHROME_PATH`).
- **ffmpeg** on `PATH` for audio mastering and encoding.

## Commands

Run from your project root (`your-project/`). `<key>` is the filename under `data/reels/` without `.json`.

```bash
# Lint one or all scenarios against the grammar + brand copy rules
node studio/validate.mjs                      # all reels
node studio/validate.mjs coffee-roaster       # one key
node studio/validate.mjs --brand=acme         # read domain/cta from acme.json

# Contact sheet — eyeball every scene before a full render (fast)
node studio/render.mjs <key> --preview

# A single full-res frame (typo / safe-zone check). Value is seconds.
node studio/render.mjs <key> --frame=2.5

# Synthesized score → data/scores/<key>.m4a
node studio/render.mjs <key> --audio

# Full render: frames → out/<key>/frames, encode → media/<key>.mp4
node studio/render.mjs <key>

# Tuning flags
node studio/render.mjs <key> --fps=30 --workers=4 --range=0:6 --brand=acme
```

`--workers` caps parallel headless Chrome pages. Keep it around half your CPU cores so the machine stays usable. Frames are written individually and **resumable** — re-run and only missing frames render.

## Two gotchas

1. **Clear stale frames after shortening a reel.** Frame files are keyed by index, not time. If you cut `dur`, old frames get encoded past the new end. `rm -rf out/<key>/frames` before re-rendering.
2. **Never kill your own browser.** If a render hangs, target the headless instances only: `pkill -f "window-size=1080,1920"`.
