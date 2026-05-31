import type { IntegrationDescriptor } from "@radarboard/integration-sdk/types";
import { Puzzle } from "lucide-react";
import { __EXT_CAMEL__DataSources } from "./api/data-sources";
import { __EXT_CAMEL__McpTools } from "./mcp/mcp-tools";

export const __EXT_CAMEL__Descriptor: IntegrationDescriptor = {
  id: "__EXT_KEBAB__",
  name: "__EXT_NAME__",
  description: "Connect __EXT_NAME__ data to Radarboard.",
  icon: Puzzle,
  category: "monitoring",
  auth: {
    id: "__EXT_KEBAB__",
    name: "__EXT_NAME__",
    type: "api_key",
    fields: [{ key: "apiKey", label: "API Key", type: "password" }],
  },
  capabilities: [{ id: "uptime", action: "data" }],
  dataSources: __EXT_CAMEL__DataSources,
  mcpTools: __EXT_CAMEL__McpTools,
};
