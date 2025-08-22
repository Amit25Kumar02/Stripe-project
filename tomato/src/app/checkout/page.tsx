/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormProps {
  amount: number;
}

const CheckoutFormComponent: React.FC<CheckoutFormProps> = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [cardHolderName, setCardHolderName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Redirect after success
  useEffect(() => {
    if (paymentSuccess) {
      const timer = setTimeout(() => router.push("/"), 2000); // 2 sec delay to show success message
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setPaymentError(null);

    try {
      const { data } = await axios.post("/api/payments/intent", { amount });
      const clientSecret = data.clientSecret;
      if (!clientSecret) throw new Error("No client secret returned");

      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) throw new Error("Card number element not found");

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: { name: cardHolderName },
        },
      });

      if (error) setPaymentError(error.message || "Payment failed");
      else if (paymentIntent && paymentIntent.status === "succeeded") setPaymentSuccess(true);
    } catch (err: any) {
      setPaymentError(err.message || "Payment error occurred");
    } finally {
      setProcessing(false);
    }
  };

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: { fontSize: "16px", color: "#32325d", fontFamily: "Arial, sans-serif", "::placeholder": { color: "#a0aec0" } },
      invalid: { color: "#fa755a" },
    },
  };

  if (amount <= 0) {
    return <p className="text-center text-red-600 font-bold mt-10">No amount specified. Please select a menu item first.</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 md:p-12"
    >
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Secure Payment</h2>
      <p className="text-center text-gray-600 mb-4">
        You&apos;re about to pay <span className="font-semibold text-blue-600">${amount.toFixed(2)}</span>
      </p>

      <input
        type="text"
        placeholder="Card Holder Name"
        value={cardHolderName}
        onChange={(e) => setCardHolderName(e.target.value)}
        className="w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        required
      />

      <div className="p-4 border rounded-xl mb-4 bg-gray-50">
        <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-xl bg-gray-50">
          <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <div className="p-4 border rounded-xl bg-gray-50">
          <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {paymentError && <p className="text-red-600 font-medium text-center">{paymentError}</p>}
      {paymentSuccess && <p className="text-green-600 font-medium text-center">Payment successful! Redirecting... 🎉</p>}

      <button
        type="submit"
        disabled={processing || paymentSuccess}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition duration-300 ease-in-out disabled:opacity-50"
      >
        {processing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const amount = Number(searchParams.get("amount")) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
      <Elements stripe={stripePromise}>
        <CheckoutFormComponent amount={amount} />
      </Elements>
    </div>
  );
}
