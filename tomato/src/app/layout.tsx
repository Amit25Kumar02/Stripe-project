/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"; // Make this a client component

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'leaflet/dist/leaflet.css';
import { useEffect } from "react";
import LiveChatWidget from "./components/LiveChatWidget";


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
 

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <LiveChatWidget />
        {/* LiveChat Widget will automatically appear */}
      </body>
    </html>
  );
}
