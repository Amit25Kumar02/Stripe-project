/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextResponse } from 'next/server';

export async function GET(request: Request) {

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
