# Visual system

The difference between "AI video" and a launch film is almost never the animation. It is whether every frame belongs to the same designed system.

## 1. Extract, don't invent

Sources, in order of authority:

1. The product's own UI / app theme / design tokens (`theme.dart`, CSS variables, Tailwind config, Figma export).
2. The marketing site: computed styles, font files, logo files.
3. Screenshots: sample colours with a colour picker rather than eyeballing.
4. A brand guide if one exists.

Write `design-spec.md` in the project with **roles**, not a pile of hexes:

```md
ground:   #F7F7F8   (canvas behind everything)
surface:  #FFFFFF   (cards, panels)
ink:      #111114
muted:    #8A8A94
accent:   #2E6BFF   (one only, unless the brand proves two)
accent-2: —         (only when the brand genuinely uses it)
border:   #E7E7EC
highlight: accent @ 15–20%
font-display: <family>, weights <…>, tracking -0.02em
font-text:    <family>, weights <…>
radius:   <n>px   spacing unit: <n>px
material: flat panels, 1px borders, soft 24–40px shadows
motion tone: calm, precise, tactile
banned: gradients on text, stock icons, glass on every surface
```

If you can't read a colour, ask for it. Never guess a hex code and never present a default palette as the brand.

## 2. Conventions that read as premium

- **Two colours do the work**: one ground and one accent. Everything else is ink and muted ink.
- **Highlight, don't colour**: a soft accent wash behind a key word reads richer than coloured text.
- **Borders before shadows**: 1px low-contrast borders plus a wide, very soft shadow. Big drop shadows look like 2016.
- **Radius discipline**: match the product's radii. Mixing 4px and 40px in one frame reads as clip-art.
- **Negative space**: 15–25% of the frame empty around the hero object. Text near an edge dies on mobile crops.
- **Material**: frosted glass only where the product itself uses it; gradients drawn as slow diagonal silk bands on a canvas, not CSS blur blobs.
- **Images are never static**: a still gets a slow 3–8% push or pan; a UI screenshot gets a camera move, never a fade.

## 3. Type

| Role | Size at 1080p | Notes |
|---|---|---|
| Hero number / word | ≥120px | the one thing the eye lands on |
| Headline | 56–96px | tight tracking, heavy weight |
| Body / support | 28–40px | regular weight, max 2 lines |
| Label / HUD / meta | 18–34px | mono or uppercase, wide tracking |
| Legal / micro | ≥14px | never below 14 at 1080p; below 34 is unreadable on reels |

- Small title lines that grow through the camera are more premium than large fonts that animate in.
- Variable fonts for weight morphs; embed woff2 as base64 and preload all weights used anywhere in the piece.
- One italic serif "voice" line and one mono label style are enough variety.

## 4. Palettes and fallbacks

If the user has no brand, use this **labelled** default and say you did:

```
Apple-style default (replace with your brand)
ground #F5F5F7 · surface #FFFFFF · ink #1D1D1F · muted #86868B
accent #0A84FF · success #30D158 · warn #FF9F0A · danger #FF453A · extra #BF5AF2
font: Inter or system-ui, heavy display weights, tight tracking
material: layered soft shadows, frosted panels with 1px bright edge, macOS-grade squircles
```

Editorial / kinetic default (for reels and showreels):

```
ground #0B0B0F or #F4F0E6 · ink inverse · accent lime #D7FF3E or #FF4D2E
display: condensed grotesk (Anton-like) · labels: mono (JetBrains Mono-like)
one wide heavy grotesk for slams, italic serif for a single "voice" line
```

Never mix the two defaults in one piece.

## 5. Composition

- Hero object fills **60–70%** of the frame; it is not a small tile floating in a void.
- One focal point per shot. Depth via scale + blur (near larger/softer, far smaller/sharper), not via noise.
- 2.5D: real screenshots on a perspective plane with a slow camera is worth more than a fake 3D scene.
- Keep a "ghost" of the start state (a faint outline) when an object transforms; the eye needs the before to read the after.
- Frame within a frame: when a cursor or UI is the subject, crop tight; the audience doesn't need the whole desktop.

## 6. Brand safety

- Use a third-party logo only if the user supplies the file and has the right to show it (integrations). Otherwise neutral rounded tiles with a name.
- Logos over footage: put each logo on its own dark rounded tile; a bare logo disappears on light frames and looks pasted on dark ones.
- Don't reproduce another product's UI pixel-for-pixel; rebuild the idea in the user's own system.
- No real customer names, faces or metrics without attached proof.
