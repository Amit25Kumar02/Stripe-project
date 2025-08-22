/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextResponse } from 'next/server';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  address: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
}

// Mock data for restaurants in Hisar, Haryana
const mockRestaurants: Restaurant[] = [
  {
    id: 'res1',
    name: 'Sky Garden Hisar',
    cuisine: 'Multi-Cuisine',
    rating: 4.6,
    priceRange: '7 $',
    address: 'Urban Estate II, Hisar, Haryana',
    imageUrl: 'https://content.jdmagicbox.com/comp/araria/k9/9999p6453.6453.231006124118.t1k9/catalogue/the-sky-garden-restaurant-phed-colony-araria-restaurants-BLsY9iz1xR.jpg',
    latitude: 29.1492 + (Math.random() - 0.5) * 0.01,
    longitude: 75.7217 + (Math.random() - 0.5) * 0.01,
  },
  {
    id: 'res2',
    name: 'The Food Garage',
    cuisine: 'Fast Food',
    rating: 4.3,
    priceRange: '3 $',
    address: 'Model Town, Hisar, Haryana',
    imageUrl: 'https://b.zmtcdn.com/data/pictures/5/20131345/0317bdcdab96b703a2371513b78241ae.jpg?fit=around|750:500&crop=750:500;*,*',
    latitude: 29.1492 + (Math.random() - 0.5) * 0.01,
    longitude: 75.7217 + (Math.random() - 0.5) * 0.01,
  },
  {
    id: 'res3',
    name: 'Delhi Darbar Hisar',
    cuisine: 'North Indian',
    rating: 4.4,
    priceRange: '6 $',
    address: 'Near Town Park, Hisar, Haryana',
    imageUrl: 'https://c8.alamy.com/comp/CEADA4/the-delhi-darbar-restaurant-in-panjim-CEADA4.jpg',
    latitude: 29.1492 + (Math.random() - 0.5) * 0.01,
    longitude: 75.7217 + (Math.random() - 0.5) * 0.01,
  },
  {
    id: 'res4',
    name: 'Subway Hisar',
    cuisine: 'Fast Food',
    rating: 4.2,
    priceRange: '4 $',
    address: 'Aggarsain Chowk, Hisar, Haryana',
    imageUrl: 'https://b.zmtcdn.com/data/pictures/chains/9/18977619/52ef8e37e275c047f58fb7484e16a6f2_featured_v2.jpg',
    latitude: 29.1492 + (Math.random() - 0.5) * 0.01,
    longitude: 75.7217 + (Math.random() - 0.5) * 0.01,
  },
  {
    id: 'res5',
    name: 'Barbeque Nation Hisar',
    cuisine: 'BBQ',
    rating: 4.7,
    priceRange: '7 $',
    address: 'Urban Estate I, Hisar, Haryana',
    imageUrl: 'https://dt4l9bx31tioh.cloudfront.net/eazymedia/restaurant/682165/restaurant020250530054114.jpeg?width=750&height=436&mode=crop',
    latitude: 29.1492 + (Math.random() - 0.5) * 0.01,
    longitude: 75.7217 + (Math.random() - 0.5) * 0.01,
  },
  {
    id: 'res6',
    name: 'Golden Woods',
    cuisine: 'Healthy',
    rating: 4.5,
    priceRange: '5 $',
    address: 'Sec-13, Hisar, Haryana',
    imageUrl: 'https://img3.restaurantguru.com/c5c3-Golden-Woods-Hisar-photo.jpg',
    latitude: 29.1355 + (Math.random() - 0.5) * 0.01,
    longitude: 75.7380 + (Math.random() - 0.5) * 0.01,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const q = searchParams.get('q')?.toLowerCase() || '';

  // Filter restaurants based on the search query
  const filteredRestaurants = mockRestaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(q) ||
    restaurant.cuisine.toLowerCase().includes(q) ||
    restaurant.address.toLowerCase().includes(q)
  );

  // For now return the mock list (later you can filter by lat/lon)
  return NextResponse.json(q ? filteredRestaurants : mockRestaurants);
}
