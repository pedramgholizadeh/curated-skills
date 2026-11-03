# Story, script and beat sheets

On-screen text is the only voice in most code-made videos. It has to carry the story alone, with sound off, on a phone.

## Five rules that decide whether it works

1. **One sentence, split across beats.** The whole video is a single line of thought broken into 3–7 fragments. Each fragment lands on its own beat. If two fragments say the same thing, delete one.
2. **The stranger test at second 4.** Someone who has never heard of the product must know *what it is and why it matters* by 4s. Logos and "Introducing" do not pass this test on their own.
3. **Show, then name.** Demonstrate the change, then label it. A line that describes what the viewer just watched is a caption, not a headline.
4. **Every claim has a source.** Numbers, quotes, ratings, "trusted by" — only from the user or the product's site. If the source is illustrative, the frame says `EXAMPLE`.
5. **Silence is a beat.** After a line lands, hold it. After a reveal, breathe 0.5s before the next move. Cutting away while the viewer is still reading is the most common failure.

## Writing lines

- 3–7 words per line. Two lines maximum on screen at once.
- Write in the user's wording: pull real labels, taglines and CTA copy from their site. Never paraphrase a promise into something they didn't say.
- Concrete nouns beat adjectives: "Found 247 matches" not "Powerful search".
- One idea per line; put the payoff word last so the highlight can land on it.
- CTA exactly as written on the sales page — no invented "start free".

## Beat sheets

Every project gets `beat-sheet.md`. One row per moment:

```
| t (s) | on-screen words | visual / what moves | sound |
| 0.0–4.0 | "Your next post" | clean canvas, word lands, camera pushes 8% | soft impact |
```

Sum the rows against the length. If you're over, cut a beat — don't speed everything up.

### Launch video — 45s, 7 beats

| # | Time | Beat | Job |
|---|---|---|---|
| 1 | 0–4 | Hook: first fragment, big, clean background | stop the scroll, name the category |
| 2 | 4–9 | Next fragment over real proof (posts, results, screens) | credibility before claims |
| 3 | 9–17 | Product working: screen, cursor types a real prompt, output appears | show the mechanism |
| 4 | 17–22 | Quality beat: something checks, passes, ticks | answer "is it any good?" |
| 5 | 22–32 | How it works: 3 steps or features as one simple visual | make it feel achievable |
| 6 | 32–38 | The number that matters, count-up, with source | one memorable fact |
| 7 | 38–45 | Name + CTA, holds ≥3s | what to do next |

Short cuts: 30s drops beat 5 to two steps and shortens 6; 20s keeps hook, mechanism, CTA.

### Product explainer — 60s (45–90 range)

| Beat | Length | Content |
|---|---|---|
| Open | 0–5 | small "Introducing" → brand moment (soft gradient + name, small) |
| Problem / input | ~5s | the viewer's own pain in one line, or the empty input box with chips |
| Feature chapters | 8–15s each | title line → camera pushes in → UI moment close-up → pull back to reveal context |
| Proof (optional) | 4–6s | one real number over a subtle field |
| Integrations (optional) | 4–6s | tiles floating in at different depths |
| Closer | 6–10s | rotating use-case word, tagline with highlight |
| End card | 3s | name + URL/CTA |

Budget: 45s → 2–3 features (~9s each), one optional section. 60s → 3–4 features (~10s). 90s → 4–5 features (~12s), both optional sections. Drop optional sections first, never the proof if a number exists.

### Reel / TikTok / Shorts — 12–30s

| Time | Beat |
|---|---|
| 0–2 | Hook frame: the most surprising state, already mid-motion (no logo intro) |
| 2–6 | Establish: what is this, in ≤5 words on screen |
| 6–15 | One mechanism, shown 2–3 times at increasing intensity |
| 15–22 | Payoff / result, with the number if real |
| 22–end | Name + one-line CTA, held ≥2s |

Vertical rules: hook text inside y 360–1420, nothing critical in the bottom 500px or the right 120px; assume muted; caption every spoken word if there is VO.

### Kinetic / showreel

- Write `STORYBOARD.md` first: time budget per chapter, source of truth for facts, one unifying device (a shape, a colour, a grid), one row per shot with headline + mechanism + transition + sound.
- Lead chapter ≈ 35–40% of runtime. To rebalance, add time to the weaker chapters — don't cut the one people love.
- Every shot needs a **mechanism**, not just words: grid routing, a matrix scan, a token hopping a state machine, lists fusing, packets passing gates. The headline names it; the mechanism proves it.

## Modes of production

- **Autonomous**: decide and log. Write the logline, the beat sheet, the asset strategy and the risks in `brief.md`, then build. Do not stop for confirmation.
- **Co-creation**: confirm brief → beat sheet → final cut. One question round of ≤3 questions per gate, chosen to reduce rework, not to be thorough.
- **Replica**: keep shot structure, timing and motion grammar of the reference; swap content, brand tokens and assets. Re-skin, never copy another brand's UI, logos or icons.

## Failure modes to check in the script

- The video explains *features* but never states the *change* the user gets.
- Three lines in a row start with the product name.
- A number appears without a source, or a testimonial without an attached screenshot.
- The CTA is invented, or appears for less than 3 seconds.
- The story only makes sense with sound.
- Two beats share the same layout, so the middle of the video feels like a repeat.
