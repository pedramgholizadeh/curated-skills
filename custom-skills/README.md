# ⭐ Custom Skills

Personal, consolidated skills built by the maintainer on top of the category
skills in this repository.

## What lives here

While the other folders hold **atomic** skills (one focused task each), this
folder holds **opinionated** skills: workflows that merge several skills from
one or more categories into a single production-ready procedure — tuned to how
real projects are actually shipped.

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
| [fullstack-dev/](fullstack-dev/SKILL.md) | anthropic-skills (frontend-design, web-artifacts-builder, webapp-testing, mcp-builder, claude-api) | Ready |
| [ui-ux-pro/](ui-ux-pro/SKILL.md) | ui-ux-skills/ui-ux-pro-max (master, design-system, ui-styling, design) | Ready |
| [pm-manager/](pm-manager/SKILL.md) | product-skills (discovery, strategy, execution, GTM, analytics) | Ready |
| [marketing-manager/](marketing-manager/SKILL.md) | marketing-skills (positioning, seo-audit, content-strategy, cro, copywriting, launch, analytics) | Ready |
| [brand-reels/](brand-reels/SKILL.md) | video-generation (motion-graphics, cinematic-promos, editing-workflows) · ui-ux-skills (visual-design, interaction-design) | Ready |

See the root [README.md](../README.md) for installation on each agent, and
[AGENTS.md](../AGENTS.md) for the site-sync rule every addition must follow.
