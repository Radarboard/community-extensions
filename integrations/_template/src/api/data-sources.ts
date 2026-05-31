import type { DataSourceDescriptor } from "@radarboard/integration-sdk/types";
import { fetch__EXT_PASCAL__Items } from "./client";

export const __EXT_CAMEL__DataSources: DataSourceDescriptor[] = [
  {
    action: "data",
    description: "Fetch __EXT_NAME__ data.",
    cacheTtlSeconds: 300,
    pollingSourceId: "__EXT_KEBAB__",
    buildCacheKey: (params) =>
      `__EXT_KEBAB__:data:${params.projectSlug ?? "all"}:${params.range}:${params.timeZone}`,
    async fetch(_params, ctx) {
      const creds = await ctx.resolveCredential("__EXT_KEBAB__");
      if (!creds?.apiKey) {
        return { configured: false, items: [] };
      }

      const items = await fetch__EXT_PASCAL__Items({ apiKey: String(creds.apiKey) });
      return { configured: true, items };
    },
  },
];
