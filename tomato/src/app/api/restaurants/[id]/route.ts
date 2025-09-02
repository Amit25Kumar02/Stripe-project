/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import connect from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connect();

    // Await the params promise first
    const params = await context.params;
    const id = params.id;

    // Now 'id' is available
    
    // First try ObjectId
    let restaurant = null;
    try {
      restaurant = await Restaurant.findById(id);
    } catch {
      // ignore invalid ObjectId
    }

    // If not found, try string _id
    if (!restaurant) {
      restaurant = await Restaurant.findOne({ _id: id });
    }

    if (!restaurant) {
      return NextResponse.json(
        { message: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurant, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching restaurant:", error.message);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}