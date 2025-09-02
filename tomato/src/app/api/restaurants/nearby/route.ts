
import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";

// Haversine formula to calculate distance in km
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  await connect();

  // Fetch all restaurants (we will filter in JS if needed)
  let restaurants = await Restaurant.find({});

  // Text search
  if (q) {
    const lowerQ = q.toLowerCase();
    restaurants = restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(lowerQ) ||
        r.cuisine.toLowerCase().includes(lowerQ) ||
        r.address.toLowerCase().includes(lowerQ)
    );
  }

  // Nearby search
  if (lat && lon) {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const searchRadius = 5; // 5 km

    restaurants = restaurants.filter((r) => {
      const distance = haversineDistance(latNum, lonNum, r.latitude, r.longitude);
      return distance <= searchRadius;
    });
  }

  return NextResponse.json(restaurants);
};

export async function POST(req: NextRequest) {
  const data = await req.json();
  await connect();
  const restaurant = new Restaurant(data);
  await restaurant.save();
  return NextResponse.json(restaurant);
}
