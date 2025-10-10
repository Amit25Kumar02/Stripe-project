/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/order";
import { verifyToken } from "@/lib/authMiddleware"; 

// ----------------- POST: Create new order -----------------
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // ✅ Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    const userId = verifyToken(authHeader ?? undefined); 

    const body = await req.json();
    const { date, items, amount, orderStatus, restaurantId } = body;
    console.log("Incoming order payload:", body);

    // Validate required fields
    if (!date || !items || !amount || !restaurantId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
   if (!restaurantId) {
      return NextResponse.json({ success: false, error: "restaurantId is required" }, { status: 400 });
    }
    // Validate each item
    for (const item of items) {
      if (!item.id || !item.name || item.price === undefined || item.quantity === undefined) {
        return NextResponse.json(
          { success: false, error: "Invalid item structure" },
          { status: 400 }
        );
      }
    }

    // Create and save order
    const newOrder = new Order({
      userId,
      date,
      items,
      amount,
      restaurantId,
      orderStatus: orderStatus || "ordered",
    });

    const savedOrder = await newOrder.save();

    return NextResponse.json({
      success: true,
      order: savedOrder,
      message: "Order created successfully",
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, errorType: err.name },
      { status: 500 }
    );
  }
}

// ----------------- GET: Fetch orders for logged-in user -----------------
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // ✅ Extract userId from JWT
    const authHeader = req.headers.get("authorization");
    const userId = verifyToken(authHeader ?? undefined);

    // Fetch orders only for this user
    const orders = await Order.find({ userId }).sort({ date: -1 });

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, errorType: err.name },
      { status: 500 }
    );
  }
}

// ----------------- PATCH: Update order status -----------------
export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { orderId, orderStatus } = body;

    if (!orderId || !orderStatus) {
      return NextResponse.json(
        { success: false, error: "orderId and orderStatus are required" },
        { status: 400 }
      );
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true } // return updated document
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, order: updatedOrder, message: "Order status updated successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, errorType: err.name },
      { status: 500 }
    );
  }
}
