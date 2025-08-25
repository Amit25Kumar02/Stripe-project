"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    // Update screen size
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize(); // set on mount
    window.addEventListener("resize", handleResize);

    // Stop confetti after 7s
    const timer = setTimeout(() => setShowConfetti(false), 7000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-100 to-green-50 px-4 relative overflow-hidden">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={1550}
          recycle={false}
        />
      )}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full relative z-10"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center mb-4"
        >
          <CheckCircle2 className="w-20 h-20 text-green-500" />
        </motion.div>

        {/* Heading with 🎉 pop */}
        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-3xl font-extrabold text-green-600 mb-3 flex items-center justify-center gap-2"
        >
          Payment Successful
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1] }}
            transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
          >
            🎉
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-gray-700 mb-6"
        >
          Thank you for subscribing! <br />
          Your{" "}
          <span className="font-semibold text-green-600">Premium Plan</span> is
          now active.
        </motion.p>

        {/* Card-like info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left"
        >
          <h2 className="font-semibold text-gray-900 mb-2">
            Subscription Details
          </h2>
          <ul className="text-gray-700 text-sm space-y-2">
            <li>✅ Premium Plan Activated</li>
            <li>✅ Unlimited Access</li>
            <li>✅ Priority Support</li>
            <li>
              ✅ Next Billing:{" "}
              <span className="font-semibold">1 Month</span>
            </li>
          </ul>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <Link
            href="/"
            className="inline-block w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:bg-green-700 transition transform hover:scale-105"
          >
            Go to Dashboard
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
