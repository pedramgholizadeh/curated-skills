---
name: video-production
description: "Make finished videos in code: launch promos, 45–90s product explainers, 9:16 reels, UI/motion-graphic effects, kinetic-type reels, chart animations, and edits of existing footage. Covers brief intake and beat sheets, brand-token visual systems, deterministic frame rendering (self-contained HTML with window.seek(t) + Playwright, or Remotion), camera/easing craft, real SFX and beat-synced sound design, QA on exported frames, and platform-correct H.264 exports with Reels/TikTok safe zones. Use when asked to make, plan, fix, review, or export any video, reel, promo, demo, motion graphic, or launch film."
license: Synthesized from public skill packs — see references/sources.md
sources:
  - video-generation/cinematic-promos
  - video-generation/explainers
  - video-generation/motion-graphics
  - video-generation/editing-workflows
  - video-generation/ai-video-generation
  - video-generation/openmontage
---

# Video production

One operating manual for taking a video from a sentence to a delivered file: brief → story → visual system → build → sound → QA → export. Every frame is code, so every frame is reproducible and revisable.

Read this file first. Load only the reference files the current stage needs.

---

## 0. Ground rules (these override convenience)

1. **Facts are sacred.** Never invent a price, date, count, rating, testimonial, customer name or result. Numbers come from the user or the product's own site; illustrative numbers get an on-frame `EXAMPLE` / `SCHEMATIC` label. If you need a metric and don't have it, show relative bars, progress or skeleton lines instead.
2. **Every frame is a pure function of time.** `frame(t)` must render correctly in any order, any number of times. No `Date.now()`, no unseeded `Math.random()`, no CSS animations, no `setTimeout`, no state carried between frames. Bake simulations once at load, then interpolate.
3. **One thing at a time.** One line of text *or* one UI moment per scene, one hero object per shot, one accent colour, one animated idea per beat. A static frame reads as a bug — something small must always be alive, but only one thing may be the focus.
4. **The look grows out of the product.** Extract the product's real type, colour, radius, spacing and material tokens and reuse them. Never bolt on a generic "promo skin". If there is no brand at all, use the labelled Apple-style default in `references/visual-system.md` and say so.
5. **Hold after every landing.** Text that lands holds ≥1.2s (brand lockup ≥1s, end card ≥3s). Feedback is always "too fast", never "too slow" — budget hold frames before you lay the timeline.
6. **Watch it before you claim it works.** You cannot hear and you cannot trust a single mid-frame. Render stills at every beat, a filmstrip across every cut, check the exported file with ffprobe, and hand the last review to a clean-context agent.
7. **Ship the source.** Deliver the render *and* the thing that made it (HTML page or Remotion project) plus the beat sheet, so the user can change one word without you.
8. **Half CPU, 200 MB, 30 fps — safe defaults.** Run every render, transcode and ASR job at ≤50% CPU: never `--workers auto`, always an explicit capped `-threads`/worker count, one heavy job at a time, so the machine stays cool — slow is fine. Keep every delivered file under 200 MB at 30 fps CFR. Raise a cap only when the user asks. The `cool-render` skill in this repository's `custom-skills/` packages the same caps as runnable helpers; here the caps are written out so this skill works on its own.

---

## 1. Route the job first

Identify what is being made before touching a frame. Do not blend formats; each has its own engine default, length and pacing.

| The ask | Deliverable | Default engine | Length | Read |
|---|---|---|---|---|
| "Launch / promo / trailer" | one sentence across scenes, product screens, CTA | HTML `seek(t)` | 30–45s | `references/story.md` §launch |
| "Product demo / how it works / explainer" | UI rebuilt clean, filmed close while used | HTML `seek(t)` | 45–90s | `references/story.md` §explainer |
| "Motion graphic / logo sting / UI effect" | one object changing shape, loop or hold | HTML `seek(t)` | 6–10s | `references/motion.md` |
| "Reel / TikTok / Shorts" | 9:16, hook in 2s, safe-zone text | HTML `seek(t)`, vertical comp | 12–30s | `references/story.md` §short, `references/export.md` |
| "Kinetic type / showreel" | type is the hero, chapters, beat-locked | HTML `seek(t)` or Remotion | 15–90s | `references/motion.md` §type |
| "Chart / stat / data story" | one figure, count-up, honest axes | Remotion or HTML | 5–15s | `references/motion.md` §data |
| "Edit this footage / add B-roll / captions / make it vertical" | cut, reframe, overlay, mix | ffmpeg (+ optional HTML overlays) | source length | `references/export.md` |
| "Talking avatar / generative video from a prompt" | AI-generated footage | provider/MCP tool | varies | out of core scope: use the provider, then QA here |

**Working mode** — pick one, state it, and don't drift:

- **Replica**: reproduce an existing template/shot card faithfully, re-skinned with the user's content.
- **Autonomous** (default when the user says "just do it"): decide direction, asset strategy and cut yourself; record the decisions in `brief.md`; don't stop at intermediate gates.
- **Co-creation**: pause for sign-off on brief, beat sheet, and final cut only. Never pause per shot.

If the product is a real page/app, do a **read-only inspection first** (URL, repo, screenshots): positioning, main flows, visual system, showable states, sensitive data. Don't modify the product.

---

## 2. Brief → beat sheet

Ask everything in **one** message (≤6 questions), then work. Only the subject is required; decide the rest yourself and state what you chose.

1. **What it is**, one line, plus a URL/repo if it exists.
2. **The one thing** the viewer must remember, in their words.
3. **Proof**: real screenshots, results, testimonials — attached or linked, with sources.
4. **CTA**, word for word, exactly as it appears on the sales page.
5. **Brand**: hex codes, font, logo file — or "read it off the site".
6. **Format**: 16:9 1920×1080, 4:5 1080×1350, 1:1 1080×1080, or 9:16 1080×1920; plus length and any music.

Then write `videos/<slug>/brief.md` (one page) and `beat-sheet.md` with **one row per moment**: `time | on-screen words | what moves / what is on screen | sound`. Sum the times against the length budget before building. Show the beat sheet for a yes in co-creation mode; otherwise proceed.

Never open a browser window "just to look". Inspect via stills you render yourself.

---

## 3. Visual system

Before designing a shot, write `design-spec.md` from the product's own material (site CSS, screenshots, brand files, app theme):

- fonts (family, weights, tracking, line-height), type scale
- palette **by role**: ground, surface, ink, muted, accent, second accent, success/warn
- grid, margins, spacing rhythm, radii, border weights
- material: flat / soft-shadow / glass; gradients and how they're drawn
- motion tone in three words (e.g. "calm, precise, tactile")
- what is banned for this brand

Rules: at most two accents; highlight washes at 15–20% accent opacity; gradients drawn on canvas once, not live CSS blur; large text tight tracking; labels never below 34px at 1080p; headline ≥120px in kinetic shots. Full defaults and the Apple-style fallback palette are in `references/visual-system.md`.

---

## 4. Build

Three engines, one contract. Pick by deliverable, not by habit:

- **A. HTML `seek(t)` + Playwright + ffmpeg** — default for promos, explainers and motion graphics. Zero framework, full control, renders deterministically. Contract and renderer in `references/render.md`, helper library in `assets/motion.js`, renderer in `assets/render-html.mjs`.
- **B. Remotion** — when the piece is long, data-driven, needs captions/voice-over sync, or already lives in a React repo. Rules in `references/render.md` §remotion.
- **C. ffmpeg** — for cutting existing footage, reframing, overlays, mixing and platform encodes. Recipes in `references/export.md`.
- **D. HyperFrames** (`npx hyperframes`) — only if already installed or the user names it; otherwise don't add a dependency.

Non-negotiables for all engines:

- **One clock.** A single timeline value drives everything; text, camera, audio and effects read the same numbers.
- **Embed fonts** (base64 woff2) and explicitly load *every* font before the first frame — including fonts used only in later scenes.
- **Inline images**; no network at render time.
- **Scene layers get transparent backgrounds** and one stage behind them owns the base colour, so ordering bugs can't hide content.
- **Camera is an editor, not a decoration.** Each scene is a layer with its own camera wrapper (`translate/scale/rotate`); between scenes use a move or a 0.3–0.4s soft blur-dissolve, not a random transition.
- **Determinism:** seeded RNG (mulberry32) with the seed derived from the element index; clamp math that can go negative (radii, `pow()`, filter params).

---

## 5. Motion grammar (the short version)

- **Easing:** ease-in-out cubic for cameras, expo-out for entrances, spring with damping for objects. Nothing linear except progress bars; nothing bouncy in "premium" pieces.
- **Springs:** `w` 8 slow / 14 normal / 22 snappy; `z` 0.82 slight settle, ≥0.95 no overshoot for cameras.
- **Timing:** entrance 0.3–0.6s, camera move 0.6–1.2s, hold ≥1.2s, end card ≥3s. Stagger siblings by 1–2 frames, never all at once.
- **Continuity:** zoom through the object the eye is already on, iris from the thing that just lit, match-cut on a shape. Hard cut + impact only at chapter slams (≤3 per piece).
- **Type:** one headline, one support line max. Big English headlines, small mono labels for HUD/meta. Kinetic shots: ≤5 words on screen.
- **UI:** rebuild real interfaces as clean vector UI rather than blurry screenshots when the source is available; keep labels, colours and radii accurate; type at ~25 chars/s; cursor arrives a beat before it clicks, dips on press, ripples softly.
- **Never:** typewriter reveals on headlines, glow spam, floating elements with no environment, emoji, clip-art icons, grey placeholder bars, decorative glints across a whole batch.

More detail, including the 16 effect recipes and data-viz rules: `references/motion.md`.

---

## 6. Sound

Real recorded SFX, **never synthesized beeps**. Build the cue list from the same timeline that draws the picture, then mix to a measured target.

- Cue → category: movement/cut → whoosh; appear → pop; click → click; typing → typing; build → riser (ends on the hit); reveal → impact; success → pop/ding; error → glitch; minor UI → tick.
- Music first: measure BPM/phase, verify the grid against the kick drum (librosa can lock onto the off-beat), then land cuts and reveals on beats. If you can't retime the animation, shift the music offset instead and report the error in ms.
- Mix: voice > SFX > music; music bed ~-12dB under SFX, ducks 8–12dB under voice; target ≈ **-16 LUFS integrated** (≈-14 for social), true peak ≤ **-1.5 dBFS** (−4 for headroom-heavy pieces). Measure the exported MP4, never the intermediate WAV.
- Deliver two cuts when a track was supplied: with music, and SFX-only.
- Licence hygiene: CC0 / Mixkit-free / Pixabay only; never redistribute a Mixkit file inside your deliverable; write `CREDITS.txt` and `SOUND.md`.

Full cue tables, library rules and commands: `references/sound.md`.

---

## 7. QA — before anyone else sees it

This is not optional and not a vibe check.

1. **Stills per beat** — one frame per beat-sheet row, contact sheet, look at all of them. Look for clipped/overlapping text, empty frames, off-brand colour, bad framing.
2. **Boundary filmstrip** — seek ±0.15s around every cut and across every loop seam. Adjacent frames must match; a pop at a boundary is a bug you cannot see in a single still.
3. **Legibility at three sizes** — full size, 1600px wide, and 200px wide (phone thumbnail). If the hook doesn't read at 200px, redesign it.
4. **Muted check** — play it with sound off: the story must still land.
5. **File check** — ffprobe codec/range/colorspace/fps/audio; extract four frames across the file, detect black frames and clipping.
6. **Independent review** — dispatch a clean-context subagent with: the cut, the beat sheet, the brief, key frames, and the checklist in `references/qa.md`. It reports problems with timestamps and evidence. Fix, re-render, don't debate.

Slideshow risk: if more than ~20% of runtime is still images with only fades, or two adjacent scenes share the same layout, rebuild the motion before exporting.

---

## 8. Export and deliver

| Profile | Size | Notes |
|---|---|---|
| YouTube / web landscape | 1920×1080 | master CRF 16–18 |
| Shorts / Reels / TikTok | 1080×1920 | safe zone y 360–1420, right 120px clear |
| Feed square | 1080×1080 | |
| LinkedIn portrait | 1080×1350 | |
| Cinematic | 2560×1080 | |

Encode: H.264 High, `yuv420p`, `bt709` + TV range, `-movflags +faststart`, AAC 192k (128k for web), 30fps (60 for motion-heavy). One master encode; derive web copies by downscaling, never re-crop blindly.

Deliver a folder: `renders/` (mp4, silent cut, poster frame), source project, `brief.md`, `beat-sheet.md`, `design-spec.md`, `CREDITS.txt`, and a 5-line note saying what is placeholder and what to change for v2.

Commands, safe-zone overlay recipe and ffprobe acceptance test: `references/export.md`.

---

## 9. Preflight (do this before promising a render)

```bash
command -v ffmpeg node python3
node -e "require.resolve('playwright')" 2>/dev/null && echo playwright-ok \
  || echo "npm i playwright (then PW_CHANNEL=chrome reuses installed Chrome, no browser download)"
```

Ask before installing anything. If a tool is missing, say what is missing and what it costs in time — don't silently substitute a worse path.

---

## When to use / see also

- Any video, reel, promo, demo, motion graphic or launch film: start here.
- For render/transcode jobs that must not cook the machine, the `cool-render` skill in this repository's `custom-skills/` turns ground rule 8 into runnable helpers.
- If the target is a **Persian / RTL subtitle film** (for example a 2:1 caption film built from an SRT), see the `persian-subtitle-films` sibling skill in the same `custom-skills/` family — it owns the RTL caption engine and font setup; this skill owns everything else.

---

## Files in this skill

| File | Read when |
|---|---|
| `references/story.md` | Writing the script, hook, beat sheets, per-format structure |
| `references/visual-system.md` | Choosing tokens, palettes, type, materials |
| `references/motion.md` | Designing shots, effects, transitions, charts, type motion |
| `references/sound.md` | Cue lists, beat sync, mixing, licences |
| `references/render.md` | The `seek(t)` contract, renderer usage, Remotion rules |
| `references/export.md` | ffmpeg recipes, platform profiles, safe zones, ffprobe test |
| `references/qa.md` | Review checklist and the independent-review prompt |
| `references/sources.md` | Provenance and licences of the source packs |
| `assets/motion.js` | Spring/eased/keyframed helpers for HTML builds |
| `assets/starter.html` | Working 10s `seek(t)` page with camera, scene fades, preview scrubber, `?render` + `?t=` stills |
| `assets/render-html.mjs` | Playwright frame renderer with motion blur and audio |
