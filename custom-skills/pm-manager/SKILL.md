---
name: pm-manager
description: One operating workflow for product management — discovery through strategy, PRD, prioritization, outcome roadmaps, launch readiness and measurement. Use when defining what to build and why: writing PRDs or roadmaps, prioritizing features, validating opportunities, preparing a launch, or deciding what NOT to build.
sources:
  - product-skills/product-discovery
  - product-skills/product-strategy
  - product-skills/execution
  - product-skills/go-to-market
  - product-skills/data-analytics
---

# PM Manager

The full product loop with the right framework at each stage. Deep templates
live in `product-skills/` — this is the operating system that sequences them.

## Gate zero — before writing anything

A PRD requires three answered questions: **the problem, the target users, the
success metric.** If any is missing, ask at most 3 questions — do not produce
a document in that reply.

## 1. Discover

- **Opportunity Solution Tree** weekly, not periodically: one Desired Outcome
  (single metric) → 3–7 opportunities (customer-voiced: "I struggle to…") →
  ≥3 solutions each → experiments (hypothesis, method, metric, threshold).
  Fewer than 3 solutions per opportunity = committed to the first idea.
- **Interviews** (Mom Test discipline): past behavior only — no pitching, no
  hypotheticals, compliments are noise. Structure: Opening 2–3min → context
  5min → JTBD core 15–20min → wrap 3–5min. Capture: key jobs, current
  solution, biggest pain, willingness to pay, surprise finding.
- **Summarize** each interview as Date / Participants / Background / Current
  solution / Likes / Problems / Key insights / Action items; score
  opportunities by **Importance × (1 − Satisfaction)**.
- Run discovery as a **Product Trio** (PM + design + engineering), never PM-only.

## 2. Define & strategize

- 9-section strategy canvas: Vision · Market segments · Relative costs ·
  Value proposition · Trade-offs · Key metrics (North Star + OMTM) · Growth ·
  Capabilities · **Can't/Won't**. Add "what must be true" hypotheses.
- Assumption triage across **Value / Usability / Viability / Feasibility**:
  Risk = (1 − confidence) × effort. High impact × high risk → experiment;
  high impact × low risk → implement; low × high → reject; low × low → defer.
- **NSM rules:** single, customer-centric, leading indicator. Never revenue or
  LTV, never an OKR, never a set. Classify the game first: Attention /
  Transaction / Productivity. A metric that won't change your behavior is a
  bad metric.

## 3. PRD (8 sections, 600–1,000 words)

`PRD-[product].md` — 1 Summary (2–3 sentences) · 2 Contacts · 3 Background
(context, why now) · 4 Objective + 1–3 SMART Key Results · 5 Market segments
(by problems/jobs, ≤2–3 for v1) · 6 Value proposition (**the spine**: who /
why / what-before / how / what-after / alternatives) · 7 Solution (UX, key
features, technology, **assumptions & open questions**) · 8 Release (first
version / later / explicitly not doing; relative timeframes).

No "TBD", no invented unknowns — put them in §7.4. Non-goals are mandatory.
§7 delivers the *how* of §6; §4 measures the *what-after*.

## 4. Prioritize & plan

- Feature ranking: **ICE** for quick calls, **RICE** when reach granularity
  matters; MoSCoW for release scope; Kano to *understand* delight, not to
  rank. Eisenhower is for your inbox, not the roadmap.
- Backlog format by need: **job stories** when context drives behavior;
  **user stories** (INVEST) when a named role owns sprint work; **WWA**
  (Why/What/Acceptance) when the strategic why must survive handoff.
- **Outcome roadmap** (`Outcome-Roadmap-[year].md`): rewrite every initiative
  as `Enable [segment] to [customer outcome] so that [business impact]`, with
  key metrics and dependencies; quarters, not dates — dated feature lists are
  false precision. Ask "so what?" until the real value shows.
- Sprint plan: goal, capacity, committed stories, **15–20% buffer**, risks.
- Stakeholders: Power × Interest grid → Manage closely / Keep satisfied /
  Keep informed / Monitor, each with a comms cadence.

## 5. Launch readiness

- **Red-team now** while the cheapest test is still runnable (3–5
  kill-assumptions beat 20 generic risks); **pre-mortem ~14 days out**:
  Tigers / Paper tigers / Elephants, tigers classified Launch-blocking /
  Fast-follow / Track with owner + due date.
- Test scenarios (objective, starting conditions, role, steps, expected
  outcomes), release notes (New / Improved / Fixed / **Breaking**), GTM
  channels + messaging + success metrics.

## 6. Measure

- Dashboard layers: **NSM → 3–5 input metrics → health → business**, each row
  Metric | Definition | Source | Visualization | Target | Alert threshold.
- A/B decisions are only: **Ship / Extend / Stop / Investigate** — after SRM
  and guardrail checks. Cohorts still inside their window are "pending", never
  in the denominator.
- Retro every cycle; feed learnings back as opportunity-score updates.

## Anti-pattern alarm

Feature factory output · output-framed KRs ("launch 5 features") · customers
designing the solution · opinion-based validation · vanity snapshots without
comparison · stealth-mode launches · "just one more feature".
