# 🕛 Anthropic `animated-video` (reference only — not mirrored)

Reference entry for a Claude Design skill that is deliberately not mirrored here.

`animated-video` ("timeline-based motion design") is a skill file from Anthropic's
**Claude Design** product. A copy surfaced in the community dump
[asgeirtj/system_prompts_leaks](https://github.com/asgeirtj/system_prompts_leaks/blob/main/Anthropic/claude-design/skills/animated-video/SKILL.md),
which is where this link came from.

It is **listed but not vendored**: the text is leaked proprietary material, so mirroring it
would expose this repository to a DMCA strike; and it only runs against Claude Design's host
runtime (`copy_starter_component`, the `animations_v3.jsx` engine, `window.OM_SCENES`
write-back), so a copied file would be inert anyway. Reasoning and the standing rule for
future additions: [PROVENANCE.md](PROVENANCE.md).

## What is worth keeping from it

The method transfers fine, and open tooling in this category already does it:

| Its rule | Where we do the same thing |
|---|---|
| One continuous composition tree, all elements always mounted, keyed to cues | [`motion-effects`](../motion-graphics-skills/motion-effects) · [`hyperframes-animation`](../../openmontage/skills/hyperframes-animation) |
| Author the scene list first, then choreograph against it | [`motion-brief-writer`](../motion-graphics-skills/motion-brief-writer) · [`video-shotcraft`](../../cinematic-promos/video-shotcraft) |
| Timing is user-editable: trim or speed a section without cutting choreography | [`gsap-timeline`](../../openmontage/skills/gsap-timeline) · [`kinetic-reel`](../opus-video-skills/kinetic-reel) |
| Watch the video, not stills — filmstrip across every scene boundary | [`video-understand`](../../openmontage/skills/video-understand) · [`final-review.md`](../../cinematic-promos/video-shotcraft/references/final-review.md) |

If you have Claude Design, ask it for an animated video there — that is where this skill
lives and runs.
