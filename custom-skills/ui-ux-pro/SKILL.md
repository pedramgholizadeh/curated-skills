---
name: ui-ux-pro
description: Lean design-intelligence workflow for building UIs that don't look AI-generated — query-contract driven design system generation, accessibility floors, anti-slop rules, dials for variance/motion/density, and a pre-delivery checklist. Use when designing, building or reviewing any interface: pages, components, dashboards, mobile UIs, or full design systems.
sources:
  - ui-ux-skills/ui-ux-pro-max/ui-ux-pro-max
  - ui-ux-skills/ui-ux-pro-max/design-system
  - ui-ux-skills/ui-ux-pro-max/ui-styling
  - ui-ux-skills/ui-ux-pro-max/design
---

# UI/UX Pro

The operating rules distilled from `ui-ux-pro-max`, without the ceremony. For
heavy lifting, use the upstream search engine; otherwise apply this skill
directly.

## Engine (optional, when exactness matters)

The vendored master skill ships a zero-dependency BM25 search over curated CSV
databases (88 styles, 192 palettes, 74 type pairings, 192 reasoning rules):

```bash
python ui-ux-skills/ui-ux-pro-max/scripts/search.py "<product> <industry> <keywords>" \
  --design-system -p "Project Name" \
  --variance 1-10 --motion 1-10 --density 1-10
```

**Query contract:** one intent per query, 2–5 terms, pick `--domain` or
`--stack` explicitly (auto-detection misroutes). Retry once, then declare "no
DB match" and fall back to the rules below — never fabricate results. Detect
the stack from `package.json` / `pubspec.yaml` / xcodeproj; never assume it.

**Persistence:** `--design-system --persist --output-dir <project-root>` writes
`design-system/<slug>/MASTER.md` + `pages/<page>.md` overrides (page overrides
master). Overwriting an existing MASTER requires explicit user consent
(`--force`).

## Dials

- **variance** — minimal ↔ brutalist layout bias
- **motion** — Subtle / Standard / Complex (GSAP tier)
- **density** — spacious 24–96px · standard 16–64px · dense 8–32px token scale

## Accessibility floors (non-negotiable)

- Contrast: text ≥ 4.5:1, large/non-text ≥ 3:1 (AAA 7:1). Measure dark mode
  independently — inverted colors are not a theme.
- WCAG 2.2 extras most teams miss: focused element never obscured by overlays;
  keyboard alternative for drag; target size ≥ 24×24 CSS px (touch: 44pt iOS /
  48dp Android, 8px gaps); password managers and paste allowed in auth fields;
  auto-rotation/carousels get pause/stop controls.
- Feedback within 100–150ms of input. Animate `transform`/`opacity` only —
  never width/height. Respect `prefers-reduced-motion`.

## Anti-slop rules

- No emoji as icons — SVG only, one stroke/fill family per hierarchy level.
- No gray-on-gray text; no raw hex inside components — semantic tokens only.
- One style family per product; never mix flat + skeuomorphic randomly.
- Every animation must express cause and effect.
- Layout: mobile-first, never disable zoom, ≥16px body, 65–75ch line length,
  4/8dp spacing rhythm, `dvh` not `100vh`, reserve dimensions to keep CLS < 0.1.

## Design system architecture

Three token layers: **primitive → semantic → component**. Store color as HSL
so opacity variants derive cleanly. Document every component state table
(Default / Hover / Active / Disabled / Focus) — states are the spec.

## Pre-delivery checklist

- [ ] Tested at 375px **and** landscape phone
- [ ] Reduced-motion and Dynamic Type / large text pass
- [ ] Screen-reader order equals visual order
- [ ] Color is never the sole indicator (pair with icon/text)
- [ ] Failed forms keep inline errors + a focus-linked error summary
- [ ] "So what?" passes: each visual choice serves the brief, not a trend
