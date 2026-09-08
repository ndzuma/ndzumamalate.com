/**
 * Server-side sync layer.
 *
 * The Next.js process keeps one long-lived SSE subscription to the Go API's
 * public event stream. Every content event is turned into a call to our own
 * /api/revalidate route (which invalidates + warms the content cache and then
 * notifies connected browsers). This replaces the fragile "configure a webhook
 * URL in the CMS" setup: no external configuration, automatic reconnects, and
 * a catch-up invalidation whenever the stream reconnects.
 */

import type { LiveEvent } from "./live-bus";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const globalKey = "__ndzLiveSyncStarted";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function selfURL(): string {
  const port = process.env.PORT || "3000";
  return process.env.LIVE_SYNC_SELF_URL || `http://127.0.0.1:${port}`;
}

async function pushInvalidation(event: LiveEvent, reason: string): Promise<void> {
  const secret = process.env.WEBHOOK_SECRET || "";
  try {
    const res = await fetch(`${selfURL()}/api/revalidate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(secret ? { authorization: `Bearer ${secret}` } : {}),
      },
      body: JSON.stringify({ ...event, reason }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[live-sync] revalidate responded ${res.status}`);
    }
  } catch (error) {
    console.warn("[live-sync] revalidate call failed", error);
  }
}

function parseSSEBlock(block: string): { event: string; data: string } | null {
  let event = "message";
  const data: string[] = [];
  for (const rawLine of block.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    if (!line || line.startsWith(":")) continue;
    const idx = line.indexOf(":");
    const field = idx === -1 ? line : line.slice(0, idx);
    const value = idx === -1 ? "" : line.slice(idx + 1).replace(/^ /, "");
    if (field === "event") event = value;
    else if (field === "data") data.push(value);
  }
  if (data.length === 0) return null;
  return { event, data: data.join("\n") };
}

async function consumeStream(lastVersion: { value: number | null }): Promise<void> {
  const controller = new AbortController();
  const res = await fetch(`${API_URL}/api/v1/public/events`, {
    headers: { accept: "text/event-stream" },
    cache: "no-store",
    signal: controller.signal,
  });
  if (!res.ok || !res.body) {
    throw new Error(`event stream responded ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sep: number;
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const block = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        const parsed = parseSSEBlock(block);
        if (!parsed) continue;

        let event: LiveEvent;
        try {
          event = JSON.parse(parsed.data);
        } catch {
          continue;
        }

        if (event.type === "stream.connected") {
          const version = typeof event.version === "number" ? event.version : null;
          // First connection after boot, or the version moved while we were
          // disconnected: refresh everything so nothing is missed.
          if (lastVersion.value === null || (version !== null && version !== lastVersion.value)) {
            await pushInvalidation({ ...event, type: "sync.catchup" }, "connected");
          }
          lastVersion.value = version;
          continue;
        }

        if (typeof event.version === "number") lastVersion.value = event.version;
        await pushInvalidation(event, "event");
      }
    }
  } finally {
    controller.abort();
  }
}

async function loop(): Promise<void> {
  const lastVersion = { value: null as number | null };
  let backoff = 1000;
  for (;;) {
    try {
      console.info("[live-sync] connecting to API event stream");
      await consumeStream(lastVersion);
      backoff = 1000;
    } catch (error) {
      console.warn("[live-sync] stream error, reconnecting", error instanceof Error ? error.message : error);
      await sleep(backoff);
      backoff = Math.min(backoff * 2, 30_000);
      continue;
    }
    // Stream ended cleanly (server-side max age) — reconnect right away.
    await sleep(250);
  }
}

export function startLiveSync(): void {
  const g = globalThis as typeof globalThis & { [globalKey]?: boolean };
  if (g[globalKey]) return;
  if (process.env.LIVE_SYNC === "false") return;
  g[globalKey] = true;
  // Give the HTTP server a moment to bind before we start calling ourselves.
  setTimeout(() => {
    loop().catch((error) => console.error("[live-sync] loop crashed", error));
  }, 1500);
}
