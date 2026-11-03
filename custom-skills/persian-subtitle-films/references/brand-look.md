# Brand look (2:1 canvas)

The example token set below was extracted from one real personal brand site (`assets/css/style.css`,
`assets/css/site.css`, `assets/js/wave.js`). Use these values; do not re-invent a
palette and do not add a second look.

## Palette by role

| Role | Value | Use |
|---|---|---|
| Ground | `#1D1D1D` | base fill of every frame |
| Ground deep | `#181818` | letterbox, end card, dips |
| Surface | `#232323` | cards, chips, caption scrim |
| Ink | `#FFFFFF` | headlines and captions |
| Ink muted | `rgba(255,255,255,0.55)` | support lines, meta |
| Ink faint | `rgba(255,255,255,0.32)` | labels, inactive words |
| Hairline | `rgba(255,255,255,0.12)` | 1 px rules and dividers |
| Accent | `#55E6A5` | one word, one rule, one dot — the focal colour |
| Accent deep | `#2FB87E` | pressed states, shadow side of the accent |
| Accent wash | `rgba(85,230,165,0.16)` | atmosphere glow; never below 0.12 |
| Micro accent | `#E8FE51` | optional, at most one word per shot |
| Alert (rare) | `#F08F74` | only for a true warning, never decoration |

The accent is a **highlighter**, not a theme: one mint word per headline, one
mint rule, one mint dot in the lockup. If everything is mint, nothing is.

## Background (the house texture)

Four layers, painted once, deterministic:

1. **Base** `#1D1D1D`.
2. **Two radial glows**, mirroring the site's `body:before/after`:
   - `radial-gradient(circle at 82% 8%, rgba(85,230,165,0.18) 0%, rgba(85,230,165,0) 42%)`
   - `radial-gradient(circle at 12% 96%, rgba(85,230,165,0.12) 0%, rgba(85,230,165,0) 48%)`
   Draw these as CSS backgrounds (one paint), never as live `filter: blur()`.
   Opacity budget: the glow must be visible on a still, invisible as an object.
3. **Dot field** (the site's `dots-waves`): 34 px pitch, 1.6 px dots,
   `rgba(255,255,255,0.20)`, masked by
   `radial-gradient(ellipse at 50% 45%, #000 0%, transparent 72%)`, overall
   opacity `0.35`. Drift `translateX(0 → -34px)` linearly across the film so the
   seam is invisible; no `repeat: -1`.
4. **Wave crests**: three 2 px SVG paths, mint at 0.18 / 0.10 / 0.06 opacity,
   crossing the lower third. Drift `x: 0 → -48px` over the film plus a 6 px
   vertical breath (`yoyo` is fine only when bounded). The wave is atmosphere,
   never the hero.

Optional 2 % film grain over the whole frame via a tiled noise PNG at
`opacity: 0.04`; skip it if no local grain asset exists.

Anti-banding: no full-width linear gradients on `#1D1D1D`; use solid fills plus
local radial glows. H.264 bands long ramps.

## Typography

Font: **Vazirmatn** variable, weights 100–900, self-hosted.
`font-feature-settings: "ss01" 0;` (default shaping). No letter-spacing on
Persian — Arabic joining makes negative tracking collide. Use word spacing and
line breaks instead.

### Scale at 1920 × 960

| Role | Size | Weight | Line-height | Notes |
|---|---|---|---|---|
| Hero / cover word | 176–240 px | 800 | 1.25 | 1–2 lines, ≤ 5 words |
| Headline | 96–150 px | 700 | 1.35 | the accent word takes colour, not size |
| Sub-headline | 56–72 px | 500 | 1.45 | muted ink |
| Body | 40–48 px | 400 | 1.6 | max 42 characters per line |
| Caption | 64–84 px | 600–700 | 1.45 | 2 lines max, centred |
| Meta / kicker | 28–34 px | 500 | 1.2 | uppercase Latin only; Persian normal case |
| Numerals | `font-variant-numeric: tabular-nums` | — | — | Persian digits in copy |

Minimum on-screen type: **28 px**. If a line does not fit, cut words — never
shrink below 40 px for captions or 56 px for headlines.

### Persian rules

- `dir="rtl"` and `text-align: right` (or `start`). Captions are the only centred text.
- Do not use `text-align: justify`; Persian kashida stretching reads as broken.
- Keep ZWNJ (`U+200C`) inside words; never trim it. Test words: «می‌سازم»، «تجربهٔ».
- Persian digits for counts and years: ۰۱۲۳۴۵۶۷۸۹. Latin digits only inside
  URLs, code and version numbers.
- Latin runs inside Persian text: wrap in
  `<span dir="ltr" style="unicode-bidi:isolate">…</span>`.
- Punctuation: Persian comma «،», question «؟», quotes «»; no Latin comma in Persian copy.
- Never typewriter-reveal Persian and never split into letters.

### Lockup

`نام برند` (weight 700) + optional Latin line
`BRAND NAME IN LATIN` at 28–34 px, `letter-spacing: 0.18em`, muted.
Accent dot 10 px mint after the Persian name. No logo docked in a corner during
scenes; the end card is where the lockup lives.

## Layout

- Safe margins: **96 px** action-safe, **192 px** title-safe on all sides.
- Grid: 12 columns, 96 px gutter-free margin, 32 px column gaps. In RTL, column 1
  starts at the right.
- One hero per frame. The hero fills ≥ 40 % of the frame height or width.
- Caption band: bottom **88 px**, max width **1480 px**, centred. Never wider.
- Rules and chips: 1 px hairline, radius 20 px for cards, 999 px for pills.
- Cards use `#232323` + 1 px hairline; no glass, no blur, no drop shadow beyond
  `0 18px 60px rgba(0,0,0,0.35)`.

## Motion tone

Three words: **آرام، دقیق، زنده** — calm, precise, alive.

- Entrances land with `expo.out` / `power4.out`; exits accelerate (`power3.in`)
  and are 40–50 % shorter.
- Camera moves `power2.inOut`, 0.8–3.0 s, scale 1.00 → 1.025 max on a full-frame wrapper
  (mark it `data-layout-allow-overflow`).
- Springs only on position/scale: damping 0.82 (premium), never on opacity.
- RTL direction: text enters from the **right** (+14 to +20 px → 0) and exits to
  the **left**; rules and underlines draw from right to left.
- A landed line is dead still. Life moves to the wave, the camera or the next line.

## Banned for this brand

- Purple/blue gradients, mesh gradients, glassmorphism, neon rings, lens flares.
- Emoji, clip-art icons, stock people, AI-generated faces.
- Typewriter or per-letter Persian reveals.
- Mint used for body text, mint backgrounds behind white text, lime + mint together.
- Logo in a corner, HUD brackets, fake terminal chrome.
- Three KPI cards in a row, pill-chip decoration, numbered «۰۱ / ۰۲» labels.
- Any text that moves while the viewer is reading it.

## CSS root (copy into every composition)

```css
:root {
  --color-ground: #1d1d1d;
  --color-ground-deep: #181818;
  --color-surface: #232323;
  --color-ink: #ffffff;
  --color-ink-muted: rgba(255, 255, 255, 0.55);
  --color-ink-faint: rgba(255, 255, 255, 0.32);
  --color-hairline: rgba(255, 255, 255, 0.12);
  --color-accent: #55e6a5;
  --color-accent-deep: #2fb87e;
  --color-accent-wash: rgba(85, 230, 165, 0.16);
  --color-micro: #e8fe51;
  --font-fa: "Vazirmatn";
  --ease-enter: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-move: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-exit: cubic-bezier(0.55, 0, 1, 0.45);
  --safe-x: 192px;
  --safe-y: 96px;
}
```
