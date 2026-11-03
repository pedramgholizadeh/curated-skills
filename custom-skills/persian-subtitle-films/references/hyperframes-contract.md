# HyperFrames contract for this project

Version pinned: **hyperframes 0.9.8** (run with `npx hyperframes`, Node ≥ 22,
FFmpeg on PATH). Every project carries a `package.json` with the pinned scripts
so a later agent does not drift to another version.

## The 2:1 canvas

```html
<meta name="viewport" content="width=1920, height=960" />
<div id="root" data-composition-id="main" data-width="1920" data-height="960"
     data-start="0" data-duration="42" data-fps="30">
```

- `html, body { width: 1920px; height: 960px; overflow: hidden; }`
- Scene roots use `position: absolute; inset: 0;` — never hard-coded pixels.
- Do **not** pass `--resolution landscape` to render: it is 16:9 and will
  mismatch. The composition's own 1920×960 is the delivery size.
- For a 2× master, render with `--crf 16` at the same dimensions; do not scale
  the composition.

## Rules that break renders

1. Timed element = `class="clip"` + `data-start` + `data-duration` (seconds).
   It shows over `[start, start + duration)`; an end state landing exactly on
   the end is never visible.
2. Root `data-duration` is the film length; overrun is cut, early end holds.
3. Each composition registers a paused timeline:
   ```js
   const tl = gsap.timeline({ paused: true });
   /* tweens, absolute times */
   window.__timelines["<data-composition-id>"] = tl;
   tl.seek(0);
   ```
   The key must equal the host id and the scene root id. A mismatch gives a
   45 s wait per scene then a static frame.
4. Scene files: everything inside `<template>`; styles target `#root`; host,
   scene root and timeline key share the same id; element ids are prefixed
   (`#title-headline`) and unique across the page.
5. Use `fromTo`, not `from`, inside a scene — hosts re-seek on every show.
6. Never `add()` a scene timeline to the root. The runtime drives each scene.
7. No `Date.now()`, unseeded `Math.random()`, `setTimeout`, network fetches,
   `repeat: -1`. Everything visible is a function of timeline time.
8. Never tween `display`, `visibility` or `autoAlpha` on a `.clip`, and never
   `tl.set` them either — lint flags any GSAP write to those properties on a
   clip. Animate a child (or the clip's `opacity`); the runtime hides a clip
   outside `[start, start + duration)` on its own.
9. Never put CSS `transform` on an element GSAP transforms; start inside tween.
10. Only bundled fonts resolve by name; Vazirmatn is **not** bundled, so every
    file that uses it carries the `@font-face` below and the fonts live in
    `assets/fonts/` (paths relative to the project, e.g. from a scene file also
    `assets/fonts/...`).
11. Asset paths `assets/...`, no leading slash.
12. One scene per sub-composition; the root holds scene hosts, media and audio.

## Vazirmatn loading

`assets/fonts/vazirmatn.css` is copied by the scaffolder and linked from
`index.html`; scene files inherit the loaded faces (same document). Put this in
the root head before any composition script:

```html
<link rel="preload" href="assets/fonts/vazirmatn-arabic-100-900.woff2"
      as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="assets/fonts/vazirmatn.css" />
```

```css
@font-face {
  font-family: "Vazirmatn";
  font-style: normal;
  font-weight: 100 900;
  font-display: block;
  src: url("vazirmatn-arabic-100-900.woff2") format("woff2");
  unicode-range: U+0600-06FF, U+0750-077F, U+0870-0891, U+08E3-08FF,
    U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FEFC;
}
@font-face {
  font-family: "Vazirmatn";
  font-style: normal;
  font-weight: 100 900;
  font-display: block;
  src: url("vazirmatn-latin-100-900.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+2000-206F, U+20AC, U+2122, U+2190-2193, U+2212;
}
@font-face {
  font-family: "Vazirmatn";
  font-style: normal;
  font-weight: 100 900;
  font-display: block;
  src: url("vazirmatn-latin-ext-100-900.woff2") format("woff2");
  unicode-range: U+0100-02BA, U+02BD-02C5, U+1E00-1E9F, U+1EF2-1EFF, U+2C60-2C7F;
}
```

Verify the font actually rendered: snapshot one still and look for joined
Persian letters (not boxes, not disconnected glyphs, not an Arial fallback).
If the compiler rewrites the CSS, keep the file reference (never a Google Fonts
URL) and re-check.

## Commands

```bash
npx hyperframes init <dir> --example blank --non-interactive --skip-skills
npx hyperframes check --json
npx hyperframes timeline --json
npx hyperframes snapshot --at 0.5,2,6 --out review/stills
npx hyperframes snapshot --review
npx hyperframes preview --background
npx hyperframes render -o renders/final.mp4 --quality delivery
npx hyperframes render --quality draft        # fast iteration
npx hyperframes doctor
```

`check` reports most violations with a `Fix:` line. Fix every error before a
render; weigh every warning.

## Lint errors you will meet

| Rule | Fix |
|---|---|
| `video_missing_muted` | timed `<video>` gets `muted` or `data-has-audio="true"` |
| `gsap_css_transform_conflict` | set the start state inside `fromTo` |
| `gsap_animates_clip_element` | animate a child of the `.clip` (opacity on the clip is allowed); never write `visibility`/`display`/`autoAlpha` |
| `clip_ends_past_root_duration` | raise root `data-duration` |
| `sweep_static` | a 3 s+ static scene: add the background drift, or `data-no-timeline` for a still |
| `missing_data_no_timeline` | a root/host without a timeline gets `data-no-timeline` |
| `font_family_without_font_face` | add the @font-face and a real file |
| `subcomposition_root_styled_by_class` | style a scene root as `#root` |
| `nested_clip_never_visible` | nested clip windows must fall inside the parent |

## Project shape

```
videos/<slug>/
├── index.html                 root: stage, hosts, audio, root timeline
├── compositions/
│   ├── title.html
│   ├── captions-01.html       generated by tools/srt.mjs build, 6 cards per file
│   ├── captions-02.html
│   └── endcard.html
├── assets/
│   ├── fonts/                 vazirmatn*.woff2 + vazirmatn.css
│   ├── vendor/gsap.min.js
│   ├── hypermotion.js
│   ├── audio/
│   └── video/
├── tools/srt.mjs              copied by the scaffolder
├── notes/srt-report.md        written by build
├── input/script.fa.srt
├── timeline.json
├── SPEC.md
├── brief.md
├── hyperframes.json
├── package.json
└── renders/
```

Every caption file gets its own host in `index.html`, all on
`data-track-index="20"` so Studio shows one captions lane. Splitting the cards
keeps each scene timeline short; a single file with 10+ cards raises
`timeline_track_too_dense` and makes the timeline panel unusable.

All scripts from the skill are copied into `videos/<slug>/tools/` by the
scaffolder so the project stays self-contained (the user can rebuild without the
skill folder).
