---
name: marketing-manager
description: Marketing-lead operating workflow for products and sites — positioning context, SEO and content, CRO and copy, launches, and measurement with evidence-graded findings. Use for marketing plans, audits, landing pages, launch plans, tracking setups, or any "how do we get and keep customers" question.
sources:
  - marketing-skills/product-marketing
  - marketing-skills/seo-audit
  - marketing-skills/content-strategy
  - marketing-skills/cro
  - marketing-skills/copywriting
  - marketing-skills/launch
  - marketing-skills/analytics
  - marketing-skills/ab-testing
---

# Marketing Manager

The chain: **context → SEO/content → CRO/copy → launch → measure**. The
atomic skills in `marketing-skills/` hold the deep checklists; this skill runs
the program.

## Stage 0 — Positioning context (always first)

Maintain `.agents/product-marketing.md` with 14 sections: overview, audience,
personas, problems, competitive landscape (direct/secondary/indirect),
differentiation, objections & anti-personas, switching dynamics (**JTBD four
forces: push / pull / habit / anxiety**), verbatim customer language, brand
voice, proof points, goals, paid ads, and a **Learnings** table (Learning /
Evidence / Applies-to / Status: active|watch|retired) with a changelog.
Every downstream task starts by reading it.

Claims must be falsifiable and pass the **swap test**: if a competitor could
write it, rewrite it or flag `[NEED: differentiator]`. Declined claims must
name the evidence that would unlock them.

## Stage 1 — SEO & content

Audit priority order: **crawlability & indexation → technical foundations →
on-page → content quality → authority.** Core Web Vitals floors: LCP < 2.5s,
INP < 200ms, CLS < 0.1; important pages within 3 clicks; hreflang
self-referencing + reciprocal, locale codes like `en-GB` (never `en-UK`);
never canonical a localized page to English (suppresses indexing), and thin
locale pages drag the whole site.

Findings format: **Issue / Impact (H-M-L) / Evidence / Fix / Priority 1–5**;
plan tiers Critical → High-impact → Quick wins → Long-term. Fastest wins are
positions **8–20** (rankings-push content).

Content gate: publish only with **information gain** (new data, experience,
mechanism, or synthesis). Calendar split 60/30/10 (core/supporting/experimental);
idea score = Customer impact 40% · Content-market fit 30% · Search potential
20% · Resources 10%. Link-earning formats: stat roundups ≈ 4.25× original
research ≈ 0.8×. Schema: JSON-LD in `<head>`, but check Google's supported
gallery first (FAQ rich results ended May 2026; HowTo retired 2023) and verify
JS-injected markup in a browser — `curl`/fetch gives false "no schema".

## Stage 2 — CRO & copy

Seven heuristics in impact order: **value-prop clarity (5-second test) →
headline → CTA hierarchy & copy → visual hierarchy → trust signals →
objection handling → friction.** Output: Quick wins / High-impact changes /
Test ideas / 2–3 copy alternatives.

Copy formulas: `{Outcome} without {pain}` · `{Feature} for {audience}` ·
`[Number] [people] use [product] to [outcome]` · `Stop [pain]. Start
[pleasure].` Filter heroes through the **"Now you can" test** and the Human
Action Model (discomfort → vision → path). CTA = action verb + what they get
("Start Free Trial" > "Sign Up"; weak: Submit, Learn More, Click Here).
**Vocabulary is a voice choice** — never upgrade the brand's words
("stuff"/"ship") into corporate synonyms.

AI-tell blacklist: "It's not X, it's Y" contrasts, negation lists, colon
reveals, "In today's fast-paced world", em-dashes in short copy, and the words
seamless/robust/powerful/unlock/streamline (replace with the fact).

## Stage 3 — Launch

**ORB** channel frame — Owned / Rented / Borrowed, everything funnels back to
owned (platform dependency is the ownership paradox: don't spend 90% of effort
where you own 10% of distribution). Gate the product with **SLC: Simple,
Lovable, Complete**. Phases: Internal → Alpha → Beta → Early access → Full,
each with pre-launch / launch-day / post-launch checklists. No stealth mode,
no "one more feature".

## Stage 4 — Measure & iterate

- Tracking plan table: **Event | Category | Properties | Trigger**; naming =
  object_action (`signup_completed`, `cta_hero_clicked` + `button_text,
  location`). Fire on **confirmed success, never on attempt** (submit-clicks
  count failed validations and bots). UTM lowercase, hyphenated, one spelling
  per source, never PII; `medium` = deal type, `source` = who; use `creator`
  as paid-creator medium and add GA4 custom channel groups or partner traffic
  lands in Unassigned. Pricing-page views are not primary conversions.
- A/B: hypothesis frame "Because [data], we believe [change] will cause
  [outcome] for [audience]. We'll know when [metric]." ICE = (I+C+E)/3,
  pre-commit sample size (1% baseline needing +10% ≈ 160k/variant), no
  peeking, guardrail metrics, unplanned segment cuts are exploratory only.
- Rate metrics need **matching closed windows**; derive totals from row-level
  data by script, never mental sums; cross-check every headline figure twice.

## Evidence discipline (applies everywhere)

Label every finding **Observed / Reported / Inferred** — never mark inferred
things as observed. Every recommendation names its mechanism + leading
indicator, or is explicitly an experiment with a kill criterion ("hope is not
a strategy"). Never act on a live site or ad account the user hasn't named in
this conversation; work under `~/marketing-plans/{client-slug}/`.
