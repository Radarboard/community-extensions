# MCP Tools

MCP tools let the assistant query or act through an extension.

## Rules

- Keep tools focused on one action.
- Validate parameters with the SDK-supported schema shape.
- Reuse the same API clients and data model as the UI.
- Never expose credentials or raw secrets in tool output.
- Return compact, structured results suitable for assistant use.

## Integration tools

Use integration MCP tools for upstream service actions, such as listing incidents, fetching deployments, or querying analytics.

## Plugin tools

Use plugin MCP tools for plugin-owned data, such as listing notes, creating tasks, or searching bookmarks.

## Widget tools

Use widget MCP tools sparingly. Prefer integration or plugin tools unless the tool is specific to the widget's aggregated view.
