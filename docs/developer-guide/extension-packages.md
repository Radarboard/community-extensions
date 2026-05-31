# Extension Packages

An extension package is a standalone Git repository that contains one or more Radarboard extensions, for example a Notion integration, plugin, and widget.

## Manifest

Create `radarboard-extension.json` at the root of the package:

```json
{
  "name": "Notion Extension Package",
  "description": "Full Notion integration for Radarboard",
  "author": {
    "name": "Your Name",
    "url": "https://github.com/yourname"
  },
  "minAppVersion": "1.0.0",
  "extensions": [
    {
      "type": "integration",
      "path": "integrations/notion",
      "name": "@radarboard/integration-notion",
      "required": true
    },
    {
      "type": "plugin",
      "path": "plugins/notion",
      "name": "@radarboard/plugin-notion",
      "required": true
    },
    {
      "type": "widget",
      "path": "widgets/notion",
      "name": "@radarboard/widget-notion",
      "required": false
    }
  ]
}
```

## Scaffold

```bash
pnpm scaffold:extension-repo notion --integration --plugin --widget --out ../
```

The generated package includes a manifest, root package metadata, TypeScript config, Biome config, `.gitignore`, README, and starter extension directories.

## Validation

Each extension in the package is validated independently:

- manifest path exists
- package name matches the manifest entry
- default export resolves
- required SDK dependency is present
- tests and conformance tests are present
- README and changelog are present
- no obvious secrets or generated artifacts are committed
