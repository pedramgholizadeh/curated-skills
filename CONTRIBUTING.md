# Contributing

Thanks for interest in improving this collection. This document defines the
quality bar every skill must meet before it is merged.

## What belongs here

- A **skill** is a folder with a `SKILL.md` that teaches an agent to complete a
  specific, repeatable task at a professional level.
- It must encode real workflow knowledge (steps, pitfalls, examples), not just
  a topic description or a link to documentation.
- One skill = one focused capability. If a skill covers two unrelated tasks,
  split it.

## Directory rules

```
<category>/<stack-or-group>/<subcategory>/<skill-name>/SKILL.md
```

- Categories are fixed: `fullstack-skills`, `ui-ux-skills`, `seo-skills`,
  `video-generation`, `custom-skills`, plus the vendored collections
  `anthropic-skills`, `marketing-skills`, `product-skills` (never edited in
  place — improvements go to `custom-skills/`).
  Ask before proposing a new top-level category.
- If a skill fits an existing subcategory, put it there. If it needs a new
  subcategory, create the folder **with a `README.md`** describing its scope.
- Skill folder names: `kebab-case`, matching the `name` field in `SKILL.md`.

## SKILL.md requirements

1. YAML frontmatter with `name` (kebab-case) and `description`.
2. `description` states **what** the skill does and **when** to use it, in
   third person — this is what the agent uses to decide relevance.
3. Instructions are imperative, concise, and free of fluff. Prefer checklists,
   tables, and short code blocks over prose.
4. Include real examples: input → expected output, or a worked example.
5. Large reference material goes into `references/`; executable helpers into
   `scripts/`. `SKILL.md` itself stays under ~500 lines.
6. Everything in English.

## Pull request process

1. Branch from `main`: `<type>/<short-summary>` (e.g. `feat/backend-prisma-migrations`).
2. One skill (or one tightly related group) per PR.
3. Commit messages follow Conventional Commits:
   `feat(backend): add prisma-migrations skill`
4. Update the subcategory `README.md` index table with the new skill.
5. Update the web catalog: `site/app.js` (`SKILL_TREE`, and `CONTRIBUTORS` if
   you're new) — see [AGENTS.md](AGENTS.md). The site must change in the same
   commit as the skill.
6. Add yourself to the **Contributors** table in the root `README.md`.
7. PR description must explain what the skill does and link a real usage
   example or session where it was applied.

## Review checklist (maintainers)

- [ ] Trigger description is specific enough to avoid false positives
- [ ] Steps are executable, not aspirational
- [ ] No secrets, internal URLs, or personal data
- [ ] Folder placement and naming follow the rules above
- [ ] Subcategory README index updated

## Contributors

Maintained in the root [README.md](README.md#contributors). Each contributor
adds themselves in their first merged PR.
