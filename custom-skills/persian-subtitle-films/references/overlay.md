# Overlay video (type 2) — transparent graphic layer

The second deliverable type: a **transparent 1920 × 960 graphic layer** that sits
above the user's own footage in their editor. It is not a standalone film — the
main video supplies the picture and the voice; this layer supplies chips, glass
cards, icons, counters, typing and SFX.

```
MAIN VIDEO (user's footage + voice)
        ↕ composite in Premiere / Resolve / FCP / CapCut
OVERLAY   (this render: ProRes 4444 alpha or WebM alpha + SFX)
```

Deliver **both**:

| File | Use |
|---|---|
| `renders/<slug>_2x1_alpha.mov` | ProRes 4444 with alpha — editing master |
| `renders/<slug>_2x1_alpha.webm` | VP9 alpha — web / browser / OBS |

## 1. Timing is the source SRT, unshifted

A standalone film shifts the SRT to make room for its own title card. The
**overlay never shifts**: its cue times must line up with the footage the user
already cut. Time every beat against the original SRT times, not the corrected
copy that may have been shifted for type 1.

- Root `data-duration` = the main video's exact length (last cue end).
- Every beat is a `.clip` with `data-start` / `data-duration` in video seconds.
- Leave 0.4–0.6 s of air before the first beat; never start a beat on frame 0
  unless the footage already has a title on screen.

## 2. Canvas and transparency

```html
<html lang="fa" dir="rtl">
  <style>
    html, body { background: transparent; }
    #root { background: transparent; }
  </style>
```

Rules:

- Nothing full-frame may carry a background colour, image or gradient.
- No `backdrop-filter`: it cannot blur the user's footage when the layers are
  composited later — the browser would only blur an empty transparent stage.
- Keep every graphic inside the safe area: **96 px** from every edge.
- Stay out of the middle third of the frame. The subject's face lives there.
  Anchor beats to corners and to a bottom strip.

## 3. Liquid glass (the house material)

Every box is liquid glass with **exactly `border-radius: 5px`** — cards, chips,
nested nodes, pills. One value everywhere.

The effect is three stacked ideas: a smoky translucent base for guaranteed
contrast, a white top-light gradient for the glass surface, and animated
caustics + a one-shot specular sweep for the "liquid" part.

```css
.glass {
  position: relative;
  border-radius: 5px;
  background:
    /* 1. smoke: guarantees white text over bright or busy footage */
    linear-gradient(135deg, rgba(19,22,22,.62) 0%, rgba(14,16,16,.48) 46%, rgba(21,25,24,.58) 100%),
    /* 2. glass surface */
    linear-gradient(135deg, rgba(255,255,255,.20) 0%, rgba(255,255,255,.06) 38%, rgba(255,255,255,.12) 100%);
  border: 1px solid rgba(255,255,255,.26);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.62),
    inset 0 0 0 1px rgba(255,255,255,.05),
    inset 0 -24px 44px rgba(0,0,0,.12),
    0 24px 60px rgba(0,0,0,.42),
    0 4px 12px rgba(0,0,0,.22);
  overflow: hidden;
  isolation: isolate;
}

.caustic { /* mint + salmon light pooled inside the glass */
  position: absolute; inset: -30%; pointer-events: none;
  background:
    radial-gradient(42% 58% at 28% 24%, rgba(85,230,165,.30), transparent 70%),
    radial-gradient(46% 62% at 76% 80%, rgba(240,143,116,.20), transparent 72%),
    radial-gradient(60% 80% at 55% 45%, rgba(255,255,255,.10), transparent 70%);
  filter: blur(16px);
}

.noise { /* 5% fractal grain kills banding */
  position: absolute; inset: 0; opacity: .055; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>");
}

.sheen { /* one specular pass on entrance */
  position: absolute; top: -30%; bottom: -30%; width: 38%; pointer-events: none;
  background: linear-gradient(105deg, transparent 0%, rgba(255,255,255,.38) 48%, transparent 100%);
  transform: skewX(-14deg); filter: blur(2px);
}
```

Animate it — the glass must never be dead:

```js
// caustic drift for the whole beat
tl.fromTo(root + " .caustic", { x: -16, y: -10 }, { x: 20, y: 10, duration: beatLen, ease: "sine.inOut" }, at);
// one sheen pass, 1.1 s, on entrance
tl.fromTo(root + " .sheen", { x: -340 }, { x: 760, duration: 1.1, ease: "power2.inOut" }, at + 0.35);
```

## 4. Icons — Material Symbols, inlined

Use Google Material Symbols **Outlined** SVGs from
`github.com/google/material-design-icons`:

```
https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/<name>/materialsymbolsoutlined/<name>_24px.svg
```

Download once into `icons/<name>.svg`, then generate a module so the render has
no network:

```bash
node -e '...'   # see templates/overlay-2x1/modules/icons.js
```

```js
window.icon("terminal");      // returns <svg class="mi" viewBox="0 -960 960 960">…
```

```css
.mi { width: 1em; height: 1em; fill: currentColor; display: block; }
.ico { color: var(--color-accent); }   /* size with font-size */
```

Good pairs: `movie_edit` (editing), `terminal` (FFmpeg/code), `graphic_eq`
(audio/wave), `subtitles` (SRT), `monitor` + `speed` (resolution/FPS),
`account_tree` (tool selection), `animation` (motion/render), `neurology` /
`psychology` (understanding), `bolt` (model/brand), `verified` (done).

Never mix icon families, never use emoji, never redraw Material paths.

## 5. Typing

Two different engines, because Persian is cursive.

**Latin / code / numbers** — per-character staggered opacity. Build the spans at
load so the full width is reserved and nothing reflows:

```js
node.querySelectorAll("[data-text]").forEach((n) => {
  const text = n.getAttribute("data-text");
  n.textContent = "";
  for (const ch of text) {
    const s = document.createElement("span");
    s.className = "ch";
    s.textContent = ch === " " ? "\u00A0" : ch;
    n.appendChild(s);
  }
});
// 16–18 chars/s feels like typing; 0.055 s stagger ≈ 18 cps
tl.fromTo(".b4 .typed .ch", { opacity: 0 },
  { opacity: 1, duration: 0.001, ease: "none", stagger: 0.055 }, at);
```

**Persian** — never split letters. Reveal the whole shaped line with a
right-to-left `clip-path` wipe; it reads as typing and keeps shaping intact:

```js
tl.fromTo(".b1 .name",
  { clipPath: "inset(0 0 0 100%)" },   // hidden from the left → reveals right→left
  { clipPath: "inset(0 0 0 0%)", duration: 0.9, ease: "power2.inOut" }, at);
```

A blinking caret is optional. If used, blink it with finite keyframes only
(never `repeat: -1`) and stop it before the beat exits.

## 6. Beat construction

One beat = one `.clip` = one idea, on its own `data-track-index` (1, 2, 3 …)
so a 15-beat overlay raises no density warning.

| Element | Value |
|---|---|
| entrance | 0.45–0.55 s, `expo.out`, y 16–26 px, opacity 0→1, blur 10→0 |
| icon pop | 0.55–0.7 s, `back.out(1.8–2.4)`, scale 0.4→1, rotate −90→0 |
| stagger | 0.12–0.22 s between siblings, never all at once |
| hold | ≥ 1.2 s of readable stillness, but the caustic keeps moving |
| exit | 0.34–0.4 s, `power3.in`, y −14…−20, opacity→0 |
| beat length | 4.5–12 s; 14–16 beats across a 2.5 min video is plenty |

Exit **before** the clip window ends so the cut is authored, not clipped.
Add `data-hold` to every beat: the stillness is deliberate.

Layout anchors (1920 × 960): `right:96 top:72`, `left:96 top:232`,
`left:96 bottom:84`, `right:96 top:232`, `left:96 right:96 bottom:72`
(wide waveform strip). Vary sides between consecutive beats.

**Stat cards size to their content.** A fixed 456 px card holding one number
leaves half the glass empty, which reads as an unfinished component. Use
`width:auto` on the glass (absolute `right` anchor + `text-align:right` sizes it
to the widest line), keep the number block on one baseline, and separate the
supporting formula with a 1 px `rgba(255,255,255,.14)` rule. Persian zero is a
dot: at 82 px the digits of «۶۰۰» drift apart visually, so pair a slightly
smaller size with `letter-spacing:-0.13em` (and `padding-left:.1em` to undo the
trailing space) — never split the digits or animate them one by one.

**A counted number and its bar share one ease.** `countUp` defaults to
`EASE.soft` (power2.out); if the bar uses `power1.inOut` the readout says 98 %
while the bar shows 88 %. Pass the same `ease` to both tweens.

## 7. Sound design

Real recorded CC0 SFX only. The kit lives in the `video-creation` skill:

```
~/.agents/skills/video-creation/references/video-shotcraft/assets/audio/sfx/
  ui/ glass/ data/ text/ transition/ counter/ impact/ riser/ fluid/ light/
```

Copy the files into `assets/audio/` (never reference the skill folder at render
time). Cue map:

| Beat action | Sound |
|---|---|
| card / chip enters | `transition/whoosh-fast.mp3` + `glass/glass-hit-cine.mp3` |
| icon or item lands | `ui/pop.mp3`, `ui/ui-message-pop.mp3` |
| chip / check appears | `ui/ui-click-tone.mp3` |
| typing | `text/typewriter-digital.mp3` (one shot under the typing) |
| number counting | `counter/clock-tick-single.mp3` ×2 |
| scan / detect | `data/data-scan.mp3`, `data/data-compute.mp3` |
| success / completion | `ui/chime-crystal.mp3`, `impact/hit-fast-exciting.mp3` |
| waveform | `fluid/water-bubble.mp3` |
| model / signature | `light/sparkle-touch.mp3` + `ui/chime-crystal.mp3` |

Each cue is a timed `<audio>` in `index.html` with a **unique `id`** (the
renderer silently drops clips without one) and its own track index:

```html
<audio id="sfx-40" class="clip" data-start="0" data-duration="1.6"
       data-volume="0.45" data-track-index="40" src="assets/audio/whoosh-fast.mp3"></audio>
```

Levels: overlay SFX sits under the user's voice — keep peaks around **−6 dBFS**
(`data-volume` 0.3–0.45), never above −3. The editor will duck them further.
Set `data-duration` slightly under the file length (e.g. 1.85 s for a 1.85 s
clip) to silence `clip_media_fit`.

## 8. Render and verify

Every render obeys the `cool-render` skill: **≤ 50 % CPU**, **≤ 200 MB per
file**, **30 fps CFR**. Wall-clock time is irrelevant; heat is not.

```bash
COOL=<cool-render-dir>/scripts/cool-run
$COOL --check                            # no other heavy job running
npx hyperframes check                    # 0 errors before any render

# the delivery file: VP9 + alpha, tiny
$COOL npx hyperframes render --format webm --crf 22 --vp9-cpu-used 2 \
  --workers 2 -o renders/<slug>_2x1_alpha.webm --quality looks
```

**Never ship ProRes 4444 for a long overlay.** It is 100–120 Mbit/s: a 143 s
layer lands at ~2 GB, ten times the budget, and the fixed-width `--max-bitrate`
flag is rejected on non-MP4 formats. WebM VP9 alpha is the one alpha container
that fits (typical 20–60 MB for a 2.5 min overlay) and it imports into
OBS, browsers, Resolve and current Premiere. If an editor truly needs ProRes,
say so and ask — do not render it by default.

Verify alpha and sync:

```bash
ffprobe -v error -show_entries format=duration,size \
  -show_entries stream=codec_name,pix_fmt,nb_frames,r_frame_rate \
  -of default=noprint_wrappers=1 renders/<slug>_2x1_alpha.webm
# VP9 must report yuva420p and r_frame_rate=30/1; size must be < 200 MB

# a frame at a beat must decode to RGBA, not RGB
ffmpeg -v error -ss 11.5 -i renders/<slug>_2x1_alpha.webm -frames:v 1 review/check.png
ffprobe -v error -show_entries stream=pix_fmt -of csv=p=0 review/check.png

# alpha really is transparent where the footage must show through
python3 -c "from PIL import Image; a=Image.open('review/check.png').getchannel('A'); \
p=list(a.getdata()); print('transparent %', 100*sum(v<8 for v in p)/len(p))"

# audio is present and not clipping
ffmpeg -hide_banner -i renders/<slug>_2x1_alpha.webm -af volumedetect -f null - 2>&1 \
  | grep -E "mean_volume|max_volume"
```

Deliver a 3-line README with the overlay: video length, the exact frame the
overlay starts on, and how to drop it in (Premiere/Resolve: WebM VP9 + alpha on
the track above, blend = Normal; OBS/browser: add as a media source).

## 9. Expected lint warnings

These are acceptable and specific to overlays:

| Warning | Why it is fine |
|---|---|
| `first_frame_empty` | overlay starts transparent by design |
| `dead_stretch` between beats | the footage is the content in the gaps |
| `composition_file_too_large` | one file holds all beats for simple revision |
| `composition_heavy_overlay_count_high` | keep heavy elements ≤ ~35; split into `overlays-a/b/c.html` if it grows |

Fix everything else, especially any ✗ error.
