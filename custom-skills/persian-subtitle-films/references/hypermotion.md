# HyperMotion

HyperMotion is this project's motion layer: `assets/hypermotion.js`, a small set
of deterministic GSAP builders loaded inside every composition. It exists
because HyperFrames has no motion package of its own and npm `hypermotion` is an
unreleased React experiment. Do not install anything; use the helper.

```html
<script src="assets/vendor/gsap.min.js"></script>
<script src="assets/hypermotion.js"></script>
<script>
  const tl = gsap.timeline({ paused: true });
  HM.cameraDrift(tl, "#scene", { from: 1.0, to: 1.03, duration: 5 });
  HM.revealWords(tl, "#title-words", { at: 0.3, stagger: 0.07 });
  window.__timelines["title"] = tl;
  tl.seek(0);
</script>
```

Every builder takes the timeline and an absolute `at` in seconds. Never build a
timeline in an async callback; never use `setTimeout`, `Date.now()` or
`Math.random()` without `HM.seeded()`.

## Tokens

| Token | Value | Meaning |
|---|---|---|
| `HM.ease.enter` | `expo.out` | arrivals, long tail |
| `HM.ease.land` | `power4.out` | text landing |
| `HM.ease.move` | `power2.inOut` | camera, colour, layout |
| `HM.ease.exit` | `power3.in` | exits, accelerate away |
| `HM.ease.soft` | `power2.out` | small UI, captions |
| `HM.spring.soft` | `back.out(1.4)` | playful overshoot, rarely |
| `HM.dur.enter` | `0.45` | word/line entrance |
| `HM.dur.exit` | `0.20` | exit (40–50 % shorter) |
| `HM.dur.move` | `0.90` | camera / layout |
| `HM.dur.hold` | `1.20` | minimum readable hold |

Entry/exit rule: **nothing arrives after the viewer starts reading.** If a line
lands at 1.0 s, it is still at 2.0 s to the pixel.

## Direction in RTL

- Text enters from the right: `x: +18 → 0`. Never from the left — that reads as
  a Latin layout.
- Exits leave to the left: `x: 0 → -14`, `power3.in`.
- Underlines and rules draw **right → left** (`transform-origin: right`).
- Camera pans follow reading direction: right → left for forward motion.
- Progress bars fill right → left.
- The accent dot appears last, after the name it belongs to.

## Builders

### `HM.revealWords(tl, selector, opts)`

Splits the element's text into **word spans only** (on spaces, ZWNJ preserved),
then per word: `opacity 0 → 1`, `y ±10 → 0` (RTL: `x +18 → 0` for a line),
`filter blur(6px) → blur(0)`, stagger 60–120 ms, `expo.out` 0.45 s.

- Use for headlines and titles. **Never for captions** (captions are one card,
  one fade).
- Do not animate the words of a line the viewer has already begun reading.
- Keep the line's final state static; no drifting, no breathing.

### `HM.revealLine(tl, selector, opts)`

Whole-line blur-in: `blur(8px) → 0`, `opacity 0 → 1`, 0.16 s. For support lines
and kickers.

### `HM.drawRule(tl, selector, opts)`

A 2 px mint rule draws from right to left (`scaleX 0 → 1`, origin right, 0.35 s
`expo.out`). Used once per beat as the accent's structural mark.

### `HM.cameraDrift(tl, selector, opts)`

Slow push on a wrapper (never on a `.clip` element): `scale from → to`
(1.00 → 1.03), `power2.inOut` over the scene. The scene root gets
`transform-origin: 50% 50%`; keep `overflow: hidden` on the stage.

### `HM.accentUnderline(tl, selector, opts)`

Draws a mint underline under one word: `scaleX 0 → 1` from the right, 4 px tall,
8 px below the baseline, 0.3 s `expo.out`, then holds. One per film.

### `HM.countUp(tl, selector, opts)`

Deterministic integer count at 30 fps: computes the value from the tween's
progress, not from the clock. Persian digits by default. Use only with a real
number from the user; never fabricate a stat.

### `HM.cardIn(tl, selector, opts)`

Surface card: `opacity 0 → 1`, `y 24 → 0`, `scale 0.98 → 1`, `power3.out` 0.4 s,
1 px hairline visible at frame 1. No glass, no glow.

### `HM.wipeMask(tl, selector, opts)`

`clip-path: inset(0 0 0 100%) → inset(0)` (reveals from the right), 0.5 s
`power3.inOut`. For large type or a colour block, not for captions.

### `HM.seeded(index)`

Mulberry32 PRNG seeded from the element index; use for the dot field or wave
phase. One seed per element, never one global stream.

## Scene recipes (2:1, 30 fps)

### Title scene (3.6 s, only when the first caption starts ≥ 3.8 s)

| t | What happens |
|---|---|
| 0.00 | background alive: wave drifts, dots move; nothing else |
| 0.20 | kicker `نام برند` blur-in from right, 0.3 s |
| 0.34 | mint rule draws under the kicker, right → left, 0.35 s |
| 0.50 | headline words reveal, 0.075 s apart, last word mint |
| 1.05 | sub line blur-in, 0.3 s |
| 0.20 → 3.20 | one camera push 1.00 → 1.025, `power2.inOut` |
| 3.15 | exit: opacity 0 + 12 px up + 6 px blur, 0.25 s `power3.in` |
| 3.60 | scene ends; captions may start at 3.8 s |

The headline is ≤ 5 words. One of them is mint; the rest are white. The sub line
holds 2.1 s, past the 0.5 s + 0.3 s × words floor; if you add words, lengthen the
scene or cut the copy. If the SRT speaks before 3.8 s the title is **hidden**, not
squeezed — a truncated title reads as a mistake.

### Chapter card (1.2–2 s)

A short label (2–4 words) centred, 96–120 px, with a mint rule above.
In: words rise 10 px + blur, 0.3 s. Out: blur + fade 0.18 s. Never a full-screen
wipe for a chapter; the ground never cuts.

### Caption card (SRT-driven)

Handled by `srt.mjs build`. One card at a time, one fade, no movement after
landing. The cap band is bottom 88 px, max width 1480 px.

### End card (2.5–3.5 s)

| t | What happens |
|---|---|
| 0.00 | the last caption is gone; background only |
| 0.20 | lockup `نام برند` lands (word reveal), accent dot last |
| 0.55 | mint rule draws under the lockup |
| 0.80 | site `example.com` isolates LTR, muted, blur-in |
| 1.20 | hold until scene end (≥ 2 s total) |

No CTA the user did not give; no social icons unless supplied.

### Stat beat (optional)

Only with a real number. Label at 40 px muted, number at 220 px weight 800,
count-up 0.9 s `power2.out`, mint only on the number. No KPI grid, no three
cards in a row.

## Transitions

Use 3–5 kinds per film, each caused by something on screen. In this system:

1. **Blur swap on one stage** (default): out 0.16 s with 8 px blur, in 0.16 s
   from 8 px blur; the ground never cuts.
2. **Carry across**: the accent dot or rule travels to the next scene's anchor.
3. **Colour flood**: ground stays, the glow's centre shifts over 0.6 s.
4. **Wipe from the right**: `clip-path` reveal on a chapter block, 0.35 s.
5. **Hard cut** only on a chapter slam, max three per film.

Never crossfade two different backgrounds; the dot field is continuous across
the whole film, so a crossfade reads as a double exposure.

## What not to do

- No `repeat: -1`, no infinite loops, no breathing or floating titles.
- No letter-by-letter Persian, no typewriter, no per-character scramble.
- No bounce on UI, no click rings, no glow pulses.
- No animating `left/top/width/height`; transforms only.
- No CSS `transform` on an element GSAP transforms — set the start inside
  `fromTo`.
- No timeline built after `await`; register it synchronously at the end.
- No motion on a caption after it lands.
