# srt-caption-timing

Re-time a caption track without inventing timestamps: keep the **words** of a
proofread SRT, take the **times** from a machine transcript of the same take, then
divide by the edit's playback factor (1.2x reel, slow-down, jump-cut edit). Timing
only — styling, card chunking and RTL layout belong to the downstream skill
`custom-skills/persian-subtitle-films`. Prerequisite: Node 20+, zero dependencies.

- `SKILL.md` — decision flow, pipeline, reading-speed check, failure modes, QA list
- `scripts/align-srt.mjs` — word-overlap alignment, gap interpolation, monotonic repair
- `scripts/rescale-srt.mjs` — speed-only fallback when one clock is already correct
- `references/timing-rules.md` — scoring formula, interpolation rule, report fields, guards

Extracted from a production Persian reel edit: 19 approved cues merged onto 54 ASR
cues at 1.2x, landing a 119.708 s film against a 119.8 s master.
