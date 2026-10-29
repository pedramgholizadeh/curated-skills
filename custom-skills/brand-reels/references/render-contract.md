# Render Contract

How the canvas engine and the Node renderer talk to each other, and the invariants that keep output deterministic.

## Engine globals

`scripts/engine.js` runs inside `page.html` (a 1080×1920 `<canvas id="out">`). On load it fetches the brand config and the scenario JSON, then exposes:

| Global | Meaning |
|---|---|
| `window.ready` | `true` once fonts + scenario are loaded. The renderer waits on this. |
| `window.renderAt(t, type, q)` | Advance the timeline to `t` seconds, paint one frame, return a data-URL. `type`/`q` are `toDataURL` args. |
| `window.renderSheet(ts, cols, w)` | Render the given timestamps into a contact-sheet data-URL (for fast review). |
| `window.ICONS_OK` | Whether the icon font actually resolved (so you can fail loudly if glyphs show as text). |
| `window.DUR` / `window.PROJECT` | Total duration / the parsed scenario. |

The scenario is fetched from `?reel=<key>`; the brand from `?brand=<name>` (default `brand`).

## The core invariant: a frame is `f(t)`

`renderAt(t)` must produce the **same pixels every time** for the same `t`. Consequences:

- No `Date.now()`, no `performance.now()`, no network inside draw code.
- No `Math.random()` per frame. If you need shake/jitter, seed it from `t` (e.g. a hash of the frame index), not from a live RNG.
- All easing is a pure function of local scene time `lt = t - sceneStart`.
- Fonts must be fully loaded before `ready` (await `document.fonts.load(...)` for every weight used, and the icon font), or metrics shift between runs.

The renderer captures frames at `fps` by calling `renderAt(i/fps)` for `i = 0..DUR*fps`, so this invariant is what makes parallel, resumable capture correct.

## Timeline math

`scripts/render.mjs` (and the engine) derive cut points from the scene `dur`s:

```
cuts[i] = sum of dur[0..i-1]
DUR     = sum of all dur
scene local time  lt = t - cuts[idx]     where idx is the last cut ≤ t
```

The audio cues (`score.js`) use the same `cuts`/`itemTimes` so hits land on scene changes and list reveals.

## Renderer (`render.mjs`) modes

```
render.mjs <key> --preview     contact sheet → out/<key>/sheet.jpg
render.mjs <key> --frame=2.0   single full-res PNG → out/<key>/frame-2.png (prints icons_ok)
render.mjs <key> --audio       synthesized score → data/scores/<key>.m4a (loudnorm -14)
render.mjs <key>               parallel resumable frame capture → ffmpeg encode → media/<key>.mp4
render.mjs <key> --encode      encode already-captured frames only
```

Key implementation notes:

- **Serves over a local HTTP server**, not `file://` — `fetch()` of the scenario/brand JSON and `@font-face` are blocked on `file://`.
- Launches headless Chrome via `puppeteer-core` with `--window-size=1080,1920 --force-device-scale-factor=1` and background-throttling disabled.
- Runs `--workers` (default 4) browser pages pulling from a shared frame queue; writes each frame to a `.tmp` then renames, so an interrupted run resumes without corrupting frames.
- **Clear the frame cache when the timeline changes.** Frames are cached as `f%05d.jpg`; if you shorten/lengthen a reel, stale frames beyond the new `DUR` will still be encoded. `rm -rf out/<key>/frames` before a re-render after any duration change.
- Encode: `libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart -threads 4`, muxing the m4a with `-shortest`.

## Dependencies & discovery

- Chrome path resolution order: `--chrome=`, `CHROME_PATH`, common macOS/Linux paths, then any Playwright-cached Chromium. Set `CHROME_PATH` if auto-detect fails.
- Only `puppeteer-core` is required (it does not download a browser — you supply Chrome/Chromium).

## Failure modes to watch

| Symptom | Cause | Fix |
|---|---|---|
| Icons show as `bolt`, `shield` | icon font not loaded / name typo | confirm `ICONS_OK`, use valid glyph names |
| Video longer than the scenario | stale frame cache after a duration edit | `rm -rf out/<key>/frames` |
| Text overlaps the progress bar | card area floor too low | raise the content floor (see design-system safe zone) |
| Different pixels each run | `Math.random()`/clock in draw code | seed from `t`, keep `f(t)` pure |
| Missing/wrong glyphs mid-word | font weight not awaited at boot | load every weight the scenario can use |
