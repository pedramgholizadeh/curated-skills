# 🎬 OpenMontage (vendored)

Full-stack video production toolkit for coding agents, vendored as contributed by Ahmad Mousavi.

Upstream: [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) · [ahmadmousavi.ir](https://ahmadmousavi.ir)

Write a brief, get a finished video: the pack wires agents to real renderers
(Remotion, HyperFrames, GSAP, Manim, Three.js, p5.js), to FFmpeg for cutting and
muxing, to speech-to-text and text-to-speech for narration, and to image/video
model providers for generated footage.

## Contents

| Folder | What it holds |
|---|---|
| [`skills/`](skills/) | 91 agent skills, one folder each with a `SKILL.md` — renderers (`remotion`, `hyperframes*`, `gsap*`, `manim*`, `threejs-*`, `canvas-procedural-animation`), footage & editing (`ffmpeg`, `video-understand`, `create-video`, `website-to-video`, `music-to-video`), audio (`music`, `speech-to-text`, `text-to-speech`, `elevenlabs`, `doubao-tts`, `fish-audio-tts`), generated media (`comfyui`, `ltx2`, `ai-video-gen`, `kling-official`, `bfl-api`, `flux-best-practices`, `minimax-h3`), characters (`svg-character-animation`, `character-rigging`, `avatar-video`, `faceswap`, `heygen`) and animation QA. |
| [`playbooks/`](playbooks/) | Long-form prose per workflow: `core/` (color grading, FFmpeg, subtitle sync, WhisperX, Remotion, HyperFrames), `creative/`, `meta/`, `pipelines/` and [`INDEX.md`](playbooks/INDEX.md) as the entry point. |

## Which subcategory does what belong to?

This pack spans the whole `video-generation/` category, so it is kept intact at
category level rather than split across subfolders:

- cutting, captions, grading, audio sync → see also [`../editing-workflows/`](../editing-workflows/)
- charts, titles, kinetic type → see also [`../motion-graphics/`](../motion-graphics/)
- provider text/image-to-video → see also [`../ai-video-generation/`](../ai-video-generation/)

## Trimming notes

Upstream example media (`assets/`, `demos/`, `examples/`, `.mp4/.gif/.png`
previews, ~150 MB) is **not** mirrored here — the skills reference it but run
without it. Clone upstream if you need the sample footage:

```bash
git clone --depth 1 https://github.com/calesthio/OpenMontage
```

## License

GNU AGPL-3.0 — see [LICENSE](LICENSE). Upstream license is preserved; if you
redistribute or build a service on these files, comply with AGPL terms.

Links from upstream skill docs into `examples/assets/` footage are dead here for the same
reason.
