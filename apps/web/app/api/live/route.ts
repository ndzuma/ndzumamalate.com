import { liveBus, type LiveEvent } from "../../../lib/live-bus";
import { cacheVersion } from "../../../lib/cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Browser-facing SSE relay. Browsers subscribe here (same origin, no CORS,
 * no API rate limits) and get a `change` event only after the server cache
 * has already been refreshed — so a router.refresh() on the client is
 * guaranteed to see the new content.
 */
export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;
  let keepAlive: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (name: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          // Stream already closed.
        }
      };

      send("connected", { version: cacheVersion(), at: new Date().toISOString() });

      unsubscribe = liveBus.subscribe((event: LiveEvent) => send("change", event));
      keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        } catch {
          // ignore
        }
      }, 25_000);

      request.signal.addEventListener("abort", () => {
        unsubscribe?.();
        if (keepAlive) clearInterval(keepAlive);
        try {
          controller.close();
        } catch {
          // ignore
        }
      });
    },
    cancel() {
      unsubscribe?.();
      if (keepAlive) clearInterval(keepAlive);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
