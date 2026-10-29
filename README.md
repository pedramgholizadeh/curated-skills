# Curated Skills

A hand-picked, production-grade collection of AI agent skills, organized by domain.
Each skill is a self-contained folder that teaches an AI coding agent (Claude Code,
Qoder, or any agent that follows the `SKILL.md` convention) how to perform a specific
task at a professional level.

## Catalog

| Category | Scope | Start here |
|---|---|---|
| [fullstack-skills](fullstack-skills/README.md) | Backend, frontend, mobile, Telegram bots, AI agents | [fullstack-skills/README.md](fullstack-skills/README.md) |
| [ui-ux-skills](ui-ux-skills/README.md) | Design systems, accessibility, interaction, visual design, UX research | [ui-ux-skills/README.md](ui-ux-skills/README.md) |
| [seo-skills](seo-skills/README.md) | Content SEO, on-page SEO, website optimization | [seo-skills/README.md](seo-skills/README.md) |
| [video-generation](video-generation/README.md) | Cinematic promos, explainers, motion graphics, editing, AI video | [video-generation/README.md](video-generation/README.md) |

## Repository Structure

```
curated-skills/
├── fullstack-skills/
│   ├── backend/            # nodejs · python · golang · databases · api-design
│   │                       # auth-security · testing · deployment-devops
│   ├── frontend/           # react-nextjs · vue-nuxt · typescript · css-styling
│   │                       # web-performance · testing
│   ├── mobile/             # react-native · flutter · ios-swift · android-kotlin
│   ├── telegram-bots/      # python-bots · nodejs-bots · bot-architecture
│   └── ai-agents/          # llm-integration · rag · mcp-servers
│                           # agent-orchestration · evaluation
├── ui-ux-skills/
│   ├── design-systems/ · accessibility/ · interaction-design/
│   ├── visual-design/ · ux-research/
├── seo-skills/
│   ├── content-skills/     # keyword-research · content-writing · content-strategy
│   ├── on-page-skills/     # meta-optimization · structured-data · internal-linking
│   └── optimizing-website/ # technical-seo · core-web-vitals · performance-audits
└── video-generation/
    ├── cinematic-promos/ · explainers/ · motion-graphics/
    ├── editing-workflows/ · ai-video-generation/
```

Every folder has a `README.md` that documents its scope and the skills it contains
or plans to contain.

## Skill Format

Each skill lives in its own folder and follows this layout:

```
<category>/<stack>/<subcategory>/<skill-name>/
├── SKILL.md          # required — YAML frontmatter (name, description) + instructions
├── scripts/          # optional — executable helpers
├── references/       # optional — deep documentation loaded on demand
└── assets/           # optional — templates and files used in output
```

`SKILL.md` frontmatter requirements:

```yaml
---
name: skill-name-in-kebab-case
description: What it does AND when to trigger it. Written in third person.
---
```

## Usage

### Claude Code

Point Claude at this repository as a skills directory, or copy/link the skills you need:

```bash
# Link a single skill
ln -s "$(pwd)/fullstack-skills/backend/nodejs/skill-name" ~/.claude/skills/skill-name

# Or link a whole category
cp -R fullstack-skills/*/ ~/.claude/skills/
```

### Qoder Desktop

Install skills from this repository into your personal skills directory
(`~/.qoder/skills/`) or the project's `.qoder/skills/` directory. The agent
discovers each `SKILL.md` automatically and loads it on demand.

```bash
cp -R fullstack-skills/backend/nodejs/<skill> ~/.qoder/skills/
```

### Any agent / plain LLM

Every `SKILL.md` is plain Markdown. Paste its contents into a system prompt or
a custom instructions file (e.g. `AGENTS.md`, `QODER.md`) to use the skill
without tooling support.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the skill quality bar, naming
conventions, and the review process. Adding yourself to the contributors list
is part of every pull request.

## Contributors

| Contributor | Role | Focus |
|---|---|---|
| [Pedram Gholizadeh](https://github.com/) | Creator & maintainer | Fullstack, AI agents, SEO, video |

<!--
Add a row per contributor:
| [Name](https://github.com/handle) | Role | Areas of focus |
-->
