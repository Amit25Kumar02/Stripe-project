/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/helpdesk/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("📩 HelpDesk Webhook received:", data);

    // Process the webhook as needed, e.g., store in DB, notify agents, etc.

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Error processing webhook:", error.message);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
