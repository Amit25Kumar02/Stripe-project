/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import axios from "axios";

const LIVECHAT_API = "https://api.livechatinc.com/v3.6/agent/action";

// ⚡ Use Base64 Encoded Token (from LiveChat dashboard screenshot)
const LIVECHAT_TOKEN = process.env.LIVECHAT_TOKEN; 

// ✅ Correct headers for PAT (Basic Auth)
const headers = {
  Authorization: `Basic ${LIVECHAT_TOKEN}`,
  "Content-Type": "application/json",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 Webhook received:", body);

    // 🟢 STEP 1: Validate webhook type
    if (body.type !== "payment_success") {
      return NextResponse.json({ message: "Ignored, not a payment webhook" });
    }

    const { transactionId, amount, currency } = body.data;

    // 🟢 STEP 2: Fetch active chats from LiveChat
    const chatsRes = await axios.post(
      `${LIVECHAT_API}/list_chats`,
      { limit: 100, status: "active" },
      { headers }
    );

    const chats = chatsRes.data.chats || [];
    console.log("📂 LiveChat chats fetched:", chats.length);

    // 🟢 STEP 3: Try to find the chat for this user
    const targetChat = chats.find((c: any) =>
      c.users.some(
        (u: any) =>
          u.type === "customer" &&
          (u.email === body.data.email || u.session_fields?.some((f: any) => f.default_Phone === body.data.phone))
      )
    );

    if (!targetChat) {
      console.error("❌ No matching chat found for webhook user");
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const chatId = targetChat.id;
    const threadId = targetChat.last_thread_summary?.id;
    console.log(`✅ Found chat ${chatId} for user`);

    if (!threadId) {
      console.error("❌ No thread found in the chat");
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }
    // 🟢 STEP 4: Send confirmation message into the chat
    await axios.post(
      `${LIVECHAT_API}/send_event`,
      {
        chat_id: chatId,
        thread_id: threadId,
        event: {
          type: "message",
          text: `✅ Payment of ${amount / 100} ${currency.toUpperCase()} received successfully! (Txn ID: ${transactionId})`,
        },
      },
      { headers }
    );

    // 🟢 STEP 5: Update chat properties with payment details
    await axios.post(
      `${LIVECHAT_API}/update_chat_properties`,
      {
        chat_id: chatId,
        properties: {
          payment: {
            transactionId,
            amount,
            currency,
            status: "success",
          },
        },
      },
      { headers }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Error in webhook processing:", err.response?.data || err);
    return NextResponse.json(
      { error: "Webhook processing failed", details: err.response?.data || err },
      { status: 500 }
    );
  }
}
