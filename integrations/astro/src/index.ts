/**
 * Astro — Integration Descriptor
 */

import type { IntegrationDescriptor } from "@radarboard/integration-sdk/types";
import { Search } from "lucide-react";
import { astroDataSources } from "./api/data-sources";

export const astroDescriptor: IntegrationDescriptor = {
  id: "astro",
  name: "Astro",
  description: "ASO keyword rankings and app store search visibility from Astro.",
  icon: Search,
  category: "analytics",
  apiDocsUrl: "https://tryastro.app",
  auth: {
    id: "astro",
    name: "Astro",
    type: "api_key",
    fields: [{ key: "apiKey", label: "API Key", type: "password" }],
    testEndpoint: "/api/credentials/test",
  },
  capabilities: [{ id: "seo", action: "keywords" }],
  dataSources: astroDataSources,
};

export { astroDataSources } from "./api/data-sources";
