// Backwards-compatible alias: webhook endpoints were historically registered
// against /api/webhook/revalidate, which never existed. Keep both paths live.
export { POST } from "../../revalidate/route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
