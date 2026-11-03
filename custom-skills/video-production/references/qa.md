# QA and independent review

You made it, so you have confirmation bias. The first review of a draft is never the user's job.

## 1. Frame checks (do these yourself, in order)

1. **Stills per beat** — one timestamp per row of the beat sheet, rendered at full size, tiled 3 per row.
   Look for: text clipped, two elements colliding, empty frame, off-brand colour, hero too small, unreadable at 1600px.
2. **Boundary filmstrip** — for every cut and loop seam, seek `cut−0.15, cut−0.05, cut+0.05, cut+0.15` and tile them.
   Adjacent frames must be visually continuous. A pop, a jump, or a one-frame flash is a boundary bug that no single still reveals.
3. **Thumbnail test** — the same stills at 200px wide (phone size). If the hook doesn't read, redesign the frame.
4. **Silent test** — watch the master with the sound off. The story must still land.
5. **Muted-number test** — every number, quote and logo on screen is traceable to something the user gave you or a labelled example.

## 2. File checks

```bash
ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,pix_fmt,color_range,color_space,r_frame_rate -of compact renders/master.mp4
ffmpeg -nostats -i renders/master.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12
ffmpeg -i renders/master.mp4 -vf "blackdetect=d=0.1:pix_th=0.10" -an -f null - 2>&1 | grep blackdetect
```

Pass: h264 / expected size / yuv420p / tv / bt709 / audio present; LUFS and peak inside target; no unexpected black segments; audio not silent (unless intentional).

## 3. Slideshow risk

Score 0–2 on each; total ≥6 means rebuild the motion before exporting.

| Dimension | 0 | 1 | 2 |
|---|---|---|---|
| Repetition | every shot unique | some repeated layouts | most shots share a layout |
| Motion | designed motion per shot | fades only on some | stills with fades throughout |
| Shot intent | each shot has a job | a few filler shots | decorative visuals dominate |
| Type reliance | type supports image | type is half the video | type is the whole video |
| Claims | all sourced | mostly sourced | unsupported cinematic claims |
| Continuity | transitions carry the eye | mix of cuts/transitions | random transitions |

## 4. Independent review

Dispatch a subagent with **clean context** (it must not inherit your reasoning). Give it:

- path to the master render, the silent cut, and the stills/filmstrip folder
- `brief.md`, `beat-sheet.md`, `design-spec.md`
- the user's original request, verbatim
- the mode (replica / autonomous / co-creation) and any mid-course decisions logged
- the reference template or shot cards, if any
- this checklist

Prompt template:

```
You are reviewing a finished video as an outside creative director. Do not trust the
maker's summary; inspect the files yourself.

Files: <paths>. Brief and beat sheet: <paths>. Original request: "<verbatim>".
Read frames with your image tool at the timestamps you choose, and run ffprobe yourself.

Report, with a timestamp and evidence for every point:
1. Does the first 4 seconds tell a stranger what this is and why it matters?
2. Is every claim/number/logo traceable to the brief? List anything invented or unsourced.
3. Beat sheet vs actual: which rows land late, early, or not at all?
4. Continuity: any pops, jumps, empty frames, collisions, or unreadable text?
5. Brand: colours, fonts, radii, tone consistent with design-spec? Any drift?
6. Sound: cut-to-beat errors, clipping, silent or loud sections, missing SFX at reveals.
7. Export: codec, range, colours, fps, audio stream, faststart.
8. Three concrete fixes, ordered by impact. Do not rewrite the concept.

Be specific and blunt. "Looks good" is not a finding.
```

Fix what it finds, re-render, and re-check the affected boundaries. Don't ask the user to arbitrate between you and the reviewer.

## 5. Pre-delivery gate

- [ ] Beat sheet timings match the render within ±0.2s
- [ ] 0–2s hook present and readable at 200px
- [ ] Every fact sourced or labelled example
- [ ] No clipped text at any reviewed frame
- [ ] Loop seam identical (if looped)
- [ ] End card holds ≥3s; CTA verbatim
- [ ] Safe zones respected on 9:16
- [ ] Loudness/peak measured on the MP4
- [ ] ffprobe matches the platform profile
- [ ] Source project + brief + credits delivered
- [ ] Independent review completed and findings addressed
