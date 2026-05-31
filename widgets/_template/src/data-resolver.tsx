"use client";

import {
  type DataSourceResolverProps,
  registerTemplateDataSource,
  reportResolverState,
} from "@radarboard/widget-sdk/data-source-registry";
import { use__EXT_PASCAL__ } from "./hooks/use-__EXT_KEBAB__";

function __EXT_PASCAL__Resolver({ config, onData }: DataSourceResolverProps) {
  const { data, error, isLoading } = use__EXT_PASCAL__(config?.projectSlug ?? null);

  reportResolverState(onData, "__EXT_KEBAB__", {
    loading: isLoading,
    error: error?.message ?? null,
    configured: data?.configured ?? false,
    fetchedAt: null,
    stale: false,
    data: data ?? null,
  });

  return null;
}

registerTemplateDataSource("__EXT_KEBAB__", __EXT_PASCAL__Resolver);
