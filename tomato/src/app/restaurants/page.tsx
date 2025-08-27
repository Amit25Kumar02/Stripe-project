/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, Suspense, lazy } from 'react';
import Image from 'next/image';
import {
  MapPin,
  Star,
  DollarSign,
  Menu as MenuIcon,
  X as CloseIcon,
  Utensils,
  TrendingUp,
  Sparkles,
  ChevronRight,
  HomeIcon,
  LocateFixed,
  Focus,
} from 'lucide-react';
import NextLink from 'next/link';
import axios from 'axios';

// Dynamically import Map component (will only load on client side)
const Map = lazy(() => import('../components/map'));

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
  distance?: number;
}

const categories = [
  { name: 'Home', href: '/', icon: <HomeIcon size={20} /> },
  { name: 'All Restaurants', filter: 'all', icon: <Utensils size={20} /> },
  { name: 'Popular', filter: 'popular', icon: <TrendingUp size={20} /> },
  { name: 'New Arrivals', filter: 'new', icon: <Sparkles size={20} /> },
  { name: 'Fast Food', filter: 'fast food', icon: <ChevronRight size={20} /> },
  { name: 'BBQ', filter: 'bbq', icon: <ChevronRight size={20} /> },
  { name: 'Healthy', filter: 'healthy', icon: <ChevronRight size={20} /> },
  { name: 'North Indian', filter: 'north indian', icon: <ChevronRight size={20} /> },
  { name: 'Multi-Cuisine', filter: 'multi-cuisine', icon: <ChevronRight size={20} /> },
];

const distanceRanges = [5, 10, 15, 20, 25, 30];

function MapWrapper({ restaurants, center, radius, onMapClick, manualSearchMode, setManualSearchMode }: { restaurants: Restaurant[], center: { lat: number, lng: number } | null, radius: number | 'all', onMapClick: (lat: number, lng: number) => void, manualSearchMode: boolean, setManualSearchMode: (mode: boolean) => void }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-xl">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-xl">
        <p className="text-gray-500">Loading map...</p>
      </div>
    }>
      <Map
        restaurants={restaurants}
        center={center}
        radius={radius === 'all' ? 0 : radius}
        onMapClick={onMapClick}
        manualSearchMode={manualSearchMode}
        setManualSearchMode={setManualSearchMode}
      />
    </Suspense>
  );
}

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [mounted, setMounted] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [manualLocationQuery, setManualLocationQuery] = useState('');
  const [searchRadius, setSearchRadius] = useState<number | 'all'>('all');
  const [manualSearchMode, setManualSearchMode] = useState(false);
  const [manualMapLocation, setManualMapLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userLocationClicked, setUserLocationClicked] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchUserLocation = () => {
    setLocationLoading(true);
    setManualSearchMode(false);
    setManualMapLocation(null);
    setManualLocationQuery('');
    setUserLocationClicked(true); // Set this flag
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting user location:', error);
          setLocationLoading(false);
          setError('Failed to get your location. Please enter it manually or use the map.');
        }
      );
    } else {
      setLocationLoading(false);
      setError('Geolocation is not supported by your browser. Please enter your location manually or use the map.');
    }
  };

  const fetchRestaurants = async (lat?: number, lon?: number, textQuery?: string, filter?: string, radius?: number | 'all') => {
    try {
      setLoading(true);
      setError(null);

      const params: { q: string, lat?: number, lon?: number } = { q: textQuery || '' };

      if (lat && lon) {
          params.q = `lat:${lat},lon:${lon}`;
      }
      
      const response = await axios.get<Restaurant[]>('/api/restaurants/nearby', {
        params,
      });

      let filteredData = response.data;
      const centerLocation = userLocation || manualMapLocation;

      if (centerLocation) {
        filteredData = filteredData.map(restaurant => ({
          ...restaurant,
          distance: haversineDistance(centerLocation.latitude, centerLocation.longitude, restaurant.latitude, restaurant.longitude),
        }));

        if (radius !== 'all' && typeof radius === 'number') {
          filteredData = filteredData.filter(restaurant => restaurant.distance! <= radius);
        }
      }

      if (filter && filter !== 'all') {
        if (filter === 'popular') {
          filteredData = filteredData.filter(r => r.rating >= 4.5);
        } else if (filter === 'new') {
          filteredData = filteredData.filter(r => r.id.includes('g-res'));
        } else {
          filteredData = filteredData.filter(r => r.cuisine.toLowerCase().includes(filter));
        }
      }

      if (centerLocation) {
        filteredData.sort((a, b) => a.distance! - b.distance!);
      }

      setRestaurants(filteredData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch restaurants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      if (userLocationClicked && userLocation) {
        fetchRestaurants(userLocation.latitude, userLocation.longitude, undefined, activeFilter, searchRadius);
        setUserLocationClicked(false);
      } else if (manualMapLocation) {
        fetchRestaurants(manualMapLocation.latitude, manualMapLocation.longitude, undefined, activeFilter, searchRadius);
      } else if (manualLocationQuery) {
        fetchRestaurants(undefined, undefined, manualLocationQuery, activeFilter, searchRadius);
      } else {
        fetchRestaurants(undefined, undefined, undefined, activeFilter, searchRadius);
      }
    }
  }, [
    activeFilter, 
    mounted, 
    userLocation, 
    manualMapLocation, 
    searchRadius,
    manualLocationQuery,
    userLocationClicked
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setUserLocation(null);
    setManualMapLocation(null);
    setManualSearchMode(false);
    setActiveFilter('all');
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    setIsSidebarOpen(false);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setManualMapLocation({ latitude: lat, longitude: lng });
    setUserLocation(null);
    setManualLocationQuery('');
    setUserLocationClicked(false); // Reset this flag
  };

  const handleManualMapSearch = () => {
    setManualSearchMode(true);
    setUserLocation(null);
    setManualLocationQuery('');
    setManualMapLocation(null);
    setUserLocationClicked(false); // Reset this flag
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      <button
        className="lg:hidden fixed top-4 left-4 bg-blue-600 text-white p-2 rounded-full shadow-lg z-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-6 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform z-40`}
      >
        <h2 className="text-2xl font-bold justify-center flex items-center mb-6">
          Categories
        </h2>
        <ul className="space-y-2 mb-[90%]">
          {categories.map((cat) => (
            <li key={cat.name}>
              {cat.href ? (
                <NextLink href={cat.href} passHref>
                  <span className="flex items-center w-full px-3 py-2 rounded transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer">
                    <span className="mr-2">{cat.icon}</span>
                    {cat.name}
                  </span>
                </NextLink>
              ) : (
                <button
                  onClick={() => handleFilterClick(cat.filter!)}
                  className={`flex items-center w-full px-3 py-2 rounded transition ${activeFilter === cat.filter
                    ? 'bg-blue-100 text-blue-600 font-semibold'
                    : 'hover:bg-blue-50 hover:text-blue-600'
                    }`}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.name}
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-auto text-center text-sm text-gray-500 border-t pt-4">
          <p>&copy; {new Date().getFullYear()} Tomato</p>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 p-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <h1 className="text-4xl font-extrabold text-gray-900 text-center">
            Nearby Restaurants
          </h1>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <div className="flex w-full max-w-xl gap-3">
              <input
                type="text"
                placeholder="Enter your city or address..."
                value={manualLocationQuery}
                onChange={(e) => setManualLocationQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
                  <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              disabled={!manualLocationQuery.trim()}
            >
              Search
            </button>
              <button
                type="button"
                onClick={fetchUserLocation}
                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                title="Use my current location"
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <LocateFixed size={20} />
                )}
              </button>
            </div>
        
            <button
              type="button"
              onClick={handleManualMapSearch}
              className={`w-full sm:w-auto p-2 rounded-lg transition flex items-center justify-center ${manualSearchMode ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              title="Manually select location on map"
            >
              <Focus size={20} />
            </button>
          </form>

          {(userLocation || manualMapLocation) && (
            <div className="flex justify-center items-center gap-3 mb-4">
              <label htmlFor="distance-radius" className="text-gray-700 font-semibold">
                Search within:
              </label>
              <select
                id="distance-radius"
                value={searchRadius}
                onChange={(e) => setSearchRadius(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">All Distances</option>
                {distanceRanges.map(range => (
                  <option key={range} value={range}>{range} km</option>
                ))}
              </select>
            </div>
          )}

          <div className="text-center text-gray-700 mb-4">
            {manualSearchMode ? (
              <p>Please click on the map to find nearby restaurants. 📍</p>
            ) : userLocation ? (
              <p>📍 **Current Location:** Latitude: {userLocation.latitude.toFixed(4)}, Longitude: {userLocation.longitude.toFixed(4)}</p>
            ) : manualMapLocation ? (
              <p>📍 **Manual Location:** Latitude: {manualMapLocation.latitude.toFixed(4)}, Longitude: {manualMapLocation.longitude.toFixed(4)}</p>
            ) : manualLocationQuery ? (
              <p>Searching for restaurants near: **{manualLocationQuery}**</p>
            ) : (
              <p>Please use your current location, search by address, or click on the map. 🗺️</p>
            )}
          </div>
          <hr />

          {loading && (
            <p className="text-center text-gray-700">Loading restaurants... 🍽️</p>
          )}
          {error && <p className="text-center text-red-600">{error}</p>}

          {!loading && (
            <div className="mb-8 h-96 w-full rounded-xl shadow-lg overflow-hidden border border-gray-200 bg-white">
              <MapWrapper
                restaurants={restaurants}
                center={userLocation || manualMapLocation ? { lat: (userLocation || manualMapLocation)!.latitude, lng: (userLocation || manualMapLocation)!.longitude } : null}
                radius={searchRadius}
                onMapClick={handleMapClick}
                manualSearchMode={manualSearchMode}
                setManualSearchMode={setManualSearchMode}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.length > 0 ? (
              restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
                >
                  <Image
                    src={
                      restaurant.imageUrl ||
                      `https://placehold.co/600x400/CCE3F5/36454F?text=${encodeURIComponent(
                        restaurant.name
                      )}`
                    }
                    alt={restaurant.name}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = `https://placehold.co/600x400/CCE3F5/36454F?text=${encodeURIComponent(
                        restaurant.name
                      )}`;
                    }}
                  />
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {restaurant.name}
                    </h2>
                    <p className="text-gray-700 mb-3 flex items-center">
                      <MapPin className="mr-2 text-blue-500" size={18} />
                      {restaurant.address}
                    </p>
                    <div className="flex items-center mb-3">
                      <Star className="text-yellow-500 mr-2" size={18} />
                      <span className="text-gray-800 font-semibold">
                        {restaurant.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 flex items-center mb-4">
                      <DollarSign className="text-green-600 mr-2" size={18} />
                      Price Range:
                      <span className="font-semibold ml-1">
                        {restaurant.priceRange}
                      </span>
                    </p>
                    {restaurant.distance !== undefined && (
                      <p className="text-blue-600 text-sm font-semibold mb-4">
                        Distance: {restaurant.distance.toFixed(2)} km
                      </p>
                    )}
                    <NextLink href={`/restaurants/${restaurant.id}`}>
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300 ease-in-out">
                        View Menu
                      </button>
                    </NextLink>
                  </div>
                </div>
              ))
            ) : (
              !loading && (
                <p className="col-span-full text-center text-gray-500">
                  No restaurants found. Try a different search!
                </p>
              )
            )}
          </div>
        </div>
      </main>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}