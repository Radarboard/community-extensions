# Build a Widget

Widgets render dashboard cards and expanded panels. Prefer template-backed widgets for KPIs, lists, tables, charts, and feeds. Use custom components only when the interaction cannot be expressed with standard template sections.

## Scaffold

```bash
pnpm create-widget github-releases
```

This creates `widgets/github-releases/` with descriptor, template config, compact and expanded components, data resolver, hook, MCP tools, README, changelog, and conformance test.

## Descriptor

```ts
export const githubReleasesDescriptor: WidgetDescriptor<WidgetTemplateConfig> = {
  id: "github-releases",
  name: "GitHub Releases",
  description: "Recent releases from GitHub repositories.",
  requiredIntegrations: ["github"],
  capabilities: [
    {
      id: "shipping",
      role: "specialized",
      providers: [{ integration: "github", action: "releases" }],
    },
  ],
  defaultSlot: "slot8",
  component: GitHubReleasesCompact,
  expandedComponent: GitHubReleasesExpanded,
  defaultConfig: GITHUB_RELEASES_TEMPLATE_CONFIG,
};
```

## Capability governance

Use capabilities to describe ownership of shared surfaces:

- `canonical`: the primary Radarboard widget for a capability
- `specialized`: a narrower or provider-specific view

When an integration adds a provider for an existing canonical capability, prefer updating the canonical widget provider list instead of submitting a duplicate widget.

## Verification

```bash
pnpm check:extensions --filter=widget
pnpm --filter @radarboard/widget-github-releases test
pnpm validate
```
