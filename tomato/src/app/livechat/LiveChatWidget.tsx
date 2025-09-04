/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from 'react';

// Define the type for the LiveChat window object
declare global {
  interface Window {
    __lc: {
      license: number;
      group: number;
      visitor?: any;
    };
    LiveChatWidget?: any;
  }
}

interface LiveChatWidgetProps {
  license: number;
  group?: number;
  userData: {
    id: string;
    name: string;
    email: string;
    phone: string;
    country: string;
    ip_address: string;
    device: string;
    os: string;
    registration_date: string;
    kyc_status: string;
    account_status: string;
    balance: number;
    currency: string;
    vip_level: string;
    risk_flags: string;
  };
}

const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ license, group, userData }) => {
  useEffect(() => {
    // Check if LiveChat script is already loaded
    if (window.LiveChatWidget) {
      window.LiveChatWidget.call('set_visitor_data', userData);
      return;
    }

    // Set LiveChat configuration
    window.__lc = {
      license: license,
      group: group || 0,
    };

    // Set visitor data
    window.__lc.visitor = {
      ...userData,
      // Map your data keys to LiveChat's expected keys
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      custom_variables: [
        { name: "Country", value: userData.country },
        { name: "IP Address", value: userData.ip_address },
        { name: "Device & OS", value: `${userData.device}, ${userData.os}` },
        { name: "Registration Date", value: userData.registration_date },
        { name: "KYC Status", value: userData.kyc_status },
        { name: "Account Status", value: userData.account_status },
        { name: "Balance", value: `${userData.balance} ${userData.currency}` },
        { name: "VIP Level", value: userData.vip_level },
        { name: "Risk Flags", value: userData.risk_flags },
      ],
    };

    // Dynamically load the LiveChat script
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://cdn.livechatinc.com/tracking.js";
    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    }
  }, [license, group, userData]);

  return null;
};

export default LiveChatWidget;