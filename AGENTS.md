# Repository maintenance rules (for AI agents)

This repository ships a web version of the skill catalog. Keeping the two in
sync is part of the definition of done — not an optional follow-up.

## Standing rule: every skill change updates the website

Whenever you add, remove, rename or move a skill (or a subcategory):

1. Update the real folder + its `README.md` index table.
2. Update `site/app.js`:
   - `SKILL_TREE` — tree nodes and each skill object (`{ name, desc }` in `skills: []`)
   - `CONTRIBUTORS` — if the change comes with a new contributor
3. A folder with zero skills renders as `SKELETON` automatically; skills render
   as green count badges. No extra markup needed.
4. Pushing `site/**` to `master` triggers `.github/workflows/deploy-pages.yml`,
   which publishes the site to GitHub Pages (gh-pages branch). Never edit the
   `gh-pages` branch by hand.

## Conventions

- Skill format: `<category>/<stack>/<subcategory>/<skill-name>/SKILL.md`
  (see `CONTRIBUTING.md`).
- `custom-skills/` is flat and its skills declare merged lineage via `sources:`
  frontmatter (see `custom-skills/README.md`).
- Every folder keeps its own `README.md`.
- All content, comments and commits are in English.
- Commits follow Conventional Commits; site data changes use
  `chore(site): ...` bundled with the skill commit that caused them.
