/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // In a real application, this would fetch aggregation data from your DB,
  // e.g., average rating, most popular cuisine, total restaurants.
  const stats = {
    totalRestaurants: 150,
    averageRating: 4.3,
    mostPopularCuisine: 'Italian',
    restaurantsByCuisine: {
      Italian: 30,
      Chinese: 25,
      American: 40,
      Japanese: 20,
      Mexican: 35,
    },
  };
  return NextResponse.json(stats);
}
