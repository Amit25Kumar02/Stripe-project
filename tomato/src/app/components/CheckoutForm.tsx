/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // App Router navigation
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
  const router = useRouter(); // Router instance

  const [cardHolderName, setCardHolderName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (paymentSuccess) {
      // Navigate to /home after 2 seconds
      const timer = setTimeout(() => {
        router.push("/");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setPaymentError(null);

    try {
      const { data } = await axios.post("/api/payments/intent", {
        amount: Math.round(amount * 100),
      });

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

      if (error) {
        setPaymentError(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        setPaymentSuccess(true);
      }
    } catch (err: any) {
      setPaymentError(err.message || "Payment error occurred");
    } finally {
      setProcessing(false);
    }
  };

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: 'Arial, sans-serif',
        '::placeholder': { color: '#a0aec0' },
      },
      invalid: { color: '#fa755a' },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Payment Details</h2>

      <input
        type="text"
        placeholder="Card Holder Name"
        value={cardHolderName}
        onChange={(e) => setCardHolderName(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      <div className="p-3 border rounded-lg">
        <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 border rounded-lg">
          <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <div className="p-3 border rounded-lg">
          <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {paymentError && <p className="text-red-600 font-medium">{paymentError}</p>}
      {paymentSuccess && <p className="text-green-600 font-medium">Payment successful! Redirecting... 🎉</p>}

      <button
        type="submit"
        disabled={processing || paymentSuccess}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50"
      >
        {processing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
};

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormComponent amount={199.99} />
    </Elements>
  );
}
