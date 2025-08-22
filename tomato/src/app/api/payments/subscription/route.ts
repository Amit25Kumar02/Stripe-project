/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    console.log("Creating subscription checkout with Price ID:", process.env.STRIPE_PRICE_ID);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!, // ✅ safe here
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Error creating Stripe checkout session:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
