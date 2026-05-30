# Radarboard Community Extensions

Community-maintained integrations, plugins, and widgets for [Radarboard](https://github.com/Radarboard/radarboard).

This repository is intentionally separate from the core Radarboard monorepo so community extensions can evolve with their own review, validation, and release flow.

- Docs: <https://docs.radarboard.app/developer-guide/community-extensions>
- Core repo: <https://github.com/Radarboard/radarboard>
- Extension package docs: <https://docs.radarboard.app/developer-guide/extension-packages>

## Structure

- `integrations/` for third-party service connectors.
- `plugins/` for full product surfaces.
- `widgets/` for dashboard cards and panels.
- `radarboard.community.config.js` for repository paths and catalog metadata.
- `scripts/` for catalog generation and validation checks.

```text
integrations/
plugins/
widgets/
radarboard.community.config.js
scripts/generate-catalog.mjs
scripts/validate-all.mjs
```

## Local workflow

```bash
pnpm install
pnpm validate
pnpm catalog:generate
pnpm test
```

`pnpm validate` verifies the repository shape, package manager declaration, and extension directories. `pnpm catalog:generate` writes `catalog.json` from the configured extension directories.

## Contribution model

- Put new extensions in the matching top-level directory.
- Include an extension README with setup, credentials, limitations, and screenshots when useful.
- Keep extensions focused on a single service, product area, or workflow.
- Do not commit secrets, `.env*` files, local databases, build output, or generated caches.
- Open pull requests against `main`; CI must pass before review.

## Governance

Community extensions are reviewed for basic safety, maintainability, and SDK compatibility. Extensions can be promoted into the core Radarboard repo after they are stable, broadly useful, and actively maintained by the core team.

## Status

This repository starts fresh under the `Radarboard` organization. Legacy commits, tags, and releases were not migrated.
