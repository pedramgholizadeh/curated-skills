# Formats — 2:1 film and 9:16 vertical

Both canvases ship in `scripts/srt.mjs` as `FORMATS` entries. `parse --format`
picks one, writes it into `timeline.meta`, and `plan` / `build` inherit it, so a
project never has to keep two numbers in sync by hand.

| | 2:1 film (default) | 9:16 Reel / Short |
|---|---|---|
| Canvas | 1920 × 960 | 1080 × 1920 |
| fps | 30 CFR | 30 CFR |
| Safe box | `--safe-x: 192px`, `--safe-y: 96px` | `--safe-x: 60px`, `--safe-y: 130px` |
| Caption band | `bottom: 88px`, `padding-inline: 220px` | `bottom: 470px`, `padding-inline: 60px` |
| Caption line | max 1480 px, 76 px, 2 lines, 34 chars/line | max 940 px, 60 px, 3 lines, 22 chars/line |
| Card size | 7 words / 68 chars | 7 words / 60 chars |
| Caption treatment | plain type on rendered ground | **pill**: `rgba(18,20,19,.62)`, 1 px hairline `rgba(255,255,255,.12)`, radius 5 px, `0 18px 44px rgba(0,0,0,.4)`, padding `10px 30px 14px` |
| Card timing floor | `MIN_GAP .06`, `MIN_CARD .9`, 16 chars/s | `MIN_GAP .04`, `MIN_CARD .7`, 20 chars/s |

The pill and the tighter floors exist because vertical captions ride **over real
footage**: a scrim is required for contrast, and a talking-head Reel runs faster
than a rendered-title film, so the old floors made every card collide with the next.

## Vertical layout that stays clear of the Instagram UI

Measured on a 1080 × 1920 stage; the app overlays its own chrome, so keep the
band `y 130 … y 1450` free of anything essential.

| Element | Position |
|---|---|
| Progress bar | `top: 92px`, draws right → left |
| Hook block | `top: 168px`, `inset-inline: 64px`, headline 76 px / 800, max-width 860 px |
| Keyword chips | row centred at `bottom: 800px`, 34 px pill — sits above a 3-line caption band and below the face |
| Caption band | `bottom: 470px`, up to 3 lines (≈ 280 px tall, so its top edge lands near `y 1170`) |
| End card | name 84 px / 700 + 12 px accent dot, 360 px accent rule, site 34 px muted, `dir="ltr"` isolate |

The face of a portrait talking head occupies roughly `y 250 … y 900` after a
1080 × 1920 crop: the hook lives above it, the chips and captions below it. If a
shot is framed tighter, move the hook to the chip row rather than shrinking the type.

## Reading speed is speech-bound on talking heads

Measured on a real 2-minute Persian monologue, sped to 1.2×: median 18 chars/s,
p90 22.6, worst 33.7. The take contained 0.22 s of silence in total, so neither
documented fix applied — extend into silence, or split — and splitting made it
**worse**: 5-word cards gave 97 cards with 62 over speed, 7-word cards gave 73 with
39, because every extra card pays a `MIN_GAP` and can only start when its first
word is spoken. When the audio is fast, the honest options are fewer larger cards,
or a shorter approved transcript. Do not silently drop words to hit a number.

## Adding another canvas

Copy a `FORMATS` block in `scripts/srt.mjs` (dimensions, card limits, caption
band, floors, `pill`) and the matching entry in `scripts/new-video.mjs`
(`width`, `height`, `safeX`, `safeY`). `formatFromMeta()` matches on width and
height, so `plan` and `build` pick the new format up from `timeline.json` alone.
