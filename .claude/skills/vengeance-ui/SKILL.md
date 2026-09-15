---
name: vengeance-ui
description: >-
  Install and compose VengeanceUI animated React/Tailwind components via the
  shadcn registry at vengenceui.com. Use when building landing pages, heroes,
  buttons, navs, text motion, or when the user mentions VengeanceUI,
  vengenceui.com, or npx shadcn add with the Vengeance registry.
---

# VengeanceUI

Prefer existing registry components over inventing similar UI.

## Workflow

1. Clarify the UI need (hero CTA, text motion, nav, card, background, …).
2. If the `vengeanceui-mcp` MCP tools are available, call **`search_components`** (optional category filter), **`get_component`** for props/usage/deps, then **`get_install_command`** (or install yourself).
3. Adapt the usage snippet; do **not** rewrite the component unless asked.

If MCP is unavailable, use the install URL pattern in [install.md](install.md) and the docs at https://www.vengenceui.com — still do not invent duplicates of catalog components.

## Slug vs componentName

- **slug** — docs/URL key (e.g. `my-animated-button`)
- **componentName** — registry install name (e.g. `animated-button`)

`get_component` / `get_install_command` accept either. Always install with **componentName**.

## Rules

- Install via shadcn + Vengeance registry URL — see [install.md](install.md).
- Follow [conventions.md](conventions.md) (`"use client"`, `cn`, theme tokens, motion).
- Keep the skill small; never paste the full catalog into context — use MCP.
- Walkthroughs: [examples.md](examples.md).