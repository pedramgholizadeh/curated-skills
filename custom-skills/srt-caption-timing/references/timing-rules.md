# Timing rules

The mechanics behind `scripts/align-srt.mjs` and `scripts/rescale-srt.mjs`.
Read this when a run reports weak matches, unresolved cues or drift you have to
explain.

## 1. Normalisation (before any comparison)

Applied in this order to both transcripts; the order is part of the algorithm.

| Step | Rule | Why it matters |
|---|---|---|
| 1 | drop BOM, zero-width space and bidi controls (`U+FEFF`, `U+200B–U+200F`, `U+061C`, `U+202A–U+202E`) | they are formatting, never words |
| 2 | **delete** ZWNJ `U+200C` and tatweel `U+0640` | they are glue, not word boundaries: deleting makes `می‌کنم` and `میکنم` one token; replacing with a space splits a joined ASR word and costs a match |
| 3 | `NFD`, then strip combining marks `U+0300–U+036F` | `é → e`, `ё → е`, vowel-pointed Arabic → consonant skeleton |
| 4 | `toLowerCase()`, then `NFC` | case folding stays canonical (`İ` handling) |
| 5 | `[^\p{L}\p{N}]+ → space`, split, drop empties | punctuation is noise on both sides; `—`, `،`, `؟`, `.`, `!` must not participate |
| 6 | build a `Set` of tokens per cue | repeated words must not buy a cue a match |

No alphabet is assumed: Latin, Cyrillic and Arabic-script transcripts all align
with the same six steps. Nothing in the scorer keys on a script range.

What still does not match, by design: a real word boundary in one transcript
against a compound in the other (`می کنه` vs `میکنه`, `do not` vs `dont`), and
ASR spelling inventions — proper nouns and borrowed tech words are the usual
casualties (`کلاد` for a Latin product name, a tool's name spelled out as
`اف ام پیک`). They cost one token each; a cue only needs its remaining tokens to
clear the threshold.

## 2. Match score

For approved cue *c* and the contiguous ASR run *a…b*:

```
score(c, a, b) = |tokens(c) ∩ tokens(a…b)| / |tokens(c)|  −  |span(a…b) − duration(c)| / 12
                 \_______ token overlap, 0…1 ______/        \_____ duration prior, seconds/12 _____/
```

- `duration(c)` is the approved cue's own length. The copy is usually written in
  roughly the right proportions, so the length acts as a **soft prior** — it
  discounts a run but rarely vetoes a good overlap. On the production take the
  lowest accepted score was `0.393` (one cue whose ASR spelling damage left a
  thin overlap) and it landed in the right place.
- The `/12` denominator means a 12 s duration mismatch cancels a perfect
  overlap. It is a prior, not a scale factor; retune with `--threshold` rather
  than editing it.
- Search is **monotonic and greedy**: the cursor starts at the ASR cue the
  previous match ended on (re-scanning that boundary cue is allowed, since two
  caption blocks often share one ASR segment), looks at 4 start positions and up
  to 8 ASR cues per run. A run at or above `--threshold` (default `0.34`)
  becomes the cue's time; the span of the run is used, not the individual cue.

## 3. Interpolation (ASR gaps)

Speech-to-text silently drops passages. A cue that clears no run gets a time from the
window between its nearest **confident neighbours**:

```
lo = end of the previous matched cue   (0 if none)
hi = start of the next matched cue     (last ASR end if none)

for each cue in the unresolved run:
    share = (hi − lo) × chars(cue) / Σ chars(run)     # characters, not tokens
    cue.start = cursor;  cue.end = cursor + share;  cursor += share
```

- Weighting is by **character count** (whitespace removed) inside that window
  only, because speech time tracks written length.
- **Never** time proportionally across the whole film. Measured on the
  production take (19 blocks, 143 s of ASR clock): spreading blocks by global
  character share over *spoken time only* put four late cues 10.4–11.0 s early
  and ended the film at 108.73 s instead of 119.71 s; spreading over the full
  span still mis-placed a middle cue by 3.44 s. The error is proportional to the
  film length, so on a ten-minute cut the same arithmetic is off by minutes.
  Local interpolation cannot be wrong by more than the gap it spans.
- **Degenerate window** (`hi − lo < 0.25 s`): an over-long greedy match on both
  sides ate the space. Each such cue gets the `MIN_CARD` placeholder (0.6 s on
  the source clock, so `0.6 / speed` on the master clock) and is reported as
  `unresolved`, because neither character weighting nor the approved duration is
  trustworthy there. The fix is upstream: re-block the copy so block lengths
  track the speech, then re-run.

## 4. Monotonic and duration constraints

Applied after interpolation, before the speed divide, on the source clock:

```
pushed    = max(0, prev.end − cur.start)      → cur.start = prev.end   (zero gap, never backwards)
shortened = max(0, prev.end − cur.end)        → prev.end  = max(prev.start + 0.05, cur.start − 0.001)
if cur.end ≤ cur.start                        → cur.end   = cur.start + 0.6
```

The output is deliberately packed back to back. Display gaps are **not** this
skill's job: the downstream caption planner owns `MIN_GAP` and card timing, so
this stage leaves the chain touching. Overlapping ASR segments and shared
boundary cues are what these rules normally absorb.

## 5. Speed divide

```
master = source / speed        # start and end alike; 1.2 for a 1.2× edit
```

Every timecode is divided, so cue lengths shrink with the speech. `--speed`
defaults to 1 for a real-time edit; a slow-down takes `0.9`.

## 6. Report fields

`--json` prints the summary; `--report <file>` adds the per-cue detail.

| Field | Meaning | Healthy value |
|---|---|---|
| `cues`, `matched`, `interpolated`, `unresolved` | counts by method | `interpolated` ≤ gap cues, `unresolved` = 0 |
| `unresolvedCues` | cues that need the copy re-blocked | empty |
| `weak` | matched cues within 0.08 of `--threshold` | spot-check these by ear |
| `minMatchScore` | lowest score among matched cues | > `--threshold` |
| `tokenMatchRatio` | shared approved tokens / approved vocabulary | > 0.12 (else the run is rejected) |
| `maxDurationDriftSec` | max `|asr span − approved duration|` over matched cues, source clock | a few seconds |
| `monotonicClamps`, `clampedCues` | how often the resolver had to chain cues | single digits |
| `outputOverlaps` | overlaps in the written SRT | **0** |
| `filmStartSec`, `filmEndSec` | first cue start, last cue end, master clock | start ≥ 0.1, end ≤ media duration |
| `approvedClockEndSec`, `asrClockEndSec` | span of each source of truth | within a few seconds |
| `asrGapCount`, `largestAsrGapSec` | silences in the ASR (`--gap`, default 2 s) | the biggest is the missing passage |
| `interpRunCount` | number of interpolation windows | 1–2 typical |
| `clamps[]` | per cue: `pushedSec`, `prevShortenedSec` | inspect pushes > 1 s |
| `interpRuns[]` | `lo`, `hi`, `width`, `degenerate`, `basis` per window | `degenerate` false |
| `asrGaps[]` | `from`, `to`, `width`, `afterAsrCue` | explain every interpolation |

Residual drift is the last column that matters: it is the disagreement between
the copy's assumed shape and the ASR's real shape. Large drift with high match
scores means the copy blocks are badly sized, not that the clock is wrong.

## 7. Guards (why a run may exit 4)

| Guard | Condition | Message |
|---|---|---|
| vocabulary | `tokenMatchRatio < --min-overlap` (default 0.12) | "the two transcripts share only X% of the approved tokens" |
| nothing confident | every cue unmatched | "no approved cue cleared the match threshold… check the argument order" |
| mostly unmatched | unmatched cues > 50 % | "that is a mismatch, not a gap" |

A rejected run writes **no** file — the point is to stop garbage timings from
reaching a render.
