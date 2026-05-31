import type { IntegrationDescriptor } from "@radarboard/integration-sdk/types";

export const demoDescriptor: IntegrationDescriptor = {
  id: "demo",
  name: "Demo Integration",
  description: "Fixture integration for validation.",
  category: "monitoring",
  capabilities: [{ id: "uptime", action: "data" }],
  dataSources: [{ action: "data", description: "Fixture data." }],
};
