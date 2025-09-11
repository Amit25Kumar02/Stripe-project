/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    LiveChatWidget?: {
      call: (method: string, ...args: any[]) => void;
    };
  }
}

export default function LiveChatWidget() {
  useEffect(() => {
    const loadLiveChat = () => {
      if (!document.getElementById("livechat-init")) {
        const script = document.createElement("script");
        script.id = "livechat-init";
        script.innerHTML = `
          window.__lc = window.__lc || {};
          window.__lc.license = 19290019;
          window.__lc.integration_name = "manual_channels";
          window.__lc.product_name = "livechat";
          (function(n,t,c){
            function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}
            var e={_q:[],_h:null,_v:"2.0",
              on:function(){i(["on",c.call(arguments)])},
              once:function(){i(["once",c.call(arguments)])},
              off:function(){i(["off",c.call(arguments)])},
              get:function(){if(!e._h)throw new Error("[LiveChatWidget] You can't use getters before load.");return i(["get",c.call(arguments)])},
              call:function(){i(["call",c.call(arguments)])},
              init:function(){var n=t.createElement("script");n.async=!0;n.type="text/javascript";n.src="https://cdn.livechatinc.com/tracking.js";t.head.appendChild(n)}
            };
            !n.__lc.asyncInit&&e.init(),n.LiveChatWidget=n.LiveChatWidget||e
          }(window,document,[].slice));
        `;
        document.body.appendChild(script);
      }
    };

    const setUserData = () => {
      try {
        const userString = localStorage.getItem("user");
        if (!userString) return;

        const user = JSON.parse(userString);
        console.log("✅ LiveChat setting user:", user);

        window.LiveChatWidget?.call("set_customer_data", {
          customer: {
            name: user.name,
            email: user.email,
            phone: user.phone,
          },
        });

        window.LiveChatWidget?.call("hide_form", "prechat");
      } catch (err) {
        console.error("❌ Error parsing user:", err);
      }
    };

    const initIfLoggedIn = () => {
      const userString = localStorage.getItem("user");
      if (userString) {
        loadLiveChat();
        const interval = setInterval(() => {
          if (window.LiveChatWidget) {
            setUserData();
            clearInterval(interval);
          }
        }, 1000);
      }
    };

    // Run on mount
    initIfLoggedIn();

    // Listen for login/logout changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        if (e.newValue) {
          // user logged in
          initIfLoggedIn();
        } else {
          // user logged out → remove widget
          const script = document.getElementById("livechat-init");
          if (script) script.remove();
          delete window.LiveChatWidget;
          console.log("🚪 User logged out → LiveChat removed");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return null;
}
