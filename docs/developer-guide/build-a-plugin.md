# Build a Plugin

Plugins add full product surfaces to Radarboard: overlays, command workflows, local storage, settings, intents, services, and optional plugin-contributed widgets.

## Scaffold

```bash
pnpm create-plugin release-notes
```

This creates `plugins/release-notes/` with a typed descriptor, starter overlay, MCP tools, README, changelog, and conformance test.

## Descriptor

```ts
export const releaseNotesDescriptor: PluginDescriptor = {
  id: "release-notes",
  name: "Release Notes",
  description: "Draft and manage release notes.",
  category: "productivity",
  version: "0.1.0",
  launchSurfaces: ["palette"],
  presentation: { default: "side-panel", alternates: ["fullscreen"], size: "md" },
  component: ReleaseNotesOverlay,
  mcpTools: releaseNotesMcpTools,
  permissions: ["db", "notify"],
};
```

## Implementation rules

- Keep persisted entities explicit and typed.
- Use SDK layout primitives where available instead of inventing a separate design system.
- Add query-param sync when users can deep-link into selected items.
- Keep MCP tools small and backed by the same data model as the UI.
- Request only the permissions the plugin actually needs.

## Verification

```bash
pnpm check:extensions --filter=plugin
pnpm --filter @radarboard/plugin-release-notes test
pnpm validate
```
