/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/order";

export async function POST(req: NextRequest) {
  try {
    console.log("Connecting to MongoDB...");
    await dbConnect();
    console.log("MongoDB connected successfully");
    
    const body = await req.json();
    console.log("Received order data:", JSON.stringify(body, null, 2));

    const { id, date, items, amount, orderStatus } = body;

    if (!id || !date || !items || !amount || !orderStatus) {
      console.error("Missing required fields:", { 
        hasId: !!id, 
        hasDate: !!date, 
        hasItems: !!items && items.length > 0, 
        hasAmount: !!amount,
        hasOrderStatus: !!orderStatus
      });
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // CORRECTED VALIDATION: Remove !item.orderStatus check
    for (const item of items) {
      if (!item.id || !item.name || item.price === undefined || item.quantity === undefined) {
        console.error("Invalid item structure:", item);
        return NextResponse.json(
          { success: false, error: "Invalid item structure" },
          { status: 400 }
        );
      }
    }

    console.log("Creating new order document...");
    const newOrder = new Order({ 
      id, 
      date, 
      items, 
      amount, 
      orderStatus: orderStatus || "ordered" 
    });

    console.log("Saving order to database...");
    const savedOrder = await newOrder.save();
    console.log("Order saved successfully:", savedOrder._id);

    return NextResponse.json({ 
      success: true, 
      order: savedOrder,
      message: "Order created successfully" 
    }, { status: 201 });

  } catch (err: any) {
    console.error("=== ERROR DETAILS ===");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    
    if (err.name === 'ValidationError') {
      console.error("Validation errors:", err.errors);
    }
    if (err.name === 'MongoServerError') {
      console.error("MongoDB error code:", err.code);
    }

    return NextResponse.json(
      { 
        success: false, 
        error: err.message,
        errorType: err.name,
        ...(err.errors && { validationErrors: err.errors })
      }, 
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const orders = await Order.find().sort({ date: -1 });
    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching orders:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ✅ PATCH update order status
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
      { new: true } // return updated doc
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