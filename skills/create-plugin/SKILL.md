---
name: create-plugin
description: "Create or update a Radarboard community plugin under plugins/. Use for overlays, command-style tools, plugin data models, settings, intents, services, MCP tools, and plugin-contributed widgets."
---

# Create Plugin

Use `pnpm create-plugin <name>` from the community extensions repo.

Collect:

- plugin name in kebab-case
- category: `productivity`, `monitoring`, or `data`
- launch surfaces: `palette`, `topbar`, or `dock`
- presentation mode: `side-panel`, `fullscreen`, `modal`, or `mini-hud`
- whether the data is local, external, or both
- permissions, settings, MCP tools, intents, services, widgets, and shortcuts

After scaffolding:

- replace all placeholder metadata
- keep persisted entities explicit in `src/types.ts`
- use SDK plugin primitives where available
- keep MCP tools backed by the same model as the UI
- document usage, storage, credentials, and limitations in `README.md`

Verify:

```bash
pnpm check:extensions --filter=plugin
pnpm --filter @radarboard/plugin-<name> test
pnpm validate
```
