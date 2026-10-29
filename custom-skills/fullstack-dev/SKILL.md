---
name: fullstack-dev
description: End-to-end workflow for building and shipping production web applications with AI agents — distinctive UI planning, artifact scaffolding, reconnaissance-first Playwright testing, MCP tool integration and API-drift-safe Claude SDK usage. Use when the user wants to build, test or ship a full web application or when working across frontend + backend + tooling in one task.
sources:
  - anthropic-skills/frontend-design
  - anthropic-skills/web-artifacts-builder
  - anthropic-skills/webapp-testing
  - anthropic-skills/mcp-builder
  - anthropic-skills/claude-api
---

# Full-Stack Dev

One disciplined loop for shipping web apps: **plan → review → build → test →
bundle → verify**. This skill consolidates Anthropic's official collection;
open the individual upstream skills (in `anthropic-skills/`) only when a step
needs deeper detail.

## 1. Design plan before any code (two-pass rule)

Write a compact token system first, critique it against the brief, then code:

- **Color** — 4–6 named hex values with roles (surface, ink, accent, semantic).
- **Type** — font families with explicit roles (display / body / mono-data).
- **Layout** — prose description + ASCII wireframes + alignment rules.
- **Principles** — 3–5 constraints that make this product look like itself.

Review pass: if any part "reads like the generic default", revise that part
and say what changed and why. Only then write code.

**AI-slop blacklist** (reject on sight): cream `#F4F1EA` + serif + terracotta;
near-black + acid-green accent; hairline "broadsheet" rules; uniform radius +
`rgba(0,0,0,.1)` shadows everywhere; tracked ALL-CAPS eyebrows; `A · B · C`
meta strings; `WORD — fragment` headings; single-word italic headline accents;
fade-and-slide on every section; Inter as the default personality.

## 2. Scaffold (React artifact path)

Use `anthropic-skills/web-artifacts-builder` when a self-contained app is the
deliverable:

```bash
bash scripts/init-artifact.sh <project-name>   # React 18 + TS + Vite + Tailwind + shadcn/ui
bash scripts/bundle-artifact.sh                # → single self-contained bundle.html
```

- Keep a root `index.html` (bundler requirement); prefer `@/` aliases.
- Avoid excessive centered layouts, purple gradients, uniform rounded corners.
- Do **not** test the bundle upfront — it adds latency; test after development.

## 3. Test with Playwright — reconnaissance first

Scripts are black boxes: run `--help` before ever reading their source; bundled
code pollutes the context window.

```bash
python scripts/with_server.py --server "npm run dev" --port 5173 -- python your_automation.py
# stack servers:
python scripts/with_server.py --server "cd backend && python server.py" --port 3000 \
  --server "cd frontend && npm run dev" --port 5173 -- python e2e.py
```

Automation scripts contain only Playwright logic:

1. `p.chromium.launch(headless=True)` always.
2. Navigate → `page.wait_for_load_state("networkidle")` **before any DOM read**.
3. Recon: screenshot (`full_page=True` to `/tmp/inspect.png`) and/or
   `page.content()` → discover real selectors.
4. Act with discovered selectors (`text=`, `role=`, ids) — never guessed ones.

Watch for CSS specificity collisions (e.g. a generic `.section` padding
fighting `.cta` margins) when reviewing UI bugs.

## 4. MCP servers (when the app exposes tools)

- TypeScript by default; **streamable HTTP, stateless JSON** for remote, stdio
  for local. SDK v2 is `@modelcontextprotocol/server` — never mix v1/v2
  (migrate: `npx @modelcontextprotocol/codemod@latest v1-to-v2 .`).
- Validate inputs (zod/pydantic); return `outputSchema` + `structuredContent`;
  annotate tools (`readOnlyHint`, `destructiveHint`, `idempotentHint`,
  `openWorldHint`); error messages must be actionable.
- Consistent naming: `resource_action` (`github_create_issue`).
- Verify loop: `npm run build` → self-check script →
  `npx @modelcontextprotocol/inspector`.
- Ship an evaluation file: 10 QA pairs, each independent, read-only,
  multi-hop, realistic, string-verifiable, stable.
- Docs: start at `https://modelcontextprotocol.io/sitemap.xml`, fetch with
  `.md` suffix; SDK reference via raw GitHub READMEs.

## 5. Claude API — never guess

Function/type names must come from the language docs in
`anthropic-skills/claude-api/` or its live-sources list — APIs drift
(e.g. `thinking: {type: "adaptive"}` replaced `budget_tokens`).

- Set `max_tokens` generously (~16k non-streaming, ~64k streaming); check
  `stop_reason` (incl. `"refusal"`) before reading content; never silently
  truncate inputs; don't reimpose SDK structure (no wrapping stream events in
  promises, no string-matching errors, no custom interfaces for SDK types).
- Write code and let the compiler report unknowns — a session spent "discovering"
  SDK types without writing files is wasted.

## 6. Ship checklist

- [ ] Design plan written, reviewed against brief, deviations noted
- [ ] No blacklist visual tells in the final UI
- [ ] E2E: recon → act flow passes on a clean run with servers via helper
- [ ] Bundle builds; open `bundle.html` standalone
- [ ] (If tools) MCP server annotated, inspected, evals file committed
- [ ] (If LLM) SDK calls verified against current docs, refusal path handled
