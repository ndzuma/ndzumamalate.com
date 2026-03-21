import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    // 1. Validate signature if a secret is provided
    const secret = process.env.WEBHOOK_SECRET;
    if (secret) {
      // In a real production setup, you would validate the X-Ndz-Signature here
      // using crypto.createHmac. For simplicity/compatibility, if the secret is passed in 
      // the URL or headers, we can just do a basic check.
      const authHeader = request.headers.get("Authorization") || request.headers.get("X-Ndz-Signature");
      const urlSecret = request.nextUrl.searchParams.get("secret");
      
      // Let's allow passing the secret as a query param for easiest setup with the Go dispatcher
      if (urlSecret !== secret && !authHeader?.includes(secret)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // 2. Clear the 'cms' tag cache
    revalidateTag("cms");

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ error: "Error revalidating" }, { status: 500 });
  }
}
