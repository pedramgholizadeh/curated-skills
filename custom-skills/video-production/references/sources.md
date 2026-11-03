# Sources and provenance

> **Catalog note.** This skill catalog ships only the synthesized prose and the
> original helper scripts in this folder. It bundles no upstream files — nothing
> from the repositories below is copied, vendored or mirrored here. Several of
> those upstreams declare **no licence**, which by default means "all rights
> reserved", so any decision to redistribute their contents is the reader's own
> legal check, not something this catalog certifies.

This skill is a synthesis. The wording, structure, checklists and scripts are rewritten for this skill; no source repository is bundled or vendored. Where a technique is distinctive, its origin is noted below.

| Source | Licence | What informed this skill |
|---|---|---|
| Anthropic `claude-design/skills/animated-video` (published via `asgeirtj/system_prompts_leaks`) | Unofficial leak, no licence | Continuous-composition timeline, cue-first authoring, one-caption rule, motion principles, scene-boundary QA, "watch the whole video, not stills" |
| `zhuyansen/awesome-claude-video-skills` | No licence declared | Routing taxonomy (frameworks, promos, explainers, editing, shorts, avatars, stories, motion graphics, music) and the security/quality filter used when choosing a tool |
| `Barty-Bart/motion-graphics` | No licence declared | Explainer structure, the `seek(t)` page contract and spring/keyframe helpers, sound-pass methodology (cue list → beat grid → measure → 5 timestamps), "measure the MP4, not the WAV" |
| `charlie947/motion-graphics-skills` | MIT | Launch-video 7-beat sheet, the 16 motion-effect recipes, vertical safe zones and the H.264/bt709 export recipe, brand intake discipline |
| `tuzhechen2005/opus-video-skills` | No licence declared | Kinetic-reel storyboard method, chapter weighting, honest-data/`SCHEMATIC` labelling, editorial type system, loop and score discipline |
| `Vincentwei1021/video-shotcraft` | Apache-2.0 | Asset-first planning, "cinematic from camera/light/rhythm/sound", one-motion-per-shot and hold budgets, real-screenshot capture, independent final review, beat-synced BGM workflow |
| `calesthio/OpenMontage` | AGPL-3.0 | Production governance: pre-compose validation, post-render self-review, slideshow-risk scoring, platform output profiles, decision audit trail, quality gates |

## Notes on reuse

- The reference files are original prose. Short, widely-known technique names (ease curves, loudness targets, H.264 flags) are not copyrightable and are used as facts.
- `assets/motion.js` and `assets/render-html.mjs` are new implementations of a common pattern (drive a deterministic page with Playwright, pipe frames into ffmpeg). They are not copies of any repository's source.
- If you plan to redistribute this skill commercially, re-check the licence of each upstream repository yourself — several declare no licence, which means "all rights reserved" by default. Linking to them is always safe; copying their files is not.
- Sound-effect licensing rules in `references/sound.md` are operational guidance, not a legal opinion. Check the source page at the time of use.

## Upstream homes

- https://github.com/asgeirtj/system_prompts_leaks
- https://github.com/zhuyansen/awesome-claude-video-skills
- https://github.com/Barty-Bart/motion-graphics
- https://github.com/charlie947/motion-graphics-skills
- https://github.com/tuzhechen2005/opus-video-skills
- https://github.com/Vincentwei1021/video-shotcraft
- https://github.com/calesthio/OpenMontage
