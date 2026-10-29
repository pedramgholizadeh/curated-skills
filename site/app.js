/* Site data — mirrors the repository structure.
 * MAINTENANCE RULE: when a skill is added to the repo, update SKILL_TREE here too.
 */

const SKILL_TREE = [
  {
    name: "fullstack-skills",
    path: "fullstack-skills/",
    icon: "🧩",
    desc: "Backend, frontend, mobile, Telegram bots and AI agents.",
    children: [
      { name: "backend", icon: "⚙️", desc: "Server-side engineering: runtimes, data, APIs, security, shipping.", children: [
        { name: "nodejs", desc: "Express · Fastify · NestJS · Bun", skills: [] },
        { name: "python", desc: "FastAPI · Django · Flask · asyncio", skills: [] },
        { name: "golang", desc: "stdlib HTTP · concurrency · microservices", skills: [] },
        { name: "databases", desc: "schema · migrations · ORMs · caching", skills: [] },
        { name: "api-design", desc: "REST · GraphQL · gRPC · versioning", skills: [] },
        { name: "auth-security", desc: "OAuth2 · JWT · RBAC · OWASP", skills: [] },
        { name: "testing", desc: "unit · integration · contract · load", skills: [] },
        { name: "deployment-devops", desc: "CI/CD · Docker · K8s · observability", skills: [] },
      ]},
      { name: "frontend", icon: "🖥️", desc: "Client-side web: frameworks, styling, speed, quality.", children: [
        { name: "react-nextjs", desc: "App Router · RSC · state & data flow", skills: [] },
        { name: "vue-nuxt", desc: "Composition API · Pinia · Nuxt 3", skills: [] },
        { name: "typescript", desc: "strict configs · advanced types · zod", skills: [] },
        { name: "css-styling", desc: "Tailwind · tokens · RTL · theming", skills: [] },
        { name: "web-performance", desc: "Core Web Vitals · bundling · caching", skills: [] },
        { name: "testing", desc: "Vitest · Playwright · visual regression", skills: [] },
      ]},
      { name: "mobile", icon: "📱", desc: "Cross-platform and native apps.", children: [
        { name: "react-native", desc: "Expo · navigation · native modules", skills: [] },
        { name: "flutter", desc: "Riverpod · platform channels · flavors", skills: [] },
        { name: "ios-swift", desc: "SwiftUI · concurrency · SwiftData", skills: [] },
        { name: "android-kotlin", desc: "Compose · coroutines · Room · Gradle", skills: [] },
      ]},
      { name: "telegram-bots", icon: "✈️", desc: "Telegram bots that work hard and stay upright.", children: [
        { name: "python-bots", desc: "aiogram · python-telegram-bot · Telethon", skills: [] },
        { name: "nodejs-bots", desc: "grammY · Telegraf · webhooks", skills: [] },
        { name: "bot-architecture", desc: "conversations · payments · Mini Apps", skills: [] },
      ]},
      { name: "ai-agents", icon: "🤖", desc: "Systems built on top of LLMs.", children: [
        { name: "llm-integration", desc: "SDKs · streaming · structured output", skills: [] },
        { name: "rag", desc: "chunking · vector search · re-ranking", skills: [] },
        { name: "mcp-servers", desc: "tools · resources · transports", skills: [] },
        { name: "agent-orchestration", desc: "loops · memory · multi-agent", skills: [] },
        { name: "evaluation", desc: "golden sets · LLM-as-judge · regression", skills: [] },
      ]},
    ],
  },
  {
    name: "ui-ux-skills",
    path: "ui-ux-skills/",
    icon: "🎨",
    desc: "Design intelligence for web, mobile and desktop.",
    children: [
      { name: "design-systems", icon: "🧱", desc: "tokens · component APIs · docs", skills: [] },
      { name: "accessibility", icon: "♿", desc: "WCAG 2.2 · ARIA · keyboard & SR", skills: [] },
      { name: "interaction-design", icon: "🎬", desc: "motion · states · micro-interactions", skills: [] },
      { name: "visual-design", icon: "👁️", desc: "typography · color · hierarchy", skills: [] },
      { name: "ux-research", icon: "🔍", desc: "interviews · usability tests · heuristics", skills: [] },
    ],
  },
  {
    name: "seo-skills",
    path: "seo-skills/",
    icon: "📈",
    desc: "Search visibility as an engineering & content discipline.",
    children: [
      { name: "content-skills", icon: "✍️", desc: "winning search demand with content.", children: [
        { name: "keyword-research", desc: "intent mapping · gap research · clustering", skills: [] },
        { name: "content-writing", desc: "brief-driven · E-E-A-T · answer-first", skills: [] },
        { name: "content-strategy", desc: "topic clusters · refreshes · ROI", skills: [] },
      ]},
      { name: "on-page-skills", icon: "🔗", desc: "page-level ranking signals.", children: [
        { name: "meta-optimization", desc: "titles · descriptions · headings · URLs", skills: [] },
        { name: "structured-data", desc: "JSON-LD · rich results · entity graph", skills: [] },
        { name: "internal-linking", desc: "architecture · anchors · authority flow", skills: [] },
      ]},
      { name: "optimizing-website", icon: "🛠️", desc: "site-level search health.", children: [
        { name: "technical-seo", desc: "crawling · indexing · JS · migrations", skills: [] },
        { name: "core-web-vitals", desc: "LCP · CLS · INP fixes", skills: [] },
        { name: "performance-audits", desc: "Lighthouse at scale · roadmaps", skills: [] },
      ]},
    ],
  },
  {
    name: "video-generation",
    path: "video-generation/",
    icon: "🎥",
    desc: "Finished video, produced in code and with AI.",
    children: [
      { name: "cinematic-promos", icon: "🎞️", desc: "beat-synced promos · shot recipes", skills: [] },
      { name: "explainers", icon: "🗣️", desc: "scripts · storyboards · VO sync", skills: [] },
      { name: "motion-graphics", icon: "✨", desc: "kinetic type · charts · titles", skills: [] },
      { name: "editing-workflows", icon: "✂️", desc: "FFmpeg cutting · subtitles · reels", skills: [] },
      { name: "ai-video-generation", icon: "🪄", desc: "text/image-to-video prompting", skills: [] },
    ],
  },
  {
    name: "custom-skills",
    path: "custom-skills/",
    icon: "⭐",
    desc: "Pedram's own combined skills, distilled from the categories above.",
    badge: "custom",
    children: [
      { name: "brand-reels", icon: "🎬", desc: "On-brand 9:16 marketing reels rendered in code (canvas → headless Chrome → ffmpeg), for any business or language.", skills: [
        { name: "SKILL.md", desc: "Brand-config-driven pipeline: hook-first / CTA-last grammar, beat-synced sound, pilot-then-batch workflow." },
      ]},
    ],
  },
];

const AGENTS = [
  { name: "Claude Code", path: "~/.claude/skills/" },
  { name: "Qoder Desktop", path: "~/.qoder/skills/" },
  { name: "OpenCode", path: "~/.config/opencode/skills/" },
  { name: "ZCode (Z.ai)", path: "~/.zcode/skills/" },
  { name: "Google Antigravity", path: "~/.gemini/antigravity/skills/" },
  { name: "OpenAI Codex", path: "~/.agents/skills/" },
];

const CONTRIBUTORS = [
  { name: "Pedram Gholizadeh", role: "Creator & maintainer",
    bio: "Developer & SEO specialist. Builds websites, bots, agents — and the skills that run them.",
    site: "https://pedramgholizadeh.ir", initials: "PG",
    focus: ["Fullstack", "AI Agents", "SEO", "Video"] },
];

/* ---------- render ---------- */

function el(tag, cls, html) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
}

function statusBadge(node) {
  const total = countSkills(node);
  return total > 0
    ? `<span class="badge ready">${total} SKILL${total > 1 ? "S" : ""}</span>`
    : `<span class="badge skeleton">SKELETON</span>`;
}

function countSkills(node) {
  if (node.skills) return node.skills.length;
  return (node.children || []).reduce((s, c) => s + countSkills(c), 0);
}

function renderLeaf(leaf) {
  const box = el("div", "leaf");
  const det = el("details");
  const sum = el("summary");
  sum.innerHTML = `<span class="node-label">${leaf.name}/</span>
    <span class="node-desc">${leaf.desc}</span>
    <span class="badge lime">SKILL.md</span>`;
  det.append(sum);
  const items = el("div", "items");
  if (leaf.skills.length === 0) {
    items.append(el("div", "skill-item", `<em style="color:var(--dim)">Skill slots ready — content lands here as folders appear.</em>`));
  }
  leaf.skills.forEach(s =>
    items.append(el("div", "skill-item", `<code>${s.name}</code> <span>${s.desc || ""}</span>`)));
  det.append(items);
  box.append(det);
  return box;
}

function renderStack(stack) {
  const det = el("details");
  const sum = el("summary");
  sum.innerHTML = `<span class="node-label">${stack.icon || "📁"} ${stack.name}/</span>
    <span class="node-desc">${stack.desc}</span>
    ${statusBadge(stack)}`;
  det.append(sum);
  const body = el("div", "items");
  (stack.children || []).forEach(c => body.append(c.skills !== undefined ? renderLeaf(c) : renderStack(c)));
  if ((stack.skills || []).length || (stack.children || []).some(c => c.skills)) {
    (stack.skills || []).forEach(s => body.append(el("div", "skill-item", `<code>${s.name}</code> <span>${s.desc || ""}</span>`)));
  }
  det.append(body);
  const box = el("div", "stack");
  box.append(det);
  return box;
}

function renderCategory(cat) {
  const det = el("details", "category");
  det.open = cat.name !== "fullstack-skills";
  const sum = el("summary");
  sum.innerHTML = `<span class="node-label">${cat.icon} ${cat.name}/</span>
    <span class="node-desc">${cat.desc}</span>
    ${cat.badge ? `<span class="badge ${cat.badge}">${cat.badge.toUpperCase()}</span>` : ""}
    ${statusBadge(cat)}`;
  det.append(sum);
  const body = el("div", "items");
  if (cat.children.length === 0) {
    body.append(el("div", "skill-item", `<em style="color:var(--dim)">Personal, consolidated skills by the maintainer — merged from the categories above.</em>`));
  }
  cat.children.forEach(c => body.append(renderStack(c)));
  det.append(body);
  return det;
}

document.getElementById("tree-root").append(...SKILL_TREE.map(renderCategory));

document.getElementById("agent-cards").append(...AGENTS.map(a =>
  el("div", "card", `<h3>⚡ ${a.name}</h3><p>Copy or link any skill folder into:</p><code>${a.path}&lt;skill-name&gt;/</code>`)));

document.getElementById("contributor-cards").append(...CONTRIBUTORS.map(c =>
  el("div", "card contrib",
    `<div class="avatar">${c.initials}</div>
     <div><h3><a class="inline" href="${c.site}" target="_blank" rel="noopener">${c.name}</a></h3>
     <div class="role">${c.role}</div><p>${c.bio}</p>
     <p style="margin-top:.4rem">${c.focus.map(f => `<span class="badge lime">${f}</span>`).join(" ")}</p></div>`)));

document.querySelector(".tree-tools").addEventListener("click", e => {
  const all = document.querySelectorAll(".tree details");
  all.forEach(d => (d.open = e.target.dataset.action === "expand"));
});
