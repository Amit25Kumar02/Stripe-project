import { NextResponse } from 'next/server';
import { mockRestaurants } from '@/lib/data';

// Haversine formula to calculate distance between two lat/lon points

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth's radius in km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    
    // Check if the query is a location (e.g., "lat:...,lon:...")
    const locationMatch = q.match(/lat:(-?\d+\.?\d*),lon:(-?\d+\.?\d*)/);

    if (locationMatch) {
        // Parse the latitude and longitude from the query
        const lat = parseFloat(locationMatch[1]);
        const lon = parseFloat(locationMatch[2]);
        
        // Define a search radius in kilometers (e.g., 5 km)
        const searchRadius = 5;

        // Filter restaurants by geographical distance
        const nearbyRestaurants = mockRestaurants.filter(restaurant => {
            const distance = haversineDistance(lat, lon, restaurant.latitude, restaurant.longitude);
            return distance <= searchRadius;
        });
        
        return NextResponse.json(nearbyRestaurants);
    } else if (q) {
        // Handle text-based search (city or address)
        const filteredByText = mockRestaurants.filter(restaurant =>
            restaurant.name.toLowerCase().includes(q) ||
            restaurant.cuisine.toLowerCase().includes(q) ||
            restaurant.address.toLowerCase().includes(q)
        );
        return NextResponse.json(filteredByText);
    }

    // If no query is provided, return all restaurants
    return NextResponse.json(mockRestaurants);
}