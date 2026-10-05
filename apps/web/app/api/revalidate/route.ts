import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { invalidateAll, cacheVersion } from "../../../lib/cache";
import { warmContentCache } from "../../../lib/api";
import { liveBus, type LiveEvent } from "../../../lib/live-bus";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * Accepts any of: the Go dispatcher's HMAC signature (X-Ndz-Signature),
 * a bearer token, or ?secret= for manual triggering.
 */
function isAuthorized(request: NextRequest, rawBody: string): boolean {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) return true;

  const signature = request.headers.get("x-ndz-signature");
  if (signature) {
    const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
    if (safeEqual(signature, expected)) return true;
  }

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ") && safeEqual(auth.slice(7), secret)) return true;

  const urlSecret = request.nextUrl.searchParams.get("secret");
  if (urlSecret && safeEqual(urlSecret, secret)) return true;

  return false;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!isAuthorized(request, rawBody)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let event: LiveEvent = { type: "content.update" };
  if (rawBody) {
    try {
      event = { ...event, ...JSON.parse(rawBody) };
    } catch {
      // A body we can't parse is fine — we invalidate everything anyway.
    }
  }

  try {
    const invalidated = invalidateAll();
    await warmContentCache();
    // Only notify browsers once the cache is warm so their refresh is instant.
    liveBus.emit({
      type: event.type,
      resource: event.resource,
      action: event.action,
      resource_id: event.resource_id,
      version: event.version,
      occurred_at: event.occurred_at ?? new Date().toISOString(),
    });

    return NextResponse.json({
      revalidated: true,
      invalidated,
      version: cacheVersion(),
      listeners: liveBus.size(),
      now: Date.now(),
    });
  } catch (error) {
    console.error("[revalidate] failed", error);
    return NextResponse.json({ error: "Error revalidating" }, { status: 500 });
  }
}
