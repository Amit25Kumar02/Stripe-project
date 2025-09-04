/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"; // Make this a client component

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'leaflet/dist/leaflet.css';
import { useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadata: Metadata = {
  title: "Tomato",
  description: "Find the best restaurants, cafes, and food spots in your city. Search nearby dining options, explore menus, and enjoy a seamless food discovery experience.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.innerHTML = `
      window.__lc = window.__lc || {};
      window.__lc.license = 19290019; // your license ID
      window.__lc.integration_name = "manual_onboarding";
      window.__lc.product_name = "livechat";
      (function(n,t,c){
        function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}
        var e={_q:[],_h:null,_v:"2.0",
          on:function(){i(["on",c.call(arguments)])},
          once:function(){i(["once",c.call(arguments)])},
          off:function(){i(["off",c.call(arguments)])},
          get:function(){if(!e._h)throw new Error("[LiveChatWidget] You can't use getters before load."); return i(["get",c.call(arguments)])},
          call:function(){i(["call",c.call(arguments)])},
          init:function(){var n=t.createElement("script");n.async=!0,n.type="text/javascript", n.src="https://cdn.livechatinc.com/tracking.js", t.head.appendChild(n)}
        };
        n.LC_API=n.LC_API||e;
        e.init();
      })(window, document, [].slice);
    `;
    document.body.appendChild(script);
  }, []);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        {/* LiveChat Widget will automatically appear */}
      </body>
    </html>
  );
}
