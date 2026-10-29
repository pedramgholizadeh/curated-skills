---
name: brand-reels
description: Produce a batch of on-brand short vertical marketing reels (9:16, ≤60s) for a business's own services or products, rendered deterministically in code (HTML canvas → headless Chrome → ffmpeg) with a hook-first / CTA-last grammar and beat-synced sound. Use when a business wants repeatable productized social video from its website/catalog content, needs many similar videos fast, or wants a brand-themed reel pipeline rather than one-off editing.
sources:
  - video-generation/motion-graphics
  - video-generation/cinematic-promos
  - video-generation/editing-workflows
  - ui-ux-skills/visual-design
  - ui-ux-skills/interaction-design
---

# Brand Reels

Turn a business's real content into a system that renders many short vertical reels in the same visual language. One reel = a JSON **scenario** describing scenes; a canvas engine renders every frame as a pure function of time `t`; headless Chrome captures frames; ffmpeg encodes video + a synthesized, beat-synced audio bed. The engine is brand-configurable (palette, fonts, direction, locale, domain, CTA line) so it works for any business, any language, LTR or RTL.

This is a **production workflow skill**, not a topic overview. Follow the pipeline; use the reference implementation in [`scripts/`](scripts/).

## When to use

- A business has N services/products landing pages and wants one consistent reel each.
- You need dozens of near-identical videos where only copy, brand and layout vary.
- You want deterministic, re-renderable, code-owned video (no manual timeline scrubbing).

**Not for:** one-off cinematic brand films from live footage, talking-head explainers, or AI text-to-video. Those live in other `video-generation` skills.

## Prerequisites

- Node 20+, `ffmpeg` on PATH, a Chromium/Google Chrome binary.
- `npm i puppeteer-core` in the working project (the engine is dependency-free; only the renderer needs Chrome).
- A brand: logo PNG, two fonts (a variable text font + an icon font such as Material Symbols), and a palette. See [`scripts/brand.example.json`](scripts/brand.example.json).

## The pipeline

```bash
# 0) one-time: point the engine at the brand
cp scripts/brand.example.json brand.json      # edit palette/fonts/domain/cta

# 1) author a scenario from REAL business content
#    data/reels/<key>.json   (see assets/scenario.example.json)

# 2) gate it
node scripts/validate.mjs <key>

# 3) look before you render
node scripts/render.mjs <key> --preview        # → out/<key>/sheet.jpg  (open it)
node scripts/render.mjs <key> --frame=2.0       # full-res single frame

# 4) audio + video
node scripts/render.mjs <key> --audio           # → data/scores/<key>.m4a
node scripts/render.mjs <key>                   # frames + encode → media/<key>.mp4
```

Batch across a catalog with a resumable loop that skips any `media/<key>.mp4` that already exists. Cap workers to ~50% of cores (e.g. `--workers=4`) — frame capture is CPU-heavy and will otherwise overheat a laptop.

## Reel grammar (the scene spine)

Every reel is 4–7 scenes, 22–40s, always opening on a hook and closing on the CTA. Scene `layout` picks the renderer; see the tables below.

| Order | Layout | Job | Data fields |
|---|---|---|---|
| 1 | `hook` | Stop the scroll in <3s. A **controversial question that names the viewer's problem**. No brand name yet. | `lines[]`, optional `icon` |
| 2 | `problem` | Agitate: why the status quo hurts. | `lines[0]` title, `items[]` |
| 3 | `features` | What you actually deliver (complementary set). | `lines[0]` head, `items[]` with `text`/`detail`/`icon` |
| 3′ | `compare` | **Only if** the offering has mutually-exclusive variants. | same as features + a "VS" chip between rows |
| 4 | `statement` | A punchy belief line — a visual breather between card scenes. | `lines[]` |
| 5 | `features` | The process / how-it-works, as steps. | head + `items[]` |
| last | `cta` | Contact + domain. Simple, elegant. | `site`, `direct` |

Total duration target: ~26–30s. Keep each scene 3–6s. The first scene must land its full message inside 3 seconds.

## Choosing layouts — "understand what's what"

Read the business's real page content **before** writing scenes. Then decide:

1. **Does this service have alternative product types?** (e.g. a web studio offering *corporate vs e-commerce vs custom*) → use a `compare` scene with VS chips. These are things the viewer *chooses between*.
2. **Are the parts complementary, all delivered together?** (e.g. SEO = *strategy + technical + content + reporting*) → use `features`. **Do not** force a VS comparison — it would misrepresent the offer.
3. **Vary layouts across the reel.** Don't run three `features` scenes back-to-back; break the rhythm with a `statement` or `problem`. Variety is what makes a batch feel crafted, not templated.
4. **The hook must be specific to that service's real pain**, phrased as a question — pulled from the page's own framing, not generic.

The same engine renders a coffee roaster, an agency, and a SaaS; the difference is which scenes you pick and the copy you extract.

## Hard design rules (do not break)

- **No fabricated numbers, counts, or prices.** Never invent "12 pages", "6 months", "$9/mo", follower counts, or testimonials. If the business publishes them, you still keep marketing reels number-free unless explicitly told otherwise — numbers age and mislead.
- **Type scale + weight ladder.** A ~1.4 modular size ramp; weights `400` body → `600` card → `700` title → `800` hero. Card text is *small and clearly tiered* (title ~48px, detail ~32px, head ~88px on a 1080-wide canvas). Hierarchy comes from ratio, not from making everything big.
- **Auto-fit, never orphan.** A line that wraps to two lines must be *balanced* (worth it) — never leave one lonely word on line two. Shrink to fit one line first; only wrap when the split is even.
- **Safe zone + timeline clearance.** Keep content inside the platform's UI-safe box and **never let a card touch the progress/timeline bar** — reserve a hard floor well above it.
- **Box padding.** Any text inside a card/banner has explicit inner padding from the edge.
- **Restrained motion.** Animate 1–2 elements per scene (staggered entrance + one accent). No perpetual floating. A static frame reads as a bug, but constant jitter reads as cheap.
- **Contrast ≥ 4.5:1** for text on its background.
- **CTA is simple:** small logo → the **domain typed** with a typewriter/caret reveal → one contact line ("DM us for a free consultation" / localized). No clutter, no pills that collide.
- **Icons from a real icon font** (e.g. Material Symbols), loaded locally for deterministic rendering. Verify glyphs render as symbols (not the ligature word) in the preview.

## Content rules

- Copy comes **only** from the business's own pages/catalog. Extract headings, value props, process steps, differentiators.
- Match the brand's **voice**: if it's casual, write casual; if formal, formal. Keep it natural in the target language (use correct locale digits, real non-breaking spaces / half-spaces, no emoji on canvas).
- One idea per line. Short lines. The reel is read at a glance.

## Workflow: pilot first, then batch

1. Build **one** reel end-to-end and open its `sheet.jpg` + key frames.
2. Get sign-off on the look (typography ratio, card design, CTA) before touching the rest.
3. Only then fan out across the catalog and batch-render. A confirmed pilot prevents re-rendering everything twice.

## Review checklist (before calling it done)

- [ ] Hook is a question naming the real problem, fully readable within 3s.
- [ ] Scene count 4–7, total ≤ 60s (target ~28s), last scene is `cta`.
- [ ] `compare` used **only** for alternative variants; `features` for complementary ones.
- [ ] No numbers/counts/prices anywhere.
- [ ] `validate.mjs` passes; `sheet.jpg` and the CTA frame visually checked.
- [ ] No card overlaps the timeline bar; text is centered/balanced; no orphan lines.
- [ ] Icons render as symbols; fonts and palette match `brand.json`.
- [ ] Audio renders and muxes (loudness-normalized to ~-14 LUFS).

## Files

```
scripts/
  brand.example.json   brand config: palette, fonts, direction, locale, domain, cta, bpm, canvas
  engine.js            canvas renderer; every frame is a pure function of t (the reusable core)
  page.html            engine host + @font-face
  render.mjs           static server + headless Chrome, parallel resumable frames, ffmpeg encode
  validate.mjs         content + grammar gate (scene types, no-numbers, hook/cta rules)
  score.js             synthesized 112-BPM music + SFX, cues aligned to the scene timeline
  README.md            how to run
references/
  reel-grammar.md      scene archetypes, hook formulas, CTA, layout-selection deep dive
  design-system.md     type scale, weight ladder, safe zones, motion, color/contrast tokens
  render-contract.md   the window.ready / renderAt / renderSheet contract + determinism rules
assets/
  scenario.example.json  a full worked reel for a non-tech business (coffee roaster) — proof of generality
```

## Worked example (coffee roaster → reel)

Input: a small-batch roaster's page — "single-origin vs blends vs subscriptions", roast-to-order, free shipping threshold, "taste the difference of fresh".

- `hook`: "Still buying *stale* supermarket beans?" (question naming the pain)
- `problem`: "Roast date hidden / flavor already gone"
- `compare`: **Single-origin vs Blend vs Subscription** (these ARE alternatives → VS chips)
- `statement`: "Fresh isn't a feature. It's the whole point."
- `features`: process — *select green → roast to order → ship within 48h* (no prices)
- `cta`: domain typed + "DM us to find your roast"

Contrast with SEO (complementary parts → `features`, no `compare`). The engine is identical; only the scenario JSON and `brand.json` change.
