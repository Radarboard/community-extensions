# Build an Integration

Integrations connect Radarboard to external services. They own credentials, API clients, normalized data sources, optional MCP tools, and optional webhooks.

## Scaffold

```bash
pnpm create-integration statuscake
```

This creates `integrations/statuscake/` with a package manifest, descriptor, API client, data sources, MCP tool starter, README, changelog, and conformance test.

## Descriptor

The descriptor should be concrete and free of placeholders:

```ts
export const statuscakeDescriptor: IntegrationDescriptor = {
  id: "statuscake",
  name: "StatusCake",
  description: "Uptime checks and incidents from StatusCake.",
  category: "monitoring",
  auth: {
    id: "statuscake",
    name: "StatusCake",
    type: "api_key",
    fields: [{ key: "apiKey", label: "API Key", type: "password" }],
  },
  capabilities: [{ id: "uptime", action: "checks" }],
  dataSources: statuscakeDataSources,
  mcpTools: statuscakeMcpTools,
};
```

## Data source rules

- Resolve credentials through the SDK context, not global state.
- Return stable empty states when credentials are missing.
- Keep upstream response types separate from normalized Radarboard payloads.
- Include cache keys and polling IDs when the source is polled.
- Add capability metadata when the integration powers a shared surface such as revenue, uptime, shipping, analytics, SEO, app reviews, downloads, sponsorship, stars, or errors.

## Verification

```bash
pnpm check:extensions --filter=integration
pnpm --filter @radarboard/integration-statuscake test
pnpm validate
```
