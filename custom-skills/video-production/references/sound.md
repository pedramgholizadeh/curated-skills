# Sound design

You cannot hear the result, so never describe sound by feel. Measure it, then hand the human 5 timestamps to check with headphones.

## 1. Rules

- **Real recorded SFX only.** No oscillators, sine beeps, or synthesized "clicks". A video with synthetic UI beeps sounds like a prototype.
- **One sound per cue.** Vary takes within a category so repetition doesn't read as a loop.
- **Music is a bed, not a driver** — unless the piece is explicitly beat-led.
- **Measure the exported MP4**, never the intermediate WAV: AAC encoding changes both loudness and peaks.
- **Licences are a gate, not paperwork.** Only CC0 / Mixkit Free / Pixabay / Kenney / Sonniss-style royalty-free, checked for the actual use case. Never redistribute a "no redistribution" file inside the deliverable.
- **Silence on ~half the cuts.** Constant whooshes flatten the edit. Let some transitions land dry.

## 2. Build the cue list from the timeline

Take cues from the composition source (the beat sheet, the `seek(t)` timeline, Remotion frames), not by guessing from the render. If you only have a file, detect cuts:

```bash
ffmpeg -i in.mp4 -vf "select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep showinfo
```

Write `cues.json`:

```json
[
  {"t": 2.0, "type": "scene_cut", "desc": "cut to card"},
  {"t": 4.2, "type": "typing", "dur": 1.3, "desc": "prompt typed"},
  {"t": 6.9, "type": "reveal", "desc": "results appear"},
  {"t": 9.1, "type": "build_up", "desc": "riser into end card"}
]
```

| Cue type | Category | Placement |
|---|---|---|
| movement / camera move | whoosh | start 2 frames early |
| scene_cut | whoosh (short) | 2 frames early |
| appear | pop | on the frame |
| click / tap | click | on the frame |
| typing | typing | loop/trim to duration, quiet |
| build_up | riser | **ends** on the next hit |
| reveal / impact | impact | on the frame, loudest SFX |
| success | pop / ding | on the frame |
| error / glitch / tech | glitch | on the frame |
| hover / minor UI | tick | very quiet |
| ambience | bed | under everything, optional |

Sound grammar that works: **riser → impact → sparkle** for a reveal; quiet ticks for progress; one held note under the closer. One camera-level impact per chapter, ≤3 per piece.

## 3. Beat grid

1. Estimate tempo: `librosa.beat.beat_track`, or `ffmpeg` onset detection if librosa isn't available.
2. Low-pass below 120Hz and plot the first 4 bars against the grid. librosa regularly locks onto the **off-beat** — if kicks sit between lines, shift the whole grid by the median offset and plot again.
3. Snapshot the corrected grid and show it (`beatgrid.png`) to the user.
4. Land cuts, reveals and chapter changes on beats. If the animation can be retimed, retime it; if not, search music offsets and pick the smallest cut-to-beat error. Report the error per cut in ms.
5. Beat-locked ≠ beat-slammed: only whole-frame/camera hits count as slams; the rest move element layers.

Sparse accents should be pinned to real transients, not to interpolated grid points.

## 4. Mix targets

Priority: **voice > SFX > music**.

| Target | Value |
|---|---|
| Integrated loudness | −16 LUFS (web/YouTube), −14 LUFS (social/reels) |
| True peak | ≤ −1.5 dBFS (≤ −4 for safety-heavy masters) |
| Music under SFX | ≈ −12 dB |
| Duck under voice | −8 to −12 dB, 150–250ms attack/release |
| Silent AAC track | required when there is no audio (platforms reject missing streams) |

Normalize at the end:

```bash
ffmpeg -y -i in.mp4 -af "highpass=f=30,equalizer=f=250:t=q:w=1:g=-2,loudnorm=I=-14:TP=-1.5:LRA=8" \
  -c:v copy -c:a aac -b:a 192k out.mp4

# measure
ffmpeg -nostats -i out.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12
ffmpeg -nostats -i out.mp4 -ac 1 -af ebur128=peak=true -f null - 2>&1 | tail -12   # mono check
```

Re-muxing audio doesn't require re-rendering video: `-map 0:v -map 1:a -c:v copy`.

## 5. Libraries and structure

Keep a reusable `assets/sfx/<category>/` folder: `transition, impact, riser, camera, ui, text, paper, film, light, data, scifi, mech, glass, fluid, crowd, counter`. Naming by category means "find a whoosh" is a directory listing, not a search.

- UI category caution: about half of "UI" packs are synthetic notification tones. Audition each; don't ship a folder wholesale.
- Long risers and quiet beds need level checks of their own — normalize per-file, not per-folder.
- If a hero sound is too compressed, fetch the original (Freesound/Kenney), save into the user's project, never into the skill folder.

## 6. Licences and credits

| Source | Allows | Doesn't |
|---|---|---|
| Freesound CC0 | anything, no credit needed | CC-BY needs credit; never CC-BY-NC commercially |
| Kenney | anything (CC0) | — |
| Mixkit SFX | web, social, podcasts, games, film, TV/radio | redistributing the file, bundling in a template/tool |
| Mixkit music | YouTube, social, ads, podcasts, education | CDs/DVDs, TV/radio, games, remixing, Content ID |
| Pixabay | free in videos, no credit | standalone redistribution |
| Sonniss GDC | royalty-free in videos | raw redistribution, AI training |
| YouTube Audio Library | YouTube only | bundling anywhere else |

Write `CREDITS.txt` (sounds used + music + source links) and `SOUND.md` (use case, licence check per source, cue→file table, LUFS/peak numbers, 5 timestamps for the human). If a licence is unknown, name the exact file and stop — never call it "probably fine".

## 7. Prove it

For every cue, pull one frame just before and just after from the final MP4 and plot the waveform around it. Then give the user the **5 riskiest timestamps** (largest beat error, long typing/risers, the reveal) to listen to. Report numbers, not adjectives.
