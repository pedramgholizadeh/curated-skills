# 🧰 Curated Skills

> A hand-picked, production-grade collection of AI agent skills — organized by
> domain, written in the open `SKILL.md` standard, and usable everywhere.

[![🌐 Live site](https://img.shields.io/badge/🌐_Live_site-skill_tree-brightgreen)](https://pedramgholizadeh.github.io/curated-skills/)
[![🐙 GitHub](https://img.shields.io/badge/🐙_GitHub-repository-24292e)](https://github.com/pedramgholizadeh/curated-skills)
[![✨ Follow the author](https://img.shields.io/badge/✨_author-pedramgholizadeh.ir-55e6a5)](https://pedramgholizadeh.ir)

👋 Hi, I'm **Pedram Gholizadeh** — a software developer and SEO specialist
([pedramgholizadeh.ir](https://pedramgholizadeh.ir)). I've been building
products, bots, agents and search-optimized websites for years, and this
repository is where I curate the skills I actually use in real work.

My hope is simple: if these skills make my agents better, they can make yours
better too. May this collection help everyone use AI agents **more effectively
and efficiently**. 💚

---

## 📦 What's inside

| Category | Scope | Start here |
|---|---|---|
| 🧩 [fullstack-skills](fullstack-skills/README.md) | Backend · Frontend · Mobile · Telegram bots · AI agents | [README](fullstack-skills/README.md) |
| 🎨 [ui-ux-skills](ui-ux-skills/README.md) | Design systems · Accessibility · Interaction · Visual · Research | [README](ui-ux-skills/README.md) |
| 📈 [seo-skills](seo-skills/README.md) | Content · On-page · Website optimization | [README](seo-skills/README.md) |
| 🎥 [video-generation](video-generation/README.md) | Promos · Explainers · Motion graphics · Editing · AI video | [README](video-generation/README.md) |
| ⭐ [custom-skills](custom-skills/README.md) | My own consolidated skills, merged from the categories above | [README](custom-skills/README.md) |

## 🗂️ Repository structure

```
curated-skills/
├── 🧩 fullstack-skills/
│   ├── ⚙️ backend/            nodejs · python · golang · databases · api-design
│   │                          auth-security · testing · deployment-devops
│   ├── 🖥️ frontend/           react-nextjs · vue-nuxt · typescript · css-styling
│   │                          web-performance · testing
│   ├── 📱 mobile/             react-native · flutter · ios-swift · android-kotlin
│   ├── ✈️ telegram-bots/      python-bots · nodejs-bots · bot-architecture
│   └── 🤖 ai-agents/          llm-integration · rag · mcp-servers
│                              agent-orchestration · evaluation
├── 🎨 ui-ux-skills/           design-systems · accessibility · interaction-design
│                              visual-design · ux-research
├── 📈 seo-skills/
│   ├── ✍️ content-skills/         keyword-research · content-writing · content-strategy
│   ├── 🔗 on-page-skills/        meta-optimization · structured-data · internal-linking
│   └── 🛠️ optimizing-website/    technical-seo · core-web-vitals · performance-audits
├── 🎥 video-generation/       cinematic-promos · explainers · motion-graphics
│                              editing-workflows · ai-video-generation
├── ⭐ custom-skills/           consolidated, opinionated skills by the maintainer
├── 🌐 site/                   the web version of this catalog (GitHub Pages)
└── 🤖 .github/workflows/      deploy-pages.yml — site auto-deploys on push
```

Every folder has a `README.md` documenting its scope and skill index. 📝

---

## 📐 Skill format

Each skill is one folder following the open standard:

```
<category>/<stack>/<subcategory>/<skill-name>/
├── SKILL.md          ← required · YAML frontmatter (name, description) + instructions
├── scripts/          ← optional · executable helpers
├── references/       ← optional · deep docs loaded on demand
└── assets/           ← optional · templates used in output
```

```yaml
---
name: skill-name-in-kebab-case
description: What it does AND when to trigger it (third person).
---
```

---

## 🚀 Usage by agent

Clone once, then link into whichever agent you use — every skill works
everywhere because they're all plain `SKILL.md` folders:

```bash
git clone https://github.com/pedramgholizadeh/curated-skills.git ~/curated-skills
```

| Agent | Skills are discovered at |
|---|---|
| 🟣 **Claude Code** | `~/.claude/skills/<skill>/` (personal) · `.claude/skills/` (project) |
| 🔵 **Qoder Desktop** | `~/.qoder/skills/<skill>/` · project `.qoder/skills/` |
| 🟢 **OpenCode** | `~/.config/opencode/skills/<skill>/` · project `.opencode/skills/` |
| 🟠 **ZCode (Z.ai)** | `~/.zcode/skills/<skill>/` · or Settings → Skills → Import |
| 🔴 **Google Antigravity** | `~/.gemini/antigravity/skills/<skill>/` |
| ⚫ **OpenAI Codex** | `~/.agents/skills/<skill>/` (shared location, also read by ZCode's importer) |

Example:

```bash
cp -R ~/curated-skills/fullstack-skills/backend/nodejs/<skill> ~/.claude/skills/
```

💡 **Z.ai web agents & anything else:** no folder discovery? Paste the
`SKILL.md` into custom instructions or an `AGENTS.md` — it is self-contained
plain Markdown by design.

---

## 🌐 Web version

The catalog is also published as a single-page tree explorer at
**[pedramgholizadeh.github.io/curated-skills](https://pedramgholizadeh.github.io/curated-skills/)** —
built from [`site/`](site/), auto-deployed by
[`deploy-pages.yml`](.github/workflows/deploy-pages.yml) on every push to `master`.

> ♻️ **Maintenance rule:** when a skill is added, moved or removed, the site
> data in [`site/app.js`](site/app.js) must be updated in the same commit.
> Full rules for human and AI maintainers live in [AGENTS.md](AGENTS.md).

---

## 🤝 Contributors

| | Contributor | Role | Focus |
|---|---|---|---|
| 🥇 | [Pedram Gholizadeh](https://pedramgholizadeh.ir) | Creator & maintainer | Fullstack · AI agents · SEO · Video |

<!--
Add a row per contributor (🥈 🥉 🏅 ...):
| | [Name](https://github.com/handle) | Role | Areas of focus |
-->

Want your name here? Send me a skill — see
[CONTRIBUTING.md](CONTRIBUTING.md) for the quality bar and process. 🚀

---

## 🗺️ Roadmap

- 📥 Populate subcategories with production skills (in progress — coming soon)
- ⭐ First consolidated skills in `custom-skills/`
- 🌐 Search & filters on the web version
- 📦 One-click install script per agent

---

## 💚 Support & contact

Found this useful? Star the repo ⭐, use the skills freely, and contribute
yours back — collections like this are how we all build better agents.

Made with ☕ and 💚 by [Pedram Gholizadeh](https://pedramgholizadeh.ir)
