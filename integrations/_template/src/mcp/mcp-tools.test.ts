import assert from "node:assert/strict";
import test from "node:test";
import { __EXT_CAMEL__McpTools } from "./mcp-tools.ts";

test("__EXT_NAME__ MCP tools are exported", () => {
  assert.ok(Array.isArray(__EXT_CAMEL__McpTools));
});
