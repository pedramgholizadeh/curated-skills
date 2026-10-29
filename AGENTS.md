# Repository maintenance rules (for AI agents)

This repository ships a web version of the skill catalog. The site is
**generated from the repository itself** — keeping it accurate is automatic,
but a few things remain manual.

## How the site stays in sync

- `site/build.py` scans every category for `SKILL.md` files (name + description
  from YAML frontmatter), keeps empty folders as `SKELETON` nodes, reads folder
  descriptions from each `README.md`, and parses the Contributors table from the
  root `README.md`. Output: `site/skills.json`.
- `site/app.js` only renders `skills.json`. **Never hardcode skills in app.js.**
- `.github/workflows/deploy-pages.yml` runs `build.py` on every push to
  `master` and publishes `site/` to the `gh-pages` branch. A merged PR that
  only adds skills still updates the site — no manual site edit required.
- `site/skills.json` is committed too (local preview: `python3 site/build.py`,
  then open `site/index.html` with a static server — `fetch` needs http://).

## What you still maintain by hand

1. New top-level category → add its icon/description to `CATEGORY_META` in
   `site/build.py` (optional; unknown categories fall back to README text).
2. New contributor → add a row to the **Contributors** table in the root
   `README.md` (the site mirrors it automatically).
3. Skill added → update the index table of the containing folder's `README.md`.

## Conventions

- Skill format: `<category>/<stack>/<subcategory>/<skill-name>/SKILL.md`
  (see `CONTRIBUTING.md`).
- `custom-skills/` is flat and its skills declare merged lineage via `sources:`
  frontmatter (see `custom-skills/README.md`).
- Vendored collections (`anthropic-skills/`, `marketing-skills/`,
  `product-skills/`, `ui-ux-skills/ui-ux-pro-max/`) are **not edited in
  place** — re-vendor upstream updates; improvements go to `custom-skills/`.
- Every folder keeps its own `README.md`.
- All content, comments and commits are in English.
- Commits follow Conventional Commits; regenerate `site/skills.json` in the
  same commit as the change that caused it.
- Never edit the `gh-pages` branch by hand.
