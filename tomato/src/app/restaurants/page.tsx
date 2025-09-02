/* eslint-disable react-hooks/exhaustive-deps */
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
  Compass,
} from 'lucide-react';
import NextLink from 'next/link';
import axios from 'axios';

// Dynamically import Map component (will only load on client side)
const Map = lazy(() => import('../components/map'));

interface Restaurant {
  _id: string;
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

// New function to calculate bearing/direction
const getDirection = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const toDeg = (x: number) => (x * 180) / Math.PI;

  const lat1Rad = toRad(lat1);
  const lon1Rad = toRad(lon1);
  const lat2Rad = toRad(lat2);
  const lon2Rad = toRad(lon2);

  const dLon = lon2Rad - lon1Rad;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let brng = toDeg(Math.atan2(y, x));
  brng = (brng + 360) % 360;

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(brng / 45) % 8;
  return directions[index];
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
  const [manualLocationClicked, setManualLocationClicked] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchUserLocation = () => {
    setLocationLoading(true);
    setManualSearchMode(false);
    setManualMapLocation(null);
    setManualLocationQuery('');
    setUserLocationClicked(true);
    setManualLocationClicked(true);

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

 const fetchRestaurants = async (
  lat?: number,
  lon?: number,
  textQuery?: string,
  filter?: string,
  radius?: number | 'all'
) => {
  try {
    setLoading(true);
    setError(null);

    const params: Record<string, any> = {};

    if (lat && lon) {
      params.lat = lat;
      params.lon = lon;
    } else if (textQuery) {
      params.q = textQuery;
    }

    const response = await axios.get<Restaurant[]>("/api/restaurants/nearby", { params });

    let filteredData = response.data;
    const centerLocation = userLocation || manualMapLocation;

    if (centerLocation) {
      filteredData = filteredData.map((restaurant) => ({
        ...restaurant,
        distance: haversineDistance(
          centerLocation.latitude,
          centerLocation.longitude,
          restaurant.latitude,
          restaurant.longitude
        ),
      }));

      if (radius !== "all" && typeof radius === "number") {
        filteredData = filteredData.filter((r) => r.distance! <= radius);
      }
    }

    if (filter && filter !== "all") {
      if (filter === "popular") {
        filteredData = filteredData.filter((r) => r.rating >= 4.5);
      } else if (filter === "new") {
        filteredData = filteredData.slice(-5); // Assuming last 5 are new arrivals
      } else {
        filteredData = filteredData.filter((r) =>
          r.cuisine.toLowerCase().includes(filter)
        );
      }
    }

    if (centerLocation) {
      filteredData.sort((a, b) => a.distance! - b.distance!);
    }

    setRestaurants(filteredData);
  } catch (err: any) {
    setError(err.message || "Failed to fetch restaurants.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (!mounted) return;
      if (userLocationClicked && userLocation) {
        fetchRestaurants(userLocation.latitude, userLocation.longitude, undefined, activeFilter, searchRadius);
        setUserLocationClicked(false);
      } else if (manualLocationClicked && manualMapLocation) {
        fetchRestaurants(manualMapLocation.latitude, manualMapLocation.longitude, undefined, activeFilter, searchRadius);
        setManualLocationClicked(false);
      } else if (manualLocationQuery) {
        fetchRestaurants(undefined, undefined, manualLocationQuery, activeFilter, searchRadius);
      } else {
        fetchRestaurants(undefined, undefined, undefined, activeFilter, searchRadius);
      }
  }, [
    activeFilter,
    mounted,
    userLocation,
    manualMapLocation,
    searchRadius,
    manualLocationQuery,
    userLocationClicked,
    manualLocationClicked
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
    setUserLocationClicked(false);
    setManualLocationClicked(false);
  };

  const handleManualMapSearch = () => {
    setManualSearchMode(true);
    setUserLocation(null);
    setManualLocationQuery('');
    setManualMapLocation(null);
    setUserLocationClicked(false);
    setManualLocationClicked(false);
  };

  const getDirectionsLink = (restaurant: Restaurant) => {
    const fromLat = userLocation?.latitude || manualMapLocation?.latitude;
    const fromLon = userLocation?.longitude || manualMapLocation?.longitude;
    if (!fromLat || !fromLon) return null;

    return `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLon}&destination=${restaurant.latitude},${restaurant.longitude}`;
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
          <form
            onSubmit={handleSearch}
            className="flex flex-col items-center justify-center gap-3 mb-6 w-full"
          >
            <div className="flex flex-col sm:flex-row w-full max-w-xl gap-3">
              {/* Input */}
              <input
                type="text"
                placeholder="Enter your city or address..."
                value={manualLocationQuery}
                onChange={(e) => setManualLocationQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              {/* Search button */}
              <button
                type="submit"
                className="w-full sm:w-auto bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                disabled={!manualLocationQuery.trim()}
              >
                Search
              </button>
            </div>

            {/* Actions row (below input on mobile, inline on larger screens) */}
            <div className="flex flex-row sm:flex-row w-full sm:w-auto gap-3 justify-center">
              {/* Use current location */}
              <button
                type="button"
                onClick={fetchUserLocation}
                className="flex-1 sm:flex-none bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                title="Use my current location"
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
              5.291A7.962 7.962 0 014 12H0c0 
              3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <div className="flex items-center gap-2">
                  <LocateFixed size={20} />
                  {/* <p>Use my current location</p> */}
                  </div>
                )}
              </button>

              {/* Manual select location */}
              <button
                type="button"
                onClick={handleManualMapSearch}
                className={`flex-1 sm:flex-none p-2 rounded-lg transition flex items-center justify-center ${manualSearchMode
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                title="Manually select location on map"
              >
                <div className="flex items-center gap-2">
                  <Focus size={20} />
                  {/* <p>Manually select location on map</p> */}
                </div>
              </button>
            </div>
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
              restaurants.map((restaurant, index) => (
                <div
                 key={restaurant._id || `${restaurant.name}-${index}`}
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
                    {restaurant.distance !== undefined && (userLocation || manualMapLocation) && (
                      <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold mb-4">
                        <span>Distance: {restaurant.distance.toFixed(2)} km</span>
                        <Compass size={18} className="text-blue-500" />
                        <span>Direction: {getDirection(userLocation?.latitude || manualMapLocation!.latitude, userLocation?.longitude || manualMapLocation!.longitude, restaurant.latitude, restaurant.longitude)}</span>
                      </div>
                    )}
                    <NextLink
                      href={{
                        pathname: `/restaurants/${restaurant._id}`,
                        query: {
                          lat: (userLocation || manualMapLocation)?.latitude,
                          lon: (userLocation || manualMapLocation)?.longitude,
                        },
                      }}
                    >
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300 ease-in-out">
                        View Menu
                      </button>
                    </NextLink>
                    {(userLocation || manualMapLocation) && (
                      <a
                        href={getDirectionsLink(restaurant) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 w-full inline-flex justify-center items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                      >
                        <MapPin size={18} className="mr-2" />
                        Get Directions
                      </a>
                    )}
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