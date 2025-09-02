/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const params = await context.params;
    const restaurantId = params.id; // dynamic id from URL
    const body = await req.json(); // Expecting array of menu items

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { message: "Body must be an array of menu items" },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of body) {
      if (!item.name || typeof item.price !== "number") {
        return NextResponse.json(
          { message: "Each menu item must have a name and numeric price" },
          { status: 400 }
        );
      }
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }

    // Replace or append menu
    restaurant.menu = body;
    await restaurant.save();

    return NextResponse.json({ message: "Menu updated successfully", menu: restaurant.menu }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating menu:", error.message);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const params = await context.params;
    const restaurantId = params.id;

    const restaurant = await Restaurant.findById(restaurantId).select("menu");
    if (!restaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json({ menu: restaurant.menu }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching menu:", error.message);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}