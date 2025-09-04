"use client";
import { useEffect } from "react";

export default function LiveChatWidget() {
  useEffect(() => {
    // Dynamically load LiveChat script
    const script = document.createElement("script");
    script.src = "/js/livechat.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null; // This component just injects the script
}
