#!/usr/bin/env python3
"""Generate site/skills.json from the repository itself.

Scans every skill category for SKILL.md files (name/description from YAML
frontmatter), keeps empty folders as planned "skeleton" nodes, reads folder
descriptions from each README.md, and parses the Contributors table from the
root README.md.

Run locally to preview:  python3 site/build.py
CI runs it automatically before every Pages deploy.
"""

import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "site" / "skills.json"

SKIP_DIRS = {"node_modules", "__pycache__"}

CATEGORY_META = {
    "fullstack-skills":   {"icon": "🧩", "desc": "Backend, frontend, mobile, Telegram bots and AI agents."},
    "ui-ux-skills":       {"icon": "🎨", "desc": "Design intelligence for web, mobile and desktop."},
    "seo-skills":         {"icon": "📈", "desc": "Search visibility as an engineering & content discipline."},
    "video-generation":   {"icon": "🎥", "desc": "Finished video, produced in code and with AI."},
    "custom-skills":      {"icon": "⭐", "desc": "Consolidated, opinionated skills merged from the categories above.", "badge": "custom"},
    "anthropic-skills":   {"icon": "🏛️", "desc": "Vendored: Anthropic's official SKILL.md reference collection.", "badge": "vendor"},
    "marketing-skills":   {"icon": "📣", "desc": "Vendored: coreyhaines31/marketingskills — 52 marketing skills.", "badge": "vendor"},
    "product-skills":     {"icon": "📦", "desc": "Vendored: phuryn/pm-skills — product management by discipline.", "badge": "vendor"},
}

SKILL_MD = "SKILL.md"
FM_RE = re.compile(r"^---\s*\n(.*?)\n---", re.S)
MAX_SKILL_DESC = 220


def parse_frontmatter(path: Path) -> dict:
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return {}
    m = FM_RE.match(text)
    if not m:
        return {}
    fm = {}
    lines = m.group(1).splitlines()
    i = 0
    while i < len(lines):
        kv = re.match(r"^([A-Za-z_][\w-]*)\s*:\s*(.*)$", lines[i])
        if not kv:
            i += 1
            continue
        key, value = kv.group(1), kv.group(2).strip().strip("\"'")
        if value in {"|", "|-", "|+", ">", ">-", ">+"} or (value == "" and i + 1 < len(lines)
                                                            and lines[i + 1].startswith((" ", "\t"))):
            block, i = [], i + 1
            while i < len(lines) and (not lines[i].strip() or lines[i].startswith((" ", "\t"))):
                block.append(lines[i].strip())
                i += 1
            value = " ".join(x for x in block if x)
        else:
            i += 1
        if key in ("name", "description"):
            fm[key] = value
    return fm


def desc_from_readme(directory: Path) -> str:
    readme = directory / "README.md"
    if not readme.is_file():
        return ""
    started = False
    for line in readme.read_text(encoding="utf-8", errors="replace").splitlines():
        s = line.strip()
        if not started:
            if s.startswith("# "):
                started = True
            continue
        if s and not s.startswith(("<!--", "|", "```")):
            return re.sub(r"[#>*`\[\]]", "", s)[:160]
    return ""


def build_dir_node(directory: Path) -> dict:
    """A directory holding SKILL.md is a skill leaf; anything else is a group."""
    skill_md = directory / SKILL_MD
    if skill_md.is_file():
        fm = parse_frontmatter(skill_md)
        subdirs = [d for d in directory.iterdir()
                   if d.is_dir() and not d.name.startswith(".") and d.name not in SKIP_DIRS]
        return {
            "name": fm.get("name", directory.name),
            "desc": (fm.get("description") or "")[:MAX_SKILL_DESC],
            "path": str(directory.relative_to(ROOT)),
            "skills": [{"name": directory.name,
                        "desc": (fm.get("description") or "")[:MAX_SKILL_DESC]}],
            "support": len(subdirs),
        }
    children = [build_dir_node(sub) for sub in sorted(directory.iterdir())
                if sub.is_dir() and not sub.name.startswith(".") and sub.name not in SKIP_DIRS]
    support_files = [f for f in directory.iterdir()
                     if f.is_file() and f.name not in ("README.md", SKILL_MD)]
    return {
        "name": directory.name,
        "desc": desc_from_readme(directory),
        "children": children,
        "files": len(support_files),
    }


def has_skills(node: dict) -> bool:
    if node.get("skills"):
        return True
    return any(has_skills(c) for c in node.get("children", []))


def build_categories() -> list:
    cats = []
    for top in sorted(ROOT.iterdir()):
        if not top.is_dir() or top.name.startswith(".") or top.name in SKIP_DIRS:
            continue
        if top.name not in CATEGORY_META and not list(top.rglob(SKILL_MD)):
            continue
        meta = CATEGORY_META.get(top.name, {"icon": "📁", "desc": desc_from_readme(top)})
        children = [build_dir_node(sub) for sub in sorted(top.iterdir())
                    if sub.is_dir() and not sub.name.startswith(".") and sub.name not in SKIP_DIRS]
        cats.append({
            "name": top.name,
            "icon": meta["icon"],
            "desc": meta["desc"],
            "badge": meta.get("badge"),
            "children": children,
        })
    return cats


def count_skills(nodes: list) -> int:
    return sum(len(n.get("skills", [])) + count_skills(n.get("children", [])) for n in nodes)


def parse_contributors() -> list:
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    section = re.search(r"## 🤝 Contributors\n(.*?)(?=\n## |\n---)", readme, re.S)
    if not section:
        return []
    body = re.sub(r"<!--.*?-->", "", section.group(1), flags=re.S)
    out = []
    for row in re.findall(r"^\|.*\|$", body, re.M)[2:]:
        cells = [c.strip() for c in row.strip("|").split("|")]
        if len(cells) < 4:
            continue
        link = re.match(r"\[(.*?)\]\((.*?)\)", cells[1])
        name, url = (link.group(1), link.group(2)) if link else (cells[1], "")
        out.append({
            "name": name, "site": url, "role": cells[2],
            "focus": [f.strip() for f in cells[3].split("·") if f.strip()],
            "initials": "".join(w[0] for w in name.split()[:2]).upper(),
        })
    return out


def main() -> None:
    cats = build_categories()
    data = {
        "generated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "skillCount": count_skills(cats),
        "categories": cats,
        "contributors": parse_contributors(),
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"skills.json: {data['skillCount']} skills across {len(cats)} categories, "
          f"{len(data['contributors'])} contributors")


if __name__ == "__main__":
    main()
