/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

interface RequestBody {
  plan?: "basic" | "premium"; // plan selected by user
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const plan = body.plan || "basic";

    // Map plan to Stripe Price IDs (set these in .env)
    const priceIdMap: Record<string, string> = {
      basic: process.env.STRIPE_PRICE_ID!,
      premium: process.env.STRIPE_PRICE_ID_PREMIUM!,
    };

    const priceId = priceIdMap[plan];

    if (!priceId) {
      throw new Error(`Price ID not configured for plan: ${plan}`);
    }

    console.log(`Creating subscription checkout for plan: ${plan}, Price ID: ${priceId}`);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
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
