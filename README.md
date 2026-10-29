# Curated Skills

A hand-picked, production-grade collection of AI agent skills, organized by domain.
Each skill is a self-contained folder that teaches an AI coding agent (Claude Code,
Qoder, OpenCode, ZCode, Antigravity, Codex, or any agent that follows the
`SKILL.md` convention) how to perform a specific task at a professional level.

## About & Author

Hi, I'm **Pedram Gholizadeh** — a software developer and SEO specialist
([pedramgholizadeh.ir](https://pedramgholizadeh.ir)). I've been building products,
bots, agents and search-optimized websites for years, and this repository is where
I curate the skills I actually use in real work.

My hope is simple: if these skills make my agents better, they can make yours better
too. May this collection help everyone use AI agents more effectively and efficiently.

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

## Usage by Agent

Every skill follows the open `SKILL.md` standard, so one copy of this repository
works across all major coding agents. Pick your agent below — the examples copy
(or symlink) skill folders into the directory each agent discovers.

A convenient first step on any machine: clone once, then link from it.

```bash
git clone https://github.com/your-name/curated-skills.git ~/curated-skills
```

### Claude Code

Discovers skills in `~/.claude/skills/` (personal) and `.claude/skills/` (project).

```bash
# Link a single skill
ln -s ~/curated-skills/fullstack-skills/backend/nodejs/<skill> ~/.claude/skills/<skill>

# Or install a whole category
cp -R ~/curated-skills/fullstack-skills/*/. ~/.claude/skills/
```

### Qoder Desktop

Installs into `~/.qoder/skills/` (personal) or the project's `.qoder/skills/`.
Each `SKILL.md` is discovered automatically and loaded on demand.

```bash
cp -R ~/curated-skills/fullstack-skills/backend/nodejs/<skill> ~/.qoder/skills/
```

### OpenCode

First-class skills support. Searches `.opencode/skills/` (project),
`~/.config/opencode/skills/` (global), and shared Claude/Agents folders. See the
[OpenCode skills docs](https://opencode.ai/docs/skills/).

```bash
cp -R ~/curated-skills/fullstack-skills/backend/nodejs/<skill> ~/.config/opencode/skills/

# Or make them available in one project only
mkdir -p .opencode/skills && cp -R ~/curated-skills/video-generation/* .opencode/skills/
```

### ZCode (Z.ai)

User-level skills live at `~/.zcode/skills/<skill-name>/SKILL.md`. ZCode also
ships an importer: **Settings → Skills → Import** scans skill directories of other
agents (Claude, Codex, …) so skills installed below can be imported in one click.
See the [ZCode skill docs](https://zcode.z.ai/en/docs/skill).

```bash
cp -R ~/curated-skills/seo-skills/content-skills/<skill> ~/.zcode/skills/
```

### Z.ai (chat & web agents)

Z.ai's coding-agent skill loading lives in ZCode (above). The Z.ai web agent
currently has no `SKILL.md` directory discovery, so use skills with it by
attaching or pasting a skill's `SKILL.md` into the agent's custom instructions —
each file is self-contained plain Markdown with YAML frontmatter.

### Google Antigravity

Personal skills are discovered at `~/.gemini/antigravity/skills/<skill-name>/SKILL.md`.
See the [Antigravity agent-skills docs](https://antigravity.google/docs/skills/).

```bash
cp -R ~/curated-skills/fullstack-skills/frontend/react-nextjs/<skill> ~/.gemini/antigravity/skills/
```

### OpenAI Codex

Codex and ChatGPT load agent skills from the shared `~/.agents/skills/` directory —
one location that ZCode's importer can also scan. See the
[build-skills docs](https://learn.chatgpt.com/docs/build-skills).

```bash
mkdir -p ~/.agents/skills
cp -R ~/curated-skills/fullstack-skills/ai-agents/rag/<skill> ~/.agents/skills/
```

### Any other agent

Every `SKILL.md` is plain Markdown. Paste its contents into a system prompt, a
custom-instructions file (`AGENTS.md`, `QODER.md`, `.cursorrules`, …), or a knowledge
project. The frontmatter `description` is the trigger contract: if the agent supports
routing instructions, tell it to load a skill when its description matches the task.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the skill quality bar, naming
conventions, and the review process. Adding yourself to the contributors list
is part of every pull request.

## Contributors

| Contributor | Role | Focus |
|---|---|---|
| [Pedram Gholizadeh](https://pedramgholizadeh.ir) | Creator & maintainer | Fullstack, AI agents, SEO, video |

<!--
Add a row per contributor:
| [Name](https://github.com/handle) | Role | Areas of focus |
-->
