import type { PluginDescriptor } from "@radarboard/plugin-sdk/types";
import { Puzzle } from "lucide-react";
import { __EXT_PASCAL__Overlay } from "./components/__EXT_KEBAB__-overlay";
import { __EXT_CAMEL__McpTools } from "./mcp-tools";

export const __EXT_CAMEL__Descriptor: PluginDescriptor = {
  id: "__EXT_KEBAB__",
  name: "__EXT_NAME__",
  description: "__EXT_NAME__ workflow for Radarboard.",
  icon: Puzzle,
  category: "productivity",
  version: "0.1.0",
  launchSurfaces: ["palette"],
  presentation: { default: "side-panel", alternates: ["fullscreen"], size: "md" },
  component: __EXT_PASCAL__Overlay,
  mcpTools: __EXT_CAMEL__McpTools,
  permissions: ["db", "notify"],
};
