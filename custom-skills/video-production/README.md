# video-production

One operating manual for finished video made in code, end to end: brief → story → visual system → build → sound → QA → export. It routes a job (promo, explainer, motion graphic, reel, kinetic type, chart, footage edit), then prescribes beat sheets, brand-token design specs, a deterministic `window.seek(t)` page contract, camera/easing grammar, measured sound design, frame/file QA and platform-correct H.264 export.

**Prerequisites:** Node 20+, `ffmpeg` on PATH, Playwright (`npm i playwright`) or Puppeteer, and a Chromium/Google Chrome binary (Playwright can reuse an installed Chrome via `PW_CHANNEL=chrome`). `python3` + `librosa` only help with beat detection.

**Nothing was trimmed for size:** every file here is small (largest ≈ 15 KB), so all eight reference docs and all three assets ship in full — no media, fonts or sample renders are bundled. Personal and machine-specific paths were generalized; `<skill-dir>` means the directory this skill is installed in.

| Path | Contents |
|---|---|
| `SKILL.md` | Ground rules, job-routing table, the seven pipeline stages, preflight |
| `references/` | `story.md`, `visual-system.md`, `motion.md`, `render.md`, `sound.md`, `qa.md`, `export.md`, and `sources.md` — provenance plus licence caveats for every upstream pack this skill consolidates |
| `assets/` | `starter.html` (working 10s `seek(t)` page), `motion.js` (spring/keyframe helpers), `render-html.mjs` (Playwright → ffmpeg renderer) |

Run the renderer from the project you are building, e.g. `node <skill-dir>/assets/render-html.mjs src/index.html renders/draft.mp4 30 1 2` — keep worker counts at or below half your cores (ground rule 8).
