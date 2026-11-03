# SRT → 2:1 Persian captions

The SRT is the script. Its cues set the timing; its text is never paraphrased
and never machine-translated. Captions are authored at *build* time as static
HTML — nothing is created at render time.

## 1. Read the report before building

`node scripts/srt.mjs parse <file.srt> --out timeline.json` prints:

```
cues        142
duration    09:12
overlaps    3   → fixed by trimming the earlier cue
long        2   → cues over 7 s, will be split in `plan`
fast        5   → reading speed over 18 chars/s; shorten or extend
empty       0
latinOnly   4   → Latin-only cues, isolated with dir="ltr" in output
badEncoding 0   → mojibake or broken tokens; stop if > 0
```

Rules:

- **Overlaps**: trim the earlier cue to `next.start - 0.04`.
- **Cues > 7 s**: split at the nearest sentence boundary or the largest pause.
- **Reading speed**: Persian comfortable range is **11–16 characters/second**;
  hard limit 18. If a cue exceeds it, either extend into the following silence
  (never overlap the next cue) or split the cue.
- **Empty cues**: delete; never leave an invisible card.
- **Numbers**: keep the speaker's digits; normalise Arabic-Indic ٠١٢ to Persian
  ۰۱۲ and Latin 012 to Persian ۰۱۲ only in running copy, never in URLs.
- **Characters**: `ي→ی`, `ك→ک`, `ۀ→هٔ` (keep the hamza), preserve ZWNJ.
- **Tags**: strip `<i>`, `<b>`, `{\an8}`, `{\pos(...)}`. Bold in the SRT is not
  emphasis on screen; emphasis is explicit, see §4.

## 2. Grouping (build-time)

A **caption card** is what the viewer reads in one beat.

| Setting | Value |
|---|---|
| Words per card | 3–7 (7 only when the card stays `≤ 34 chars/line`); 2–3 for high energy |
| Lines per card | 2 max |
| Characters per line | ≤ 34 |
| Characters per card | ≤ 68 |
| Minimum duration | max(0.9 s, chars / 16 + 0.35 s) |
| Maximum duration | 6.5 s |
| Gap between cards | 0.06 s (the runtime hides the outgoing clip) |
| Break preference | sentence end → «،» «؛» «؟» «!» → pause ≥ 120 ms → word limit |
| Start offset | first card starts 0.15 s after the first cue, never at exactly 0 |
| End offset | last card ends 0.12 s after its last cue, before the next card |

A card may contain text from two adjacent cues only if the gap is < 120 ms and
the combined card stays inside the limits.

### Line breaking (Persian)

- Break **only at spaces**, never inside a word, and never between a word and
  its ZWNJ. Treat `می‌سازم` as one unbreakable token.
- Do not leave a single-word last line (orphan) if it can be balanced; the
  builder splits a two-row card at the point where the rows are closest in
  length, so the break never separates «ادیت» from «میکنه».
- Keep a preposition with its noun: «در ایران»، «برای تو» on the same line.
- Never break before «را»، «که»، «و» alone at line start if avoidable.
- A card with a Latin token (`example.com`, `SEO`) keeps it on one line with the
  `<bdi dir="ltr">` isolate.

## 3. Caption composition

`node scripts/srt.mjs build <project>` writes `compositions/captions-01.html`,
`captions-02.html`, … — **six cards per file**, so no composition timeline holds
more than six clips. `index.html` gets one host per file, all on
`data-track-index="20"` and `data-track-kind="captions"`, so Studio shows a
single captions lane:

```html
<!-- captions:start -->
<div id="captions-01-host" class="scene-host" data-composition-id="captions-01"
     data-composition-src="compositions/captions-01.html" data-start="0"
     data-duration="24.36" data-width="1920" data-height="960"
     data-track-index="20" data-track-kind="captions"></div>
<!-- captions:end -->
```

```html
<template>
  <style>
    #root { position: absolute; inset: 0; }
    .cap {
      position: absolute;
      inset-inline: 0;
      bottom: 88px;
      padding-inline: 220px;
      text-align: center;
      opacity: 0;
    }
    .cap-line {
      display: inline-block;
      max-width: 1480px;
      font: 700 76px/1.45 var(--font-fa);
      color: var(--color-ink);
      text-shadow: 0 2px 22px rgba(0, 0, 0, 0.55);
    }
    .cap-word.hot { color: var(--color-accent); }
  </style>

  <div id="root" data-composition-id="captions-01" data-width="1920" data-height="960">
    <div id="cap-001" class="clip cap" data-start="0.15" data-duration="2.4" data-track-index="20">
      <div id="cap-001-line" class="cap-line">
        <span class="cap-word">هر</span> <span class="cap-word">ایده،</span>
        <span class="cap-word hot">یک</span> <span class="cap-word">تجربه</span>
      </div>
    </div>
    <!-- one .cap per card, absolute, never stacked in flow -->
  </div>

  <script>
    const tl = gsap.timeline({ paused: true });
    // per card, at its absolute start: fade + 8px rise of .cap-line,
    // then fade out before the card's end. No visibility/display writes.
    window.__timelines["captions-01"] = tl;
  </script>
</template>
```

Rules baked into the builder:

- **Chunked hosts** in `index.html`, six cards per file, every host with
  `data-track-kind="captions"` and the same `data-track-index="20"`. The marker
  block `<!-- captions:start -->…<!-- captions:end -->` is replaced whole on
  every rebuild.
- **One group visible at a time**; each group is `position: absolute` so hidden
  groups never reflow the next one.
- Card motion: `opacity 0 → 1` on the card, `y 8 → 0` + `blur 5px → 0` on
  `.cap-line`, 0.18 s `power3.out`, starting at the card's start. Exit:
  `opacity → 0` in 0.12 s at `end − 0.12`.
- **Never write `visibility` or `display`** — not even an instant `tl.set` —
  on a `.clip`: HyperFrames lint rejects it (`gsap_animates_clip_element`). The
  runtime already hides a clip outside `[start, start + duration)`.
- Every card carries `data-hold`: a caption that sits 3 s while it is read is
  deliberate stillness, so `check` must not flag it as `dead_stretch`.
- Never animate the words inside a card after it lands.
- Do not fade both the card and the line; the builder fades the card and moves
  the line once.

A `timeline_track_too_dense` warning at 6 clips is expected and harmless; if
`check` reports it at 4 or fewer, the chunk size or the card count changed — look
before ignoring it.

### Fit

The builder estimates width with Vazirmatn metrics. If a card exceeds 1480 px:

1. rebalance the line break (34 chars/line),
2. drop to 72 px, then 68 px,
3. as a last resort, split the card in two — never shrink below 64 px.

At render time `window.__hyperframes.fitTextFontSize(text, { fontFamily:
"Vazirmatn", fontWeight: 700, maxWidth: 1480 })` is the source of truth; use it
when a card contains unusually wide words.

## 4. Emphasis (optional, explicit)

The SRT may contain two markers; the parser keeps them and the builder renders
them:

| Mark | Render | Use |
|---|---|---|
| `**واژه**` | mint (`--color-accent`) | one keyword per card, max |
| `__واژه__` | scale 1.12 + mint underline 4 px from right | one per film, for the payoff |

Anything else stays plain. Never colour a stop-word; never colour more than one
word per card.

## 5. Scene rhythm from the SRT

`plan` derives boundaries from silences:

- silence ≥ 0.9 s → a **chapter beat**: the caption card gets 0.35 s of air
  before and after, and an optional chapter card may enter.
- The first card is preceded by the **title scene** (3.6 s) only when the first
  card starts at ≥ 3.8 s; earlier than that the title is hidden, because speech
  over it or a truncated title both read as mistakes.
- The last card is followed by the **end card** (3 s) with the lockup and
  site, copied verbatim from the user.
- Scenes do not cut while a caption is on screen. Cut in the gap.

## 6. Optional audio/video

If the user sends the source:

```html
<!-- in index.html, root level -->
<audio id="vo" class="clip" data-start="0" data-duration="123.4" data-volume="1"
       src="assets/audio/voice.mp3"></audio>

<video id="cam" class="clip" data-start="0" data-duration="123.4" data-volume="1"
       data-has-audio="true" playsinline src="assets/video/source.mp4"></video>
```

- Captions stay identical to the SRT; do not re-transcribe.
- With a talking head, place captions below the face, never across it; if the
  face fills the frame, use the 2:1 letterbox band or move the face up 8 %.
- Music: `data-volume="0.22"` under voice; never above 0.3.
- If the user supplies no audio, the film is silent; do not add generated music.

## 7. Caption QA

- Every card readable at 100 %, 1600 px and 200 px wide.
- No clipped descenders: ی ج چ ح خ ع غ ق ن.
- No ZWNJ broken across lines; no Latin run flipped.
- One card visible at a time; no stale card after its end.
- Reading speed inside 11–16 chars/s.
- Caption band stays inside the 80 % title-safe box (bottom 88 px, 220 px sides).

## 8. Handling a bad SRT

Never rewrite the user's words. If the SRT is unusable (garbage, translation,
more than 20 % broken tokens), stop and report the exact problem with two
sample lines. If it is merely late/overlapping, fix timings and say what changed
in `notes/srt-report.md`.
