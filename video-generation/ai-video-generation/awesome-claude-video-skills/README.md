# 🧭 Awesome Claude Video Skills (vendored index)

A machine-readable directory of 373 open-source repos that let coding agents make video, vendored as contributed by Ahmad Mousavi.

Upstream: [zhuyansen/awesome-claude-video-skills](https://github.com/zhuyansen/awesome-claude-video-skills) · [ahmadmousavi.ir](https://ahmadmousavi.ir)

This is **not** a skill pack: there is no `SKILL.md` here. It is the shortlist layer — read it
to choose which upstream repo to install, then vendor or install that repo.

## Contents

| Path | What it holds |
|---|---|
| [`data/skills.json`](data/skills.json) | All 373 entries: `repo_full_name`, `description`, `stars`, `kind`, `security_grade`, `language`, `license`, optional `path`. |
| [LICENSE](LICENSE) | CC0 1.0 — the list itself is public domain. |

## The kinds, and the leaders in each

| Kind | Repos | Top by stars |
|---|---|---|
| 🧱 Frameworks & toolkits | 65 | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) (74420★) · [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) (72625★) · [hypit-ai/hypit](https://github.com/hypit-ai/hypit) (26176★) |
| 📣 Promo & demos | 72 | [feitangyuan/onetake](https://github.com/feitangyuan/onetake) (3426★) · [echris6/motion-video-kit](https://github.com/echris6/motion-video-kit) (1239★) · [Tejashmakwana/motionmaxxing](https://github.com/Tejashmakwana/motionmaxxing) (1090★) |
| 🎓 Explainers | 66 | [EverMind-AI/Raven](https://github.com/EverMind-AI/Raven) (5879★) · [Alisa0808/vox-director](https://github.com/Alisa0808/vox-director) (2495★) · [adithya-s-k/manim_skill](https://github.com/adithya-s-k/manim_skill) (1226★) |
| ✂️ Editing | 48 | [FireRedTeam/FireRed-OpenStoryline](https://github.com/FireRedTeam/FireRed-OpenStoryline) (3579★) · [Agentchengfeng/chengfeng-videocut-skills](https://github.com/Agentchengfeng/chengfeng-videocut-skills) (3149★) · [0xsline/OpenChatCut](https://github.com/0xsline/OpenChatCut) (2744★) |
| 📱 Shorts & social | 44 | [adunext/adu-motion-video](https://github.com/adunext/adu-motion-video) (601★) · [Yuuhann1999/agent-storyboard](https://github.com/Yuuhann1999/agent-storyboard) (378★) · [hassancs91/claude-faceless-shorts-creator](https://github.com/hassancs91/claude-faceless-shorts-creator) (285★) |
| 🧑‍💼 Avatars | 8 | [cclank/lanshu-create-ai-presenter-video](https://github.com/cclank/lanshu-create-ai-presenter-video) (2832★) · [heygen-com/skills](https://github.com/heygen-com/skills) (525★) · [Upload-Post/avatar-mix](https://github.com/Upload-Post/avatar-mix) (135★) |
| 📖 Stories & animation | 20 | [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) (8974★) · [gnipbao/story-to-handdrawn-video](https://github.com/gnipbao/story-to-handdrawn-video) (2311★) · [JohnHeibel/ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) (2209★) |
| 🎞 Motion graphics | 25 | [diffusionstudio/lottie](https://github.com/diffusionstudio/lottie) (5638★) · [nolangz/pixel2motion](https://github.com/nolangz/pixel2motion) (2534★) · [pyang5166/gbro-collage-broll](https://github.com/pyang5166/gbro-collage-broll) (1553★) |
| 📝 Scripts & learning | 10 | [jtydhr88/screenwriting-skills](https://github.com/jtydhr88/screenwriting-skills) (1854★) · [eternityspring/reelbench-skills](https://github.com/eternityspring/reelbench-skills) (1174★) · [gnipbao/minimax-h3-video-reverse-skill](https://github.com/gnipbao/minimax-h3-video-reverse-skill) (285★) |
| 🎵 Music videos | 15 | [JohnHeibel/PDoomVideo](https://github.com/JohnHeibel/PDoomVideo) (2671★) · [EGSECDA/vocaloid-style-mv-pipeline](https://github.com/EGSECDA/vocaloid-style-mv-pipeline) (231★) · [10291124jcjc-dotcom/ancient-rap-battle](https://github.com/10291124jcjc-dotcom/ancient-rap-battle) (159★) |

## Query it

```bash
# everything in one kind, safest first
python3 - <<'PY'
import json
d = json.load(open("data/skills.json"))
rows = [s for s in d["skills"] if s["kind"] == "editing" and s["security_grade"] == "safe"]
for s in sorted(rows, key=lambda s: -s["stars"])[:10]:
    print(f'{s["stars"]:>6}★  {s["repo_full_name"]:<40} {s["license"] or "-":<12} {s["description"][:60]}')
PY
```

`security_grade` is upstream's own read of each repo (from
[Agent Skills Hub](https://agentskillshub.top/best/claude-video-skills/)) — treat it as a
triage signal, not an audit. Always read a `SKILL.md` before you let an agent run it,
because a skill is instructions your agent will execute.

## Already vendored from this list

[`../../openmontage/`](../../openmontage/) is the same collection's most useful entry, vendored
in full. [`../..`](../..) holds the rest of this category's packs.

## Trimming notes

Upstream GIF previews (`assets/`, ~23 MB) and the prose README are not mirrored — the JSON is
the useful half, and the live list with filters is upstream.
