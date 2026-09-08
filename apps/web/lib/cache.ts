/**
 * In-process content cache for server-side API reads.
 *
 * The public site renders dynamically, but every CMS read goes through this
 * cache so the Go API is only hit when content actually changes. Entries are
 * invalidated (not dropped) by the sync layer, which lets us serve the last
 * known good value if the API is unreachable while refetching — the failure
 * mode that left the site empty after the Railway restart.
 */

type Entry<T = unknown> = {
  value: T;
  fetchedAt: number;
  stale: boolean;
  pending: Promise<T> | null;
};

type CacheState = {
  entries: Map<string, Entry>;
  version: number;
};

const globalKey = "__ndzContentCache";

function state(): CacheState {
  const g = globalThis as typeof globalThis & { [globalKey]?: CacheState };
  if (!g[globalKey]) {
    g[globalKey] = { entries: new Map(), version: 0 };
  }
  return g[globalKey]!;
}

export async function cached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const { entries } = state();
  const hit = entries.get(key) as Entry<T> | undefined;

  if (hit && !hit.stale) return hit.value;
  if (hit?.pending) return hit.pending;

  const pending = (async () => {
    try {
      const value = await fetcher();
      entries.set(key, { value, fetchedAt: Date.now(), stale: false, pending: null });
      return value;
    } catch (error) {
      if (hit) {
        // Stale-on-error: keep serving what we had rather than an empty page.
        console.warn(`[cache] refetch failed for ${key}, serving stale value`, error);
        hit.pending = null;
        return hit.value;
      }
      throw error;
    }
  })();

  if (hit) {
    hit.pending = pending;
  } else {
    entries.set(key, { value: undefined as T, fetchedAt: 0, stale: true, pending });
  }

  try {
    return await pending;
  } finally {
    const current = entries.get(key);
    if (current && current.pending === pending) current.pending = null;
    if (current && current.fetchedAt === 0) entries.delete(key);
  }
}

/** Mark every cached entry stale so the next read refetches. */
export function invalidateAll(): number {
  const s = state();
  let count = 0;
  for (const entry of s.entries.values()) {
    if (entry.fetchedAt > 0) {
      entry.stale = true;
      count++;
    }
  }
  s.version++;
  return count;
}

export function cacheVersion(): number {
  return state().version;
}

export function cacheKeys(): string[] {
  return Array.from(state().entries.keys());
}
