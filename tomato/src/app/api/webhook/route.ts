/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  console.log("🔔 Webhook endpoint hit");
  
  try {
    const data = await req.json();
    console.log("📩 Webhook received:", JSON.stringify(data, null, 2));

    // Validate LiveChat token exists
    if (!process.env.LIVECHAT_TOKEN) {
      console.error("❌ Missing LIVECHAT_TOKEN environment variable");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    console.log("🔑 Token is present, fetching active chats...");

    // 🔎 STEP 1: Fetch active chats
    const chatsRes = await axios.post(
      "https://api.livechatinc.com/v3.4/agent/action/list_chats",
      { 
        limit: 5,
        filters: {
          open: true
        }
      },
      {
        headers: {
          Authorization: `Basic ${process.env.LIVECHAT_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log("✅ LiveChat list_chats response:", JSON.stringify(chatsRes.data, null, 2));

    if (!chatsRes.data.chats || chatsRes.data.chats.length === 0) {
      console.log("⚠️ No active chats found");
      return NextResponse.json(
        { message: "Webhook received but no active chats" },
        { status: 200 }
      );
    }

    const chatId = chatsRes.data.chats[0].id;
    console.log("💬 Using chat_id:", chatId);

    // 🔎 STEP 2: Send webhook data as a message
    console.log("📤 Attempting to send message to LiveChat...");
    const sendRes = await axios.post(
      "https://api.livechatinc.com/v3.4/agent/action/send_event",
      {
        chat_id: chatId,
        event: {
          type: "message",
          text: `💰 Payment Successful!\nTransaction ID: ${data.data.transactionId}\nAmount: ${data.data.amount} ${data.data.currency}`,
        },
      },
      {
        headers: {
          Authorization: `Basic ${process.env.LIVECHAT_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log("✅ Message sent successfully:", JSON.stringify(sendRes.data, null, 2));
    return NextResponse.json({ success: true, forwarded: data });
    
  } catch (error: any) {
    console.error("❌ Error in webhook processing:");
    console.error("Full error:", error);
    
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error("No response received:", error.message);
    } else {
      console.error("Error:", error.message);
    }
    
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}