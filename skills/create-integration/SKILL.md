---
name: create-integration
description: "Create or update a Radarboard community integration under integrations/. Use for external service connections, credentials, data sources, MCP tools, config flows, webhooks, and capability-backed provider work."
---

# Create Integration

Use `pnpm create-integration <name>` from the community extensions repo.

Collect:

- integration name in kebab-case
- upstream service and docs URL
- auth type: `api_key`, `oauth`, or `none`
- category: `revenue`, `deployment`, `analytics`, `monitoring`, or `communication`
- data source actions
- capability IDs the integration provides
- whether MCP tools, webhooks, or delta detection are needed

After scaffolding:

- replace all placeholder metadata
- keep auth fields minimal
- put API calls in `src/api/client.ts`
- put route/data-source definitions in `src/api/data-sources.ts`
- put normalized response types in `src/types.ts`
- add MCP tools only when assistant access is useful
- document credentials and limitations in `README.md`

Verify:

```bash
pnpm check:extensions --filter=integration
pnpm --filter @radarboard/integration-<name> test
pnpm validate
```
