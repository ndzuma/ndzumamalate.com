import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("X-Ndz-Signature");
    const event = request.headers.get("X-Ndz-Event");
    
    // Check if secret is configured
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json(
          { error: "Missing X-Ndz-Signature header" },
          { status: 401 }
        );
      }

      // Compute HMAC SHA256 signature
      const hmac = crypto.createHmac("sha256", webhookSecret);
      hmac.update(rawBody);
      const computedSignature = `sha256=${hmac.digest("hex")}`;

      // Secure comparison to prevent timing attacks
      const signatureBuffer = Buffer.from(signature);
      const computedBuffer = Buffer.from(computedSignature);

      if (signatureBuffer.length !== computedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, computedBuffer)) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    if (event === "content.update") {
      // Revalidate all pages globally
      revalidatePath("/", "layout");
      return NextResponse.json({ revalidated: true, message: "Global content revalidated" });
    }

    return NextResponse.json({ message: "Event ignored" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
