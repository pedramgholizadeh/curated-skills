# Design System

The visual rules that make a batch of reels feel crafted by one hand. All values are for a **1080×1920** canvas; scale proportionally for other sizes.

## Type scale + weight ladder

A ~1.4 modular ramp paired with a four-step weight ladder. Hierarchy comes from the *ratio* between roles, not from making everything large.

| Role | px | weight (regular / emphasis) | line-height | Use |
|---|---|---|---|---|
| `hero` | 120 | 800 / 900 | 1.16 | hook |
| `title` | 88 | 700 / 800 | 1.22 | scene heads, CTA line |
| `card` | 48 | 600 / 800 | 1.2 | card titles |
| `body` | 44 | 400 / 700 | 1.5 | problem lines |
| `detail` | 32 | 400 / 600 | 1.35 | card subtitles |
| `label` | 30 | 600 / 700 | 1.3 | counters, small tags |

`*emphasis*` inline markers bump weight (+100/200) and swap to the accent color. Keep ≤ 4 emphasis tokens per scene.

**Card text is small.** The common failure is oversized card copy. Title ~48, detail ~32 against an 88 head reads as a clean hierarchy; anything bigger looks crude and crowds the box.

## Auto-fit + balanced wrapping (no orphans)

For every text block, in order:
1. Try one line at the role's base size.
2. If too wide, shrink (×0.95 steps) until it fits one line.
3. If still too wide at the floor, wrap to a **balanced** 2 lines (brute-force the split that minimizes the widest line), shrinking as needed.
4. Only then allow 3 lines.

Never leave a single word alone on the last line. A 5+1 split is a defect. If two lines aren't *worth it*, shrink to one.

## Layout safe zone

- Text column width `TEXT_W ≈ 760` → content spans x ∈ [160, 920] on 1080. This stays inside the platform's own UI chrome (captions, buttons).
- **Timeline / progress bar sits near the bottom (y ≈ 1512).** The content area has a hard **floor at y ≈ 1330** so no card ever touches or overlaps the bar. This is a frequent, ugly bug — enforce it.
- Brand mark, if shown, lives at the top (y ≈ 96), except on the CTA where the logo is the hero.

## Cards

- Subtle fill (`rgba(255,255,255,.05)`), radius ~22, **no heavy border**.
- A thin accent bar on the leading (reading-start) edge: teal normally, accent color on the one highlighted card.
- Icon in a soft circle at the leading side; title + detail right-anchored (LTR) / left-anchored (RTL) with ≥ 30px inner padding from the box edge.
- Accent card: swap the accent bar/fill to the brand's highlight color.

## Motion

- Every frame is a pure function of `t` — deterministic, re-renderable, no wall-clock.
- Entrance: expo-out over ~0.32s, slight back-out overshoot on emphasis words and the CTA logo.
- Stagger card reveals ~0.24s apart; slide-in from the leading edge ~40–46px.
- Beat pulse: a subtle scale/glow keyed to the BPM grid, used sparingly (accent word, CTA).
- **No continuous float.** Animate on entrance and on the beat; otherwise hold still.
- Scene exit: fade + small rise over the last ~0.32s.

## Color

Tokens come from `brand.json` → `palette`. A dark, cinematic base works best for reels:

```
bg / bg2 / bg3   deep background ramp (gradient)
primary/secondary mid brand tones for the ambient pools
accent (teal-ish)  default highlight
accent2 (orange)   the single "look here" color — emphasis, CTA, progress fill
text / soft        near-white body / muted labels
```

Rules: one accent + one highlight per frame; text-to-background contrast ≥ 4.5:1; the highlight color is reserved for the most important word/action so it never loses meaning.

## Icons

Use an icon font (e.g. Material Symbols Rounded) loaded locally so glyphs render identically every run. Draw the ligature name (`bolt`, `shield`, `analytics`, `storefront`…) with the icon font at the card's leading side. **Verify in the preview that glyphs render as symbols, not the literal word** — a missing glyph silently shows the name.

## Sound

The audio bed is synthesized on the same BPM grid as the visuals so cuts land on beats: a music layer (kick/clap/hat/sub/pad/arpeggio) plus designed SFX (whoosh + impact on each scene change, tick on each list reveal, a riser + impact + sparkle into the CTA). Loudness-normalize to ~-14 LUFS for social. See `scripts/score.js`.
