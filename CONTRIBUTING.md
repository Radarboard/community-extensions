# Contributing

Community extensions should be small, focused, and compatible with the current Radarboard SDK packages.

Before opening a pull request:

1. Run validation for the extension you changed.
2. Keep secrets and local environment files out of commits.
3. Document any required setup in the extension README.

## Setup

```bash
pnpm install
pnpm validate
pnpm catalog:generate
```

## Extension placement

| Type | Directory | Use for |
| --- | --- | --- |
| Integration | `integrations/<name>/` | Service credentials, API clients, and data sources |
| Plugin | `plugins/<name>/` | Full surfaces, overlays, and command-style tools |
| Widget | `widgets/<name>/` | Dashboard cards and expanded panels |

Use kebab-case directory names. Keep package names aligned with Radarboard conventions, such as `@radarboard/widget-my-service`.

## Pull request checklist

- The extension has a README with setup and required credentials.
- `pnpm validate` passes.
- `pnpm catalog:generate` completes.
- No secrets, `.env*` files, local databases, caches, or build output are committed.
- The PR explains which service or workflow the extension supports.

## Review expectations

Maintainers review community extensions for SDK compatibility, focused scope, security-sensitive behavior, and documentation quality. Experimental extensions may remain in this repo even when they are not ready for the core Radarboard monorepo.
