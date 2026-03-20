"use client";

import { useState, useEffect, useCallback } from "react";

interface UseDashboardDataOptions {
  /** Polling interval in ms (0 = no polling) */
  pollInterval?: number;
}

interface UseDashboardDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
  mutate: (updater: T | ((prev: T | null) => T | null)) => void;
}

export function useDashboardData<T>(
  url: string | string[],
  options?: UseDashboardDataOptions,
): UseDashboardDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      if (Array.isArray(url)) {
        const results = await Promise.all(
          url.map(async (u) => {
            const res = await fetch(u);
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            return res.json();
          }),
        );
        setData(results as T);
      } else {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json();
        setData(json as T);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [typeof url === "string" ? url : url.join(",")]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!options?.pollInterval) return;
    const id = setInterval(fetchData, options.pollInterval);
    return () => clearInterval(id);
  }, [fetchData, options?.pollInterval]);

  const retry = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const mutate = useCallback(
    (updater: T | ((prev: T | null) => T | null)) => {
      setData((prev) =>
        typeof updater === "function"
          ? (updater as (prev: T | null) => T | null)(prev)
          : updater,
      );
    },
    [],
  );

  return { data, loading, error, retry, mutate };
}
