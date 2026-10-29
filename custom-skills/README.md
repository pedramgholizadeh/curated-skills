# ⭐ Custom Skills

Personal, consolidated skills built by the maintainer on top of the category
skills in this repository.

## What lives here

While the other folders hold **atomic** skills (one focused task each), this
folder holds **opinionated** skills: workflows that merge several skills from
one or more categories into a single production-ready procedure — tuned to how
real projects are actually shipped.

Examples of what belongs here:

- A `ship-webapp` skill combining backend testing + frontend performance + deployment
- An `seo-content-engine` merging keyword research, brief-driven writing and internal linking
- A `bot-to-production` merging telegram-bot architecture with CI/CD basics

## Layout

```
custom-skills/
└── <skill-name>/
    └── SKILL.md
```

Flat structure — no subcategories. Each `SKILL.md` frontmatter must list its
ingredient skills in a `sources:` field so the lineage back to the categories
stays visible:

```yaml
---
name: seo-content-engine
description: End-to-end SEO content production from keyword research to published page.
sources:
  - seo-skills/content-skills/keyword-research
  - seo-skills/content-skills/content-writing
  - seo-skills/on-page-skills/internal-linking
---
```

## Skill index

| Skill | Merged from | Status |
|---|---|---|
| — | — | Add your consolidated skills here |

See the root [README.md](../README.md) for installation on each agent, and
[AGENTS.md](../AGENTS.md) for the site-sync rule every addition must follow.
