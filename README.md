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
- `docs/developer-guide/` for the public contributor guide.
- `skills/` for agent-readable extension development instructions.
- `*/_template/` for scaffolding starters. Templates are excluded from the pnpm workspace.
- `radarboard.community.config.js` for repository paths and catalog metadata.
- `scripts/` for catalog generation and validation checks.

```text
docs/developer-guide/
integrations/
plugins/
skills/
widgets/
radarboard.community.config.js
scripts/generate-catalog.mjs
scripts/validate-all.mjs
```

## Local workflow

```bash
pnpm install
pnpm validate
pnpm check:extensions
pnpm test
pnpm catalog:generate
```

`pnpm validate` verifies the repository shape, package manager declaration, extension quality gates, secrets, and catalog generation. `pnpm check:extensions` runs the extension-specific quality gate. `pnpm catalog:generate` writes a deterministic `catalog.json` from extension descriptors.

Commits must use Conventional Commit messages with a scope, for example `feat(widgets): add github releases widget` or `fix(integrations): handle missing credentials`. `pnpm install` configures Lefthook, which runs Biome on staged files and checks commit messages with Commitlint. CI checks the same rules for pushed commits and pull requests.

## Create an extension

```bash
pnpm create-integration statuscake
pnpm create-plugin release-notes
pnpm create-widget github-releases
```

Create a standalone extension package outside this repo:

```bash
radarboard-extension create package notion --integration --plugin --widget --out ../
```

Each generated extension includes a package manifest, README, changelog, descriptor, conformance test, and starter source files. Replace placeholder metadata before opening a pull request.

## One-command dev loop

From an extension repo or extension directory:

```bash
radarboard-extension dev --radarboard ../radarboard
```

This detects the extension, writes Radarboard's local dev-extension manifest, regenerates extension init files, checks whether the Radarboard dev server is running, and opens the right sandbox.

Before submitting:

```bash
radarboard-extension submit-check
```

## Contribution model

- Put new extensions in the matching top-level directory.
- Include an extension README with setup, credentials, limitations, and screenshots when useful.
- Keep extensions focused on a single service, product area, or workflow.
- Do not commit secrets, `.env*` files, local databases, build output, or generated caches.
- Keep package names aligned with `@radarboard/integration-<name>`, `@radarboard/plugin-<name>`, or `@radarboard/widget-<name>`.
- Add tests and an SDK conformance test for every extension.
- Open pull requests against `main`; CI must pass before review.

## Governance

Community extensions are reviewed for safety, maintainability, SDK compatibility, documentation quality, UX fit, and whether they duplicate an existing canonical capability. Extensions can be promoted into the core Radarboard repo after they are stable, broadly useful, and actively maintained by the core team.

See:

- `docs/developer-guide/quickstart.md`
- `docs/developer-guide/review-policy.md`
- `docs/developer-guide/security-policy.md`
- `docs/developer-guide/before-you-submit.md`

## Status

This repository starts fresh under the `Radarboard` organization. Legacy commits, tags, and releases were not migrated.
