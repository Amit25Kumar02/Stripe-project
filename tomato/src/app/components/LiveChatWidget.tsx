/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

export default function LiveChatWidget() {
  useEffect(() => {
    // Load Tawk.to script dynamically
    const loadTawk = () => {
      if (!document.getElementById("tawk-init")) {
        const script = document.createElement("script");
        script.id = "tawk-init";
        script.async = true;
        script.src = "https://embed.tawk.to/68ff4fee84f18f194f214866/1j8il0f3n";
        script.charset = "UTF-8";
        script.setAttribute("crossorigin", "*");

        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        const s0 = document.getElementsByTagName("script")[0];
        s0.parentNode?.insertBefore(script, s0);
      }
    };

    // Set user data in Tawk.to after initialization
    const setUserData = () => {
      try {
        const userString = localStorage.getItem("user");
        if (!userString) return;

        const user = JSON.parse(userString);
        console.log(" Tawk.to setting user:", user);

        if (window.Tawk_API) {
          window.Tawk_API.setAttributes(
            {
              name: user.name,
              email: user.email,
              phone: user.phone,
            },
            function (error: any) {
              if (error) console.error("Error setting Tawk.to user:", error);
            }
          );
        }
      } catch (err) {
        console.error("Error parsing user:", err);
      }
    };

    // Initialize if user logged in
    const initIfLoggedIn = () => {
      const userString = localStorage.getItem("user");
      if (userString) {
        loadTawk();
        const interval = setInterval(() => {
          if (window.Tawk_API && typeof window.Tawk_API.setAttributes === "function") {
            setUserData();
            clearInterval(interval);
          }
        }, 1000);
      }
    };

    // Run on mount
    initIfLoggedIn();

    // Listen for login/logout events (localStorage changes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        if (e.newValue) {
          // User logged in → load Tawk.to
          initIfLoggedIn();
        } else {
          // User logged out → remove widget
          const script = document.getElementById("tawk-init");
          if (script) script.remove();
          const tawkDiv = document.getElementById("tawkchat-container");
          if (tawkDiv) tawkDiv.remove();
          delete window.Tawk_API;
          console.log("User logged out → Tawk.to removed");
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
