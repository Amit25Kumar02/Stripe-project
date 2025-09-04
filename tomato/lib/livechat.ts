import axios from "axios";

const LIVECHAT_API_BASE = "https://api.livechat.com/v3.3";

export async function sendMessageToAgent(ticket: {
  playerId: string;
  playerName: string;
  email: string;
  phone: string;
  message: string;
}) {
  try {
    const token = process.env.LIVECHAT_API_TOKEN; // store in .env
    const res = await axios.post(
      `${LIVECHAT_API_BASE}/agent/action/send_message`,
      {
        chat: {
          message: ticket.message,
          metadata: {
            playerId: ticket.playerId,
            playerName: ticket.playerName,
            email: ticket.email,
            phone: ticket.phone,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("LiveChat API error:", error);
    throw error;
  }
}
