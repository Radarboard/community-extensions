import type { PluginDescriptor } from "@radarboard/plugin-sdk/types";

export const demoDescriptor: PluginDescriptor = {
  id: "demo",
  name: "Demo Plugin",
  description: "Fixture plugin for validation.",
  category: "productivity",
  version: "0.1.0",
  launchSurfaces: ["palette"],
  presentation: { default: "side-panel", size: "md" },
  component: () => null,
};
