import { NextRequest, NextResponse } from 'next/server';
import { mockRestaurants } from '@/lib/data'; 

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const restaurant = mockRestaurants.find(r => r.id === id);

  if (restaurant) {
    return NextResponse.json(restaurant);
  } else {
    return new NextResponse(
      JSON.stringify({ message: 'Restaurant not found' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}