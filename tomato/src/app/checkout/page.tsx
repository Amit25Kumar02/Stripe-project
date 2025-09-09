/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, Suspense } from "react";
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
import { ArrowLeft } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormProps {
  amount: number;
}

const subscriptionPlans = {
  basic: {
    name: "Basic Plan",
    price: 9.99,
    features: ["Access to all meals", "Monthly newsletter", "Priority support"],
  },
  premium: {
    name: "Premium Plan",
    price: 19.99,
    features: ["Everything in Basic", "Exclusive discounts", "Free delivery"],
  },
};

const CheckoutFormComponent: React.FC<CheckoutFormProps> = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [cardHolderName, setCardHolderName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isSubscription, setIsSubscription] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof subscriptionPlans>("basic");

  // ✅ Redirect if no token found
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // ✅ Save order to DB after successful payment
  const handlePaymentSuccess = async () => {
    try {
      const decodedItems = searchParams.get("items");
      if (!decodedItems) throw new Error("No cart items found.");

      const parsedItems = JSON.parse(decodeURIComponent(decodedItems));

      // ✅ get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      // ✅ sanitize items
      const validatedItems = parsedItems.map(
        (
          item: {
            id?: string;
            name?: string;
            price?: number | string;
            quantity?: number | string;
          },
          index: number
        ) => ({
          id: item.id || `item-${Date.now()}-${index}`,
          name: item.name || "Unknown Item",
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
        })
      );

      // ✅ orderData (no userId here, backend extracts from token)
      const orderData = {
        date: new Date().toISOString(),
        items: validatedItems,
        amount: parseFloat(amount.toFixed(2)),
        orderStatus: "ordered",
      };

      const response = await axios.post("/api/orders", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        router.push("/order-history");
      } else {
        throw new Error(response.data.error || "Failed to save order");
      }
    } catch (e: any) {
      setPaymentError(
        `Order could not be saved: ${e.response?.data?.error || e.message}`
      );
    }
  };

  // ✅ trigger save order when paymentSuccess flips true
  useEffect(() => {
    if (paymentSuccess) {
      handlePaymentSuccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentSuccess]);

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

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardNumberElement,
            billing_details: { name: cardHolderName },
          },
        }
      );

      if (error) setPaymentError(error.message || "Payment failed");
      else if (paymentIntent && paymentIntent.status === "succeeded") {
        setPaymentSuccess(true);
      }
    } catch (err: any) {
      setPaymentError(err.message || "Payment error occurred");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubscription = async () => {
    try {
      const { data } = await axios.post("/api/payments/subscription", {
        plan: selectedPlan,
      });
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      setPaymentError(err.message || "Subscription failed");
    }
  };

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        fontSize: "16px",
        color: "#32325d",
        fontFamily: "Arial, sans-serif",
        "::placeholder": { color: "#a0aec0" },
      },
      invalid: { color: "#fa755a" },
    },
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center cursor-pointer text-blue-600 hover:text-blue-800 transition-colors mb-4"
      >
        <ArrowLeft size={24} className="mr-2" />
        <span className="text-lg font-semibold">Back to menu</span>
      </button>

      <h2 className="text-3xl font-extrabold text-gray-900 text-center">
        Secure Checkout
      </h2>

      <div className="flex justify-center items-center gap-4 mb-6">
        <span
          className={`font-medium ${!isSubscription ? "text-blue-600" : "text-gray-500"
            }`}
        >
          One-time
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isSubscription}
            onChange={() => setIsSubscription(!isSubscription)}
          />
          <div className="w-16 h-8 bg-gray-300 rounded-full peer-focus:ring-2 peer-focus:ring-blue-400 peer-checked:bg-green-500 transition-all duration-300"></div>
          <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 peer-checked:translate-x-8"></div>
        </label>
        <span
          className={`font-medium ${isSubscription ? "text-green-600" : "text-gray-500"
            }`}
        >
          Subscription
        </span>
      </div>

      {!isSubscription ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-center text-gray-600 mb-4">
            You&apos;re about to pay{" "}
            <span className="font-semibold text-blue-600">
              ${amount.toFixed(2)}
            </span>
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
          {paymentError && (
            <p className="text-red-600 font-medium text-center">
              {paymentError}
            </p>
          )}
          {paymentSuccess && (
            <p className="text-green-600 font-medium text-center">
              Payment successful! Redirecting... 🎉
            </p>
          )}
          <button
            type="submit"
            disabled={processing || paymentSuccess}
            className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition duration-300 ease-in-out disabled:opacity-50"
          >
            {processing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="border rounded-2xl p-6 shadow-lg bg-green-50">
            <h3 className="text-xl font-bold text-green-800 mb-2">
              {subscriptionPlans[selectedPlan].name}
            </h3>
            <p className="text-lg font-semibold text-green-700 mb-2">
              ${subscriptionPlans[selectedPlan].price}/month
            </p>
            <ul className="list-disc list-inside space-y-1 text-green-700">
              {subscriptionPlans[selectedPlan].features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between items-center">
            {Object.keys(subscriptionPlans).map((planKey) => (
              <button
                key={planKey}
                onClick={() =>
                  setSelectedPlan(planKey as keyof typeof subscriptionPlans)
                }
                className={`px-4 py-2 cursor-pointer rounded-lg font-semibold shadow-md transition-all ${selectedPlan === planKey
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                {subscriptionPlans[planKey as keyof typeof subscriptionPlans].name}
              </button>
            ))}
          </div>

          {paymentError && (
            <p className="text-red-600 font-medium text-center">{paymentError}</p>
          )}

          <button
            onClick={handleSubscription}
            className="w-full mt-4 cursor-pointer bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg transition duration-300 ease-in-out"
          >
            Subscribe
          </button>
        </div>
      )}
    </div>
  );
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const amount = Number(searchParams.get("amount")) || 0;

  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormComponent amount={amount} />
    </Elements>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="text-center">Loading checkout...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
