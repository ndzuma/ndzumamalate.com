/**
 * Tiny in-process pub/sub used to fan content-change events out to browsers
 * connected to /api/live. Kept on globalThis so the route handler and the
 * instrumentation hook share one instance.
 */

export type LiveEvent = {
  type: string;
  resource?: string;
  action?: string;
  resource_id?: string;
  version?: number;
  occurred_at?: string;
};

type Listener = (event: LiveEvent) => void;

const globalKey = "__ndzLiveBus";

function listeners(): Set<Listener> {
  const g = globalThis as typeof globalThis & { [globalKey]?: Set<Listener> };
  if (!g[globalKey]) g[globalKey] = new Set();
  return g[globalKey]!;
}

export const liveBus = {
  subscribe(listener: Listener): () => void {
    const set = listeners();
    set.add(listener);
    return () => set.delete(listener);
  },
  emit(event: LiveEvent) {
    for (const listener of listeners()) {
      try {
        listener(event);
      } catch (error) {
        console.error("[live] listener failed", error);
      }
    }
  },
  size(): number {
    return listeners().size;
  },
};
