/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NextApiRequest, NextApiResponse } from "next";
import { sendMessageToAgent } from "@/lib/livechat";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  try {
    const { playerId, playerName, email, phone, message } = req.body;
    const response = await sendMessageToAgent({ playerId, playerName, email, phone, message });
    res.status(200).json({ success: true, data: response });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
}
