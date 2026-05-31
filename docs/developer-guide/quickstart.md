# Quickstart

This is the shortest path from an empty checkout to a review-ready Radarboard community extension.

## 1. Install

```bash
git clone https://github.com/Radarboard/community-extensions.git
cd community-extensions
pnpm install
```

## 2. Create

For a pull request directly to the community repo:

```bash
pnpm create-widget github-releases
pnpm create-integration statuscake
pnpm create-plugin release-notes
```

For a standalone extension repo that can later be submitted or installed by GitHub URL:

```bash
radarboard-extension create package github-releases --widget --out ../
```

For a bundled package:

```bash
radarboard-extension create package notion --integration --plugin --widget --out ../
```

## 3. Develop

Start from the generated extension package or the community repo. Point the CLI at a local Radarboard source checkout:

```bash
cd ../radarboard-github-releases
radarboard-extension dev --radarboard ../radarboard
```

This detects the extension, writes Radarboard's local dev-extension manifest, regenerates extension init files, checks whether the Radarboard dev server is running, and opens the right sandbox.

If the Radarboard dev server is not already running:

```bash
cd ../radarboard
pnpm dev
```

Then open the sandbox printed by the CLI, usually one of:

- `http://localhost:1355/debug/widget-sandbox`
- `http://localhost:1355/debug/plugin-sandbox`
- `http://localhost:1355/debug/integration-sandbox`

## 4. Validate

```bash
radarboard-extension submit-check
```

This runs structure checks, extension quality checks, secret scanning, and catalog generation.

## 5. Submit

Open a pull request with:

- final descriptor metadata
- README setup and limitations
- CHANGELOG entry
- tests and conformance coverage
- screenshots or recordings for UI extensions
- notes about credentials, rate limits, and capability ownership
