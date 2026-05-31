# Community Extensions

Radarboard community extensions are independently reviewed integrations, plugins, and widgets that can be installed or promoted without living in the core Radarboard monorepo.

## Extension types

| Type | Directory | Purpose |
| --- | --- | --- |
| Integration | `integrations/<name>/` | Credentials, upstream API clients, data sources, MCP tools, and webhooks |
| Plugin | `plugins/<name>/` | Overlays, command surfaces, local workflows, settings, intents, and plugin-scoped tools |
| Widget | `widgets/<name>/` | Dashboard cards, expanded panels, template recipes, and visualizations |

Use kebab-case directory names. Package names must be:

- `@radarboard/integration-<name>`
- `@radarboard/plugin-<name>`
- `@radarboard/widget-<name>`

## Local workflow

```bash
pnpm install
pnpm create-widget my-widget
pnpm validate
pnpm check:extensions
pnpm test
pnpm catalog:generate
```

Every extension should include:

- `package.json` with a default export map
- `README.md` with setup, credentials, limitations, and screenshots for UI extensions
- `CHANGELOG.md`
- a descriptor export from the default package entry
- at least one test
- an SDK conformance test

## Review model

Maintainers review for usefulness, safety, SDK compatibility, focused scope, documentation quality, UX consistency, bundle impact, and capability ownership. A submission can stay experimental in this repository even if it is not ready for the core Radarboard monorepo.

## What not to submit

- secrets, `.env*` files, local databases, caches, coverage, `node_modules`, or build output
- broad extensions that combine unrelated workflows
- placeholder metadata such as `TODO`, `example.com`, or fake credentials
- duplicated canonical widgets when an existing widget should gain a new provider instead
