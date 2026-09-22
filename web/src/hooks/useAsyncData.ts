import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "../api/client";

const FRIENDLY_ERROR = "The Vault is waking up. Please try again.";

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best-effort only - localStorage can be unavailable (private mode, quota)
  }
}

interface Options<T> {
  // Persists the last successful result so a returning visitor sees it
  // instantly while a fresh copy loads in the background.
  cacheKey?: string;
  // Shown instantly (before any network round trip) when there's no cache
  // yet - e.g. a bundled static snapshot of the catalog.
  fallback?: T;
  deps?: unknown[];
}

// Fetches on mount (and whenever `retry()` is called or a dep changes),
// seeding from a cache/fallback so the page never starts blank. Once any
// data is showing (cached, fallback, or a previous successful fetch), a
// failed background refresh fails quietly instead of blowing away what's
// already on screen.
export function useAsyncData<T>(fetcher: () => Promise<T>, options: Options<T> = {}) {
  const { cacheKey, fallback, deps = [] } = options;
  const [data, setData] = useState<T | null>(() => (cacheKey ? readCache<T>(cacheKey) : null) ?? fallback ?? null);
  const [loading, setLoading] = useState(data === null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const hasData = useRef(data !== null);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    fetcher()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        hasData.current = true;
        if (cacheKey) writeCache(cacheKey, result);
      })
      .catch((err) => {
        if (cancelled || hasData.current) return;
        setError(err instanceof ApiError ? err.message : FRIENDLY_ERROR);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, ...deps]);

  return { data, loading, error, retry };
}
