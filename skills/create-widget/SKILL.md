---
name: create-widget
description: "Create or update a Radarboard community widget under widgets/. Use for dashboard cards, expanded panels, template recipes, data resolvers, hooks, visual editor config, capability wiring, and widget MCP tools."
---

# Create Widget

Use `pnpm create-widget <name>` from the community extensions repo.

Collect:

- widget name in kebab-case
- integration or plugin data it visualizes
- shared capability it owns, if any
- whether it is `canonical` or `specialized`
- whether template-backed sections are enough
- required auth, polling, variants, or plugin expand action
- default dashboard slot

Default to a template-backed widget. Switch to custom components only when the standard sections cannot express the interaction.

After scaffolding:

- replace all placeholder metadata
- keep data shapes in `src/types.ts`
- use `src/data-resolver.tsx` to connect hooks to template data
- keep compact and expanded views visually aligned with Radarboard widgets
- document setup, required integrations, and screenshots in `README.md`

Verify:

```bash
pnpm check:extensions --filter=widget
pnpm --filter @radarboard/widget-<name> test
pnpm validate
```
