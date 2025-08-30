/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/order";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const { id, date, items, amount } = body;
    if (!id || !date || !items || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newOrder = new Order({ id, date, items, amount });
    await newOrder.save();

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const orders = await Order.find();
    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
