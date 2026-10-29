# Video Generation Skills

Skills for producing finished video in code and with AI: promos, explainers,
motion graphics, editing, and generative workflows.

## Subcategories

| Folder | Covers | Skills |
|---|---|---|
| [cinematic-promos/](cinematic-promos/README.md) | Product promos, shot recipes, sound design | 1 pack |
| [explainers/](explainers/README.md) | Narrated explainers, storyboards, scripts | see cross-refs |
| [motion-graphics/](motion-graphics/README.md) | Kinetic typography, animated charts, titles | 3 packs, 23 skills |
| [editing-workflows/](editing-workflows/README.md) | Cutting and compositing existing footage | see cross-refs |
| [ai-video-generation/](ai-video-generation/README.md) | Text/image-to-video generation with AI tools | 1 index (373 repos) |
| [openmontage/](openmontage/README.md) | Vendored cross-cutting toolkit: renderers, audio, footage, providers | 91 skills + playbooks |

## Layout

```
video-generation/
├── <subcategory>/<pack>/<skill-name>/SKILL.md   # vendored collections
└── <subcategory>/<skill-name>/SKILL.md          # atomic skills you add here
```

`openmontage/` sits at category level because its skills span every subcategory above;
each subcategory README links the parts that belong to it.

## Vendored sources

Six collections contributed by [Ahmad Mousavi](https://ahmadmousavi.ir) — upstream
licenses preserved in each pack folder, heavy demo media trimmed (see each README):

| Pack | Upstream | License |
|---|---|---|
| [openmontage/](openmontage/README.md) | [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | AGPL-3.0 |
| [cinematic-promos/video-shotcraft/](cinematic-promos/video-shotcraft/README.md) | [Vincentwei1021/video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) | Apache-2.0 |
| [motion-graphics/motion-graphics-skills/](motion-graphics/motion-graphics-skills/README.md) | [charlie947/motion-graphics-skills](https://github.com/charlie947/motion-graphics-skills) | MIT |
| [motion-graphics/bart-motion-graphics/](motion-graphics/bart-motion-graphics/README.md) | [Barty-Bart/motion-graphics](https://github.com/Barty-Bart/motion-graphics) | MIT |
| [motion-graphics/opus-video-skills/](motion-graphics/opus-video-skills/README.md) | [tuzhechen2005/opus-video-skills](https://github.com/tuzhechen2005/opus-video-skills) | MIT |
| [ai-video-generation/awesome-claude-video-skills/](ai-video-generation/awesome-claude-video-skills/README.md) | [zhuyansen/awesome-claude-video-skills](https://github.com/zhuyansen/awesome-claude-video-skills) | CC0 1.0 |

One further source — the `animated-video` skill leaked from Anthropic's Claude Design
product — is listed but deliberately **not** mirrored, in
[motion-graphics/anthropic-animated-video/](motion-graphics/anthropic-animated-video/README.md).

See the root [README.md](../README.md) for usage and
[CONTRIBUTING.md](../CONTRIBUTING.md) for the quality bar.

## Skill index

| Skill | Subcategory | Status |
|---|---|---|
| [video-shotcraft](cinematic-promos/video-shotcraft/SKILL.md) | cinematic-promos | Ready |
| [motion-graphics-skills × 15](motion-graphics/motion-graphics-skills/README.md) | motion-graphics | Ready |
| [bart-motion-graphics × 6](motion-graphics/bart-motion-graphics/README.md) | motion-graphics | Ready |
| [opus-video-skills × 2](motion-graphics/opus-video-skills/README.md) | motion-graphics | Ready |
| [openmontage × 91](openmontage/README.md) | cross-category | Ready |
| [awesome-claude-video-skills](ai-video-generation/awesome-claude-video-skills/README.md) | ai-video-generation | Index |
| — | explainers, editing-workflows | Add your own skills here |
