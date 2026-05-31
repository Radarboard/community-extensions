"use client";

import { usePollingInterval } from "@radarboard/hooks/use-polling-interval";
import useSWR from "swr";
import { ROUTES } from "../routes";
import type { __EXT_PASCAL__Data } from "../types";

async function fetcher(url: string): Promise<__EXT_PASCAL__Data> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch __EXT_NAME__: ${res.status}`);
  return res.json() as Promise<__EXT_PASCAL__Data>;
}

export function use__EXT_PASCAL__(projectSlug: string | null) {
  const refreshInterval = usePollingInterval("__EXT_KEBAB__");
  const url = projectSlug ? `${ROUTES.__EXT_CAMEL__}?project=${projectSlug}` : ROUTES.__EXT_CAMEL__;
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, { refreshInterval });

  return {
    data: data ?? null,
    error: error ?? null,
    isLoading,
    refetch: () => mutate(),
  };
}
