# Provenance — why this skill is not vendored

`animated-video` is a skill file from **Claude Design**, Anthropic's product for making
designed artifacts. It reached the public through
[asgeirtj/system_prompts_leaks](https://github.com/asgeirtj/system_prompts_leaks), a
community dump of leaked product prompts and skills — not through an Anthropic release
under an open license.

## Decision

Listed, linked, and **not mirrored** into this repository:

1. **Legal exposure.** Redistributing leaked proprietary material in a public repo is a
   DMCA target, and GitHub strikes at the owning account, not just the file. This catalog
   exists to be safe to install; that is not safe.
2. **It does not travel.** The skill is written against Claude Design's host runtime:
   `copy_starter_component`, the `animations_v3.jsx` composition engine, the
   `window.OM_SCENES` literal the editor writes back to, and the `multi_screenshot`
   filmstrip loop. Outside that product there is nothing to call, so a copied `SKILL.md`
   would be a dead file that still teaches a reader to reach for tools they do not have.

The link to the dump is preserved above because provenance should be visible, and because
the *method* in that skill is worth learning — see the mapping table in
[README.md](README.md) for the open packs in this category that implement the same
discipline.

## Rule for future additions

A skill enters this repository when its upstream grants a license that allows
redistribution (MIT / Apache / CC / CC0 / GPL-family with the license file kept). Leaked
or unlicensed material gets a reference entry like this one instead.
