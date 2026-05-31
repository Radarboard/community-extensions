# Contributing

Community extensions should be small, focused, and compatible with the current Radarboard SDK packages.

Before opening a pull request:

1. Run validation for the extension you changed.
2. Keep secrets and local environment files out of commits.
3. Document any required setup in the extension README.
4. Include tests, conformance coverage, and a changelog entry.
5. Use Conventional Commit messages, such as `feat: add github releases widget` or `fix: handle missing credentials`.

## Setup

```bash
pnpm install
pnpm validate
pnpm check:extensions
pnpm test
pnpm catalog:generate
```

`pnpm install` configures Lefthook. Lefthook runs Biome on staged files, validates extension quality, and checks commit messages with Commitlint. CI uses the same Conventional Commit rule for pushed commits and pull requests.

The equivalent full submission gate is:

```bash
radarboard-extension submit-check
```

## Extension placement

| Type | Directory | Use for |
| --- | --- | --- |
| Integration | `integrations/<name>/` | Service credentials, API clients, and data sources |
| Plugin | `plugins/<name>/` | Full surfaces, overlays, and command-style tools |
| Widget | `widgets/<name>/` | Dashboard cards and expanded panels |

Use kebab-case directory names. Keep package names aligned with Radarboard conventions, such as `@radarboard/widget-my-service`.

## Scaffolding

```bash
pnpm create-integration my-service
pnpm create-plugin my-workflow
pnpm create-widget my-dashboard-card
```

For a standalone bundled package:

```bash
pnpm scaffold:extension-repo my-service --integration --plugin --widget --out ../
```

Generated files are starters, not finished submissions. Replace placeholder descriptions, auth details, docs links, and fake data before review.

## Local development

Use a local Radarboard source checkout for development:

```bash
radarboard-extension dev --radarboard ../radarboard
```

This writes `.radarboard/dev-extensions.json` in the Radarboard checkout and opens the correct sandbox route.

## Pull request checklist

- The extension has a README with setup and required credentials.
- The extension has a `CHANGELOG.md`.
- The extension exports a descriptor from its package default export.
- The extension has at least one test and a conformance test.
- `pnpm validate` passes.
- `pnpm check:extensions` passes.
- `pnpm test` passes.
- `pnpm catalog:generate` completes.
- No secrets, `.env*` files, local databases, caches, or build output are committed.
- The PR explains which service or workflow the extension supports.
- Screenshots or recordings are included for UI changes.

## Review expectations

Maintainers review community extensions for SDK compatibility, focused scope, security-sensitive behavior, documentation quality, UX consistency, bundle impact, and capability ownership. Experimental extensions may remain in this repo even when they are not ready for the core Radarboard monorepo.
