---
name: srt-caption-timing
description: Put a proofread caption transcript on a machine transcript's word-accurate clock and onto the edited master's timeline, using monotonic word-overlap alignment, local interpolation across ASR gaps and a speed-factor divide. Use when re-timing a corrected transcript onto an ASR word clock, when captions drift after a speed-up or slow-down (1.2x reels, jump cuts, title-card offsets), when the ASR silently dropped a passage, or when subtitle drift after editing must be fixed without re-transcribing. Timing only — caption styling, RTL layout and card chunking belong to the caption-styling skill.
sources:
  - video-generation/editing-workflows
  - video-generation/openmontage/skills/speech-to-text
  - video-generation/openmontage/skills/hyperframes-media
  - custom-skills/persian-subtitle-films
---

# SRT Caption Timing

Two sources of truth for one caption track, and neither is enough alone:

| Source | Trust | Do not trust |
|---|---|---|
| ASR transcript (word-level output of any speech-to-text model) | **its clock** — word-accurate times | spelling (it rendered a Latin product name as `کلاد`, and spelled a tool's name out letter by letter as `اف ام پیک`), plus passages it silently dropped |
| Proofread copy | **its words** — what the viewer reads | its timings: rounded blocks, a title-card offset, an unrelated pass |

This skill keeps the WORDS from the copy and the TIMES from the ASR, then divides
by the playback factor so captions land on the edited master. It ships two
dependency-free Node scripts in [`scripts/`](scripts/). It does **not** style,
chunk or lay out captions: hand the timed SRT to the caption-styling skill
(`custom-skills/persian-subtitle-films` for RTL/Persian) as the downstream step.

## Decision flow

| Situation | Use |
|---|---|
| Corrected copy + ASR of the same take, timings shifted or rounded | `scripts/align-srt.mjs` |
| ASR dropped 5–15 s of speech (a hole between two of its cues) | `scripts/align-srt.mjs` — the hole is interpolated locally |
| Copy is already on the source clock; only playback changed | `scripts/rescale-srt.mjs` |
| Jump-cut edit with no re-transcription | `rescale-srt.mjs` per kept segment: stamp each kept clip's start, then align if the copy drifted |
| A translated copy of the spoken take | `align-srt.mjs`, but expect a low `tokenMatchRatio`: translation breaks word overlap (see Failure modes) |
| Captions look wrong at 2x, or the take was never sped up | do not divide twice — check `--speed` against the render command |

`--speed` is the playback factor of the **edit** (1.2 for a 1.2x master, 0.9 for
a slow-down), never the transcription speed.

## Pipeline

Prerequisites: Node 20+ only — the helpers are pure ESM with zero dependencies,
and they write nothing except `--out` and `--report`.

```bash
# 1) sanity: both files must describe this take
node scripts/align-srt.mjs approved.srt asr.srt --out timed.srt --speed 1.2 --json

# 2) read the report before rendering
#    matched / interpolated / unresolved, minMatchScore, maxDurationDriftSec,
#    monotonicClamps, outputOverlaps, filmEndSec

# 3) hand off to the caption-styling skill (chunking, RTL, card timing)

# fallback, when the copy is already on the source clock:
node scripts/rescale-srt.mjs captions.srt --speed 1.2 --out timed.srt --json
```

Flags: `--out` (required, `-` pipes the SRT to stdout and the report to stderr),
`--speed` (default 1), `--threshold` (default 0.34), `--min-overlap` (default
0.12), `--gap` (silence length to report as an ASR hole, default 2 s), `--report
<file>` (detailed JSON), `--json`, `--quiet`, `--help`. Exit codes: `0` ok, `2`
usage, `3` unreadable/malformed SRT, `4` alignment failure (nothing is written).

Steps that matter:

1. Feed the ASR **raw** — no cleaning. Its misspellings are the cost of its good
   clock; normalisation absorbs them (see
   [`references/timing-rules.md`](references/timing-rules.md)).
2. Keep the copy in reading order and roughly in the shape of the speech: cue
   durations are a soft prior, so a copy blocked into 15 s paragraphs makes the
   greedy windows swallow their neighbours' cues.
3. Run, read `unresolved` and `weak`, fix the **copy blocking**, run again.
   Tuning `--threshold` changes how much you invent, not how correct you are.
4. Confirm `filmEndSec` against the media duration before rendering.

## Reading-speed reality check

Re-timing fixes the clock, not the viewer's reading speed. Before styling,
budget the copy against the target language:

- Persian/Arabic script: comfortable ≤ 18 visible chars/s, hard ceiling ~25;
  Latin subtitles: ~15–17 chars/s; CJK: 8–12 chars/s.
- Count **visible characters** (no spaces, ZWNJ removed) divided by the cue's
  length on the master clock. If a cue exceeds the budget you have three levers,
  and two are usually lies:
  - *extend into silence*: check the film's total silence first. This take
    contained 0.22 s of it — nothing to extend into.
  - *split into more cards*: splitting makes speed **worse**, because each extra
    card pays a minimum gap and still starts when its first word is spoken.
    Measured on that project: 5-word cards gave **97 cards / 62 over the speed
    budget**; 7-word cards gave **73 cards / 39 over**. Fewer, longer cards read
    faster.
  - *edit the copy down*: the only lever that actually works on a dense take.
- Reading speed is **speech-bound** when the source is a continuous monologue
  (≈3 words/s here). Removing the 1.2x speed-up would not have fixed it: the
  same phrase measured ≈21 chars/s at 1x. Say so explicitly rather than
  promising a fix; the accepted outcome was cards locked to speech, held at a
  minimum of 0.7 s and 20 chars/s so nothing flashes.

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| One cue lands inside a hole the ASR lost (here: 11.76 s between 18.3 s and 30.06 s) | no word overlap available | expected: the aligner interpolates **locally** between the nearest confident neighbours, weighted by characters, and reports `interpolated` |
| Cues progressively out of place — tens of seconds on a two-minute film, minutes on a longer cut | **global character proportion** (`cueChars / filmChars × filmLength`) — one long opening block shifts everything behind it. Measured on the real take: mapping onto spoken time only put four late cues 10.4–11.0 s early and ended the film at 108.73 s instead of 119.71 s | never scale globally; interpolate only inside the window between the two confident neighbours (`references/timing-rules.md` §3) |
| Cue with a 0.5 s hold, report says `unresolved` | over-padded copy let greedy windows eat the window; nothing left to interpolate | re-block the approved copy so block length tracks speech, re-run; do not accept the placeholder into a render |
| `low-confidence match` warning | score within 0.08 of `--threshold` | spot-check that cue by ear; ASR spelling damage or a padded block is usually the reason |
| A cue starts before the previous one ends / overlaps | overlapping ASR segments; two blocks sharing one ASR boundary cue | monotonic resolver pushes the start to the previous end (zero gap) and trims the earlier cue; `outputOverlaps` must be 0 |
| `monotonicClamps` large (> ~10% of cues) | copy order does not follow the speech, or the wrong ASR file | fix the order upstream; do not silence it |
| Exit 4 `share only X% of the approved tokens` | wrong language, wrong recording, or a translated copy over the original ASR | transcribe the same language you will caption; for a translation, align the source-language copy first, then translate in place |
| Persian compound never matches | ZWNJ replaced by a space splits `می‌کنم` into `می` + `کنم` while ASR wrote `میکنم` | ZWNJ and tatweel are **deleted**, not spaced (script does this already; keep it that way when editing) |
| Tail lands past the media | `--speed` applied twice (e.g. re-running on an already-rescaled file) | re-timing divides by `--speed`; check `filmEndSec` against the master duration |

## Verification checklist

Run this on every timed SRT before it goes anywhere near a render:

- [ ] `outputOverlaps` = 0 and no cue starts before the previous one ends.
- [ ] First cue starts ≥ 0.1 s after zero (the intro card needs the room).
- [ ] Last cue ends ≤ the media duration, with a deliberate margin for the end
      card (here 119.708 s of captions against a 119.8 s clip, then a 3 s end
      card placed by hand at 119.8 s so the footage never shows black).
- [ ] `interpolated` + `unresolved` = 0, or every one of them has been heard.
- [ ] `monotonicClamps` explained by the report's `clamps[]` entries.
- [ ] `maxDurationDriftSec` accepted: seconds of drift are expected on rounded
      copy; a step change means a wrong pairing.
- [ ] Spot-check **three known sentences against the audio**: the opening hook,
      one cue that sits next to an ASR hole, and the closing line. Listen for the
      first syllable, not for the caption you remember.
- [ ] Names, numbers and product terms the ASR garbled are corrected in the
      **copy**, never in the ASR file; then re-run.
- [ ] Reading speed within the target language's budget (see the reality check).

## Worked example (production numbers)

A Persian talking-head take, edited into a 1.2x vertical reel (119.8 s master).

- ASR: 54 cues, word-accurate clock, silent 11.76 s hole between 18.3 s and
  30.06 s, and every proper noun mangled (`کلاد` for a Latin product name).
- Approved copy: 19 cues, perfect spelling, timings carrying a +3.9 s title
  offset and rounded to blocks.

```bash
node scripts/align-srt.mjs copy.srt asr.srt \
  --out timed.srt --speed 1.2 --report timing-report.json
```

The words come from one file, the times from the other:

| Cue | Copy (trusted words, wrong clock) | ASR (right clock, wrong words) | Output |
|---|---|---|---|
| 1 | `03,900 → 06,329` `سلام. چطوری ویدیو ادیت می‌کنی؟` | `00,130 → 02,180` `سلام چطوری ویدیو ایدیت میکنن؟` | `00:00:00,108 --> 00:00:01,817` copy text |
| 5 | `23,125 → 28,200` (the passage the ASR lost) | *nothing to match against — its cue 8 ends at `18,300` and cue 9 starts at `30,060`* | `00:00:15,250 --> 00:00:20,562`, character-weighted inside the window to the next confident cue |

Measured result — 19 approved cues merged onto 54 ASR cues at speed 1.2:

```
matched 17 · interpolated 2 (the two blocks inside the ASR's 11.76 s hole, spread
             over the 13.61 s window between their confident neighbours)
unresolved 0 · weak 1 (min score 0.393) · monotonicClamps 1 · outputOverlaps 0
max |asr span − approved duration| 3.143 s · shared tokens 68.8 %
film 119.708 s against a 119.8 s master
```

Those 19 cues became 73 caption cards in the downstream styling step. The two
interpolated cues are exactly the passage the ASR never heard; they were checked
by ear, everything else was already on the word clock.

## Resources

- [`scripts/align-srt.mjs`](scripts/align-srt.mjs) — alignment, interpolation,
  monotonic repair, speed divide, reports and guards.
- [`scripts/rescale-srt.mjs`](scripts/rescale-srt.mjs) — the speed-only fallback.
- [`references/timing-rules.md`](references/timing-rules.md) — the scoring
  formula, the interpolation rule, monotonic constraints, report fields, guards.
