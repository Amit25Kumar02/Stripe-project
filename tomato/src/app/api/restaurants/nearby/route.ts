import { NextResponse } from 'next/server';
import { mockRestaurants } from '@/lib/data';

// Haversine formula
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (lat && lon) {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const searchRadius = 5;

    const nearbyRestaurants = mockRestaurants.filter(r => {
      const distance = haversineDistance(latNum, lonNum, r.latitude, r.longitude);
      return distance <= searchRadius;
    });

    return NextResponse.json(nearbyRestaurants);
  }

  if (q) {
    const filtered = mockRestaurants.filter(r =>
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(q.toLowerCase()) ||
      r.address.toLowerCase().includes(q.toLowerCase())
    );
    return NextResponse.json(filtered);
  }

  return NextResponse.json(mockRestaurants);
}
