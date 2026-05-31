import type { WidgetDescriptor } from "@radarboard/widget-sdk/widget-types";

export const demoDescriptor: WidgetDescriptor = {
  id: "demo",
  name: "Demo Widget",
  description: "Fixture widget for validation.",
  defaultSlot: "slot1",
  capabilities: [
    { id: "uptime", role: "canonical", providers: [{ integration: "demo", action: "data" }] },
  ],
  component: () => null,
};
