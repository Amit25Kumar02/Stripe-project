/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import CheckoutFormComponent from "../components/CheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Define your one-time payment amount (client can see this)
const ONE_TIME_PAYMENT_AMOUNT = 99.99;

export default function CheckoutPage() {
  const [paymentType, setPaymentType] = useState<"one-time" | "subscription">(
    "one-time"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle subscription (no need to pass priceId from client)
  const handleSubscriptionCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post("/api/payments/subscription");
      if (!data.url) throw new Error("Failed to get Stripe session URL.");
      window.location.href = data.url; // redirect to Stripe
    } catch (err: any) {
      console.error("Error during subscription process:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Complete Your Order
        </h1>

        {/* Payment Type Selection */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setPaymentType("one-time")}
            className={`px-5 py-2 rounded-lg font-semibold transition ${
              paymentType === "one-time"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            One-Time Payment
          </button>
          <button
            onClick={() => setPaymentType("subscription")}
            className={`px-5 py-2 rounded-lg font-semibold transition ${
              paymentType === "subscription"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Subscription
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {/* Conditional Payment Flow */}
        {paymentType === "one-time" ? (
          <>
            <p className="text-lg text-gray-700 mb-2 text-center">
              Total Amount:{" "}
              <span className="font-bold text-blue-600">
                ${ONE_TIME_PAYMENT_AMOUNT.toFixed(2)}
              </span>
            </p>
            <Elements stripe={stripePromise}>
              <CheckoutFormComponent amount={ONE_TIME_PAYMENT_AMOUNT} />
            </Elements>
          </>
        ) : (
          <>
            <p className="text-lg text-gray-700 mb-8 text-center">
              Access all premium features for just{" "}
              <span className="font-bold text-blue-600">$9.99/month</span>.
            </p>
            <button
              onClick={handleSubscriptionCheckout}
              disabled={loading}
              className={`w-full px-6 py-3 rounded-lg text-white font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Redirecting to Stripe..." : "Subscribe Now"}
            </button>
          </>
        )}

        <div className="mt-8 text-sm text-gray-500 text-center">
          Your payment is securely processed by Stripe.
        </div>
      </div>
    </div>
  );
}
