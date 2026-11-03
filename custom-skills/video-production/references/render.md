# Render engines and the page contract

Two first-class engines. Pick once, early, and don't mix them in one piece.

| Situation | Engine |
|---|---|
| Promo, explainer, motion graphic, reel, kinetic type — you control all visuals | **HTML `seek(t)`** |
| Piece lives in a React repo, needs props/data at build time, long with captions/VO | **Remotion** |
| Existing footage needs cutting, reframing, overlays, mixing | **ffmpeg** (can wrap an HTML overlay) |
| A HyperFrames project already exists | Use it; don't add it just to add it |

Project layout either way:

```
videos/<slug>/
  brief.md  beat-sheet.md  design-spec.md
  src/                     index.html  or  remotion/ (package.json, src/)
  assets/                  fonts/ images/ sfx/ music/
  renders/                 draft.mp4 master.mp4 silent.mp4 poster.jpg
  qa/                      stills/ filmstrip/ ffprobe.txt
```

---

## A. HTML + `window.seek(t)`

One self-contained file. Inline CSS/JS, embedded fonts, inlined images, no network requests.

Start from `assets/starter.html` — it already implements the contract, a camera push, scene fades, a preview scrubber, `?render` mode and a `?t=` still for quick Chrome screenshots. Replace its sample copy and timings; keep the plumbing.

### The contract

```js
window.VIDEO = { w: 1920, h: 1080, duration: 45, fps: 30 };

// Pure function of time. Draws the exact frame for t (seconds).
// Called in any order, any number of times. No state from the previous call.
window.seek = (t) => { /* ... */ };

// Optional: schedule the whole soundtrack from 0 on any (Offline)AudioContext.
window.buildAudio = async (ctx) => { /* ... */ };
```

- `?render` in the URL: no controls, no scaling; the stage is exactly `w × h` at the top-left. Without it: fit to window with preview controls and a scrubber.
- No CSS transitions/animations, no `setTimeout`, no unseeded randomness.
- Layout measurement inside `seek` (`offsetLeft`, `measureText`) is fine — it is deterministic.
- History-dependent things (lagging camera, particles with velocity) are **baked once** at load by stepping 0→duration at 1/240s, then read back with interpolation.
- Loops: `t % duration`; draw seam-straddling effects at both ends.
- Scene layers are transparent; one stage background behind them owns the base colour.
- Preload every font face before the first frame; the first render must not use a fallback.
- Keep the beat sheet as a comment at the top of the script.

### Helper set

Copy `assets/motion.js` next to the page (`<script src="motion.js"></script>` or inline it). It provides `spring`, `track`, `kf`, `ease`/`expoOut`/`backOut`, `seg`, `lerp`, `clamp`, `rng` (mulberry32), `stagger`, `countUp`, `typed`.

Canonical patterns:

```js
// camera as a wrapper element
const cam = kf([[0, {x:0,y:0,s:1}], [3.2, {x:0,y:0,s:1.18}], [6, {x:0,y:0,s:1}]])(t);
el.style.transform = `translate(${cam.x}px,${cam.y}px) scale(${cam.s})`;

// typing from a timeline
el.textContent = full.slice(0, Math.floor(25 * (t - t0)));
```

### Render

```bash
npm i playwright && npx playwright install chromium     # once
# or, reuse the installed Chrome instead of downloading Chromium:
npm i playwright && PW_CHANNEL=chrome node assets/render-html.mjs src/index.html renders/draft.mp4 30 1 4
node assets/render-html.mjs src/index.html renders/draft.mp4 30 1 4     # 30fps, no blur, 4 workers
node assets/render-html.mjs src/index.html renders/master.mp4 60 4 8    # 60fps, 4 subframes, 8 workers
node assets/render-html.mjs src/index.html qa/stills.png --stills 0.5,2.4,6.1,9.8

# CPU-capped equivalents (the fast lines above saturate every core; on a laptop keep workers
# at ≤50% of cores and one heavy job at a time — same output, much slower):
node assets/render-html.mjs src/index.html renders/draft.mp4 30 1 2     # 30fps, 2 workers
node assets/render-html.mjs src/index.html renders/master.mp4 60 4 4    # keep 60fps/blur, halve workers
# ffmpeg inside the renderer is single-threaded per segment, so the worker count *is* the CPU cap.
```

The renderer opens `?render`, waits for `window.VIDEO` and `seek`, drives `window.seek(f/fps)` per frame, encodes segments with libx264, concatenates, then renders `buildAudio` through an `OfflineAudioContext` and muxes with `loudnorm`.

Notes:

- Quick still without Playwright (headless Chromium/Chrome, uses the `?t=` hook in the starter). Point `$CHROME` at the browser binary on your machine — `command -v chromium` / `command -v google-chrome` on Linux, `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` on macOS, the equivalent `chrome.exe` path on Windows:
  `"$CHROME" --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=1920,1080 --screenshot=qa/f.png "file://$PWD/src/index.html?render&t=4.5"`
- Motion blur multiplies render time by the subframe count; a 60s piece at 60fps ×4 can take 20–60 min on a laptop. Say so before starting.
- Big CSS `filter: blur()` and full-screen gradients are capture killers — draw once to canvas.
- If a still comes back black, it's usually a capture artifact from `foreignObject`; retry with a plain element stage before debugging the design.
- Frame f is rendered at `f/fps`; a loop's last frame should equal the first, so render `N = round(duration*fps)` frames and check the seam.

---

## B. Remotion

Rules that matter most in practice:

- **`useCurrentFrame()` is the only clock.** Everything derives from it; no `Date.now()`, no `Math.random()` (use `random()` with a seed).
- **`interpolate` + `Easing`** for keyframed values; `spring({frame, fps, config})` for objects. Clamp extrapolation.
- **`Sequence` / `Series`** for layout; `premountFor`/`postmountFor` when a transition needs both scenes mounted.
- **`staticFile()`** for assets; `@remotion/google-fonts` or a local `@font-face` in a `Font` component; `delayRender`/`continueRender` for async prep.
- **Composition metadata**: `calculateMetadata` when dimensions or duration depend on props; `zod` schema for props so the piece is re-renderable with different content.
- **Audio**: `<Audio>`/`<OffthreadVideo>`; trim with `startFrom`/`endAt`; `@remotion/media-utils` for duration and waveforms; `<Captions>` or custom subtitle data for subtitles.
- **Transparency**: render ProRes/WebM with alpha via `<AbsoluteFill>` and `--codec=prores --prores-profile=4444`, or `vp8`/`vp9` with alpha.
- **Performance**: avoid re-rendering the whole tree per frame; memoize static layers, use `useVideoConfig`, avoid huge CSS filters. Prefer transform + opacity.
- **Render**: `npx remotion render src/index.tsx CompId out.mp4 --codec=h264 --crf=16 --concurrency=8`, stills with `npx remotion still`, and `--props` JSON for variants. On a laptop, cap it instead: `--concurrency=4` (about half the cores) — same output, slower; `--concurrency` defaults to every core.
- **Licensing**: Remotion is free for individuals and small teams; companies may need a paid licence. Mention it when the user asks about commercial use.

Do not mix Remotion's `useCurrentFrame` with an HTML `seek` clock inside one composition.

---

## C. ffmpeg

For edits, reframes, overlays, mixes and final encodes. See `references/export.md` for the full recipes: overlay-on-vertical, safe-zone encoding, web copies, GIF, silence detection, black-frame detection.

Guiding rules:

- Decode → filter → encode once; avoid generating intermediate files for every step.
- Keep a master at CRF 16–18 and derive platform copies from it.
- `-movflags +faststart` on anything that will be uploaded.
- `fps` filter before `scale` when synthesizing overlays from a still.

---

## D. Preflight and failure modes

| Symptom | Cause | Fix |
|---|---|---|
| First frame in wrong font | font not used/loaded before first `seek` | preload all faces, `document.fonts.ready` |
| Blank page | duplicate `const`/name across pasted helpers | one declaration per name; read the console error |
| Elements in one corner after resize | fixed coordinates | scale the whole drawing to the frame |
| Stutter at cut | scene unmounted/remounted | keep layers mounted, animate visibility/opacity |
| Colours washed out on upload | full-range or non-bt709 encode | re-encode with `-color_range tv -colorspace bt709` |
| Audio clips on phone | true peak too high after AAC | target ≤ −1.5 dBTP and re-measure the MP4 |
| Loop pops | seam not drawn at both ends | render frame 0 == frame N and compare |
| Every frame identical | capture helper never called `seek` | seek inside the screenshot helper, then verify frame 0 vs frame 0.7×duration differ |
| Output shorter/longer than expected | `N` rounded from duration × fps | probe `nb_read_frames` and compare to `round(duration*fps)` |
