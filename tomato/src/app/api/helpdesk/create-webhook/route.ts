/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { webhookUrl, events } = await req.json();

    if (!webhookUrl || !events) {
      return NextResponse.json(
        { error: "Missing webhookUrl or events" },
        { status: 400 }
      );
    }

    const HELP_DESK_API_KEY = process.env.HELP_DESK_API_KEY;

    const response = await axios.post(
      "https://api.helpdesk.com/v1/webhooks", // confirm exact endpoint in docs
      {
        url: webhookUrl,
        events,
        active: true,
      },
      {
        headers: {
          Authorization: `Bearer ${HELP_DESK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error("❌ Failed to create webhook:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to create webhook" },
      { status: 500 }
    );
  }
}
