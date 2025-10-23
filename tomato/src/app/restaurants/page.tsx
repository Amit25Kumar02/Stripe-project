/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
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
  Heart,
  Share2,
  Navigation,
} from 'lucide-react';
import NextLink from 'next/link';
import axios from 'axios';
import Link from 'next/link';


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
  isFeatured?: boolean;
}

interface SavedLocation {
  latitude: number;
  longitude: number;
  type: 'user' | 'manual';
  timestamp: number;
  query?: string;
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
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login'); // redirect if no token
    } else {
      setMounted(true);
    }
    // Load saved location from localStorage
    const savedLocation = localStorage.getItem('savedLocation');
    if (savedLocation) {
      const locationData: SavedLocation = JSON.parse(savedLocation);
      if (locationData.type === 'user') {
        setUserLocation({ latitude: locationData.latitude, longitude: locationData.longitude });
        setUserLocationClicked(true);
      } else if (locationData.type === 'manual') {
        if (locationData.latitude && locationData.longitude) {
          setManualMapLocation({ latitude: locationData.latitude, longitude: locationData.longitude });
          setManualLocationClicked(true);
        } else if (locationData.query) {
          setManualLocationQuery(locationData.query);
        }
      }
    }
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, [router]);
  const toggleFavorite = (restaurantId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(restaurantId)) {
      newFavorites.delete(restaurantId);
    } else {
      newFavorites.add(restaurantId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify([...newFavorites]));
  };

  const saveLocationToStorage = (locationData: SavedLocation) => {
    localStorage.setItem('savedLocation', JSON.stringify(locationData));
  };

  const fetchUserLocation = () => {
    setLocationLoading(true);
    setManualSearchMode(false);
    setManualMapLocation(null);
    setManualLocationQuery('');
    setUserLocationClicked(true);
    setManualLocationClicked(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });

          // Save to localStorage
          const locationData: SavedLocation = {
            latitude,
            longitude,
            type: 'user',
            timestamp: Date.now()
          };
          saveLocationToStorage(locationData);

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
          filteredData = filteredData.slice(-5);
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
    if (manualLocationQuery.trim()) {
      // Save search query to localStorage
      const locationData: SavedLocation = {
        type: 'manual',
        query: manualLocationQuery,
        timestamp: Date.now()
      } as SavedLocation;
      saveLocationToStorage(locationData);

      setUserLocation(null);
      setManualMapLocation(null);
      setManualSearchMode(false);
      setActiveFilter('all');
    }
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    setIsSidebarOpen(false);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setManualMapLocation({ latitude: lat, longitude: lng });

    // Save manual map location to localStorage
    const locationData: SavedLocation = {
      latitude: lat,
      longitude: lng,
      type: 'manual',
      timestamp: Date.now()
    };
    saveLocationToStorage(locationData);

    setUserLocation(null);
    setManualLocationQuery('');
    setUserLocationClicked(false);
    setManualLocationClicked(true);
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
        className="lg:hidden fixed top-4 left-4 bg-rose-600 text-white p-2 rounded-full shadow-lg z-30 focus:outline-none focus:ring-2 focus:ring-rose-300 cursor-pointer"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <MenuIcon size={24} />
      </button>

      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-6 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform z-40`}
      >
        <button
          className="absolute top-4 right-4 md:hidden text-gray-500 hover:text-rose-600"
          onClick={() => setIsSidebarOpen(false)}
        >
          <CloseIcon size={22} />
        </button>
        <h2 className="text-2xl font-bold justify-center text-rose-600 flex items-center mb-6">
          Categories
        </h2>
        <ul className="space-y-2 mb-[90%]">
          {categories.map((cat) => (
            <li key={cat.name}>
              {cat.href ? (
                <NextLink href={cat.href} passHref>
                  <span className="flex items-center w-full px-3 py-2 rounded transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer">
                    <span className="mr-2">{cat.icon}</span>
                    {cat.name}
                  </span>
                </NextLink>
              ) : (
                <button
                  onClick={() => handleFilterClick(cat.filter!)}
                  className={`flex items-center w-full px-3 cursor-pointer py-2 rounded transition ${activeFilter === cat.filter
                    ? 'bg-rose-100 text-rose-600 font-semibold'
                    : 'hover:bg-rose-50 hover:text-rose-600'
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

      <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 p-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className='md:flex justify-between'>
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-2">
                Discover <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Restaurants</span>
              </h1>
              <p className="text-gray-600 text-lg">Find the perfect dining experience near you</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">{restaurants.length} places found</span>
              </div>
            </div>
          </div>
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
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
              />

              {/* Search button */}
              <button
                type="submit"
                className="w-full sm:w-auto cursor-pointer bg-rose-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-rose-700 transition"
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
                className="flex-1 sm:flex-none cursor-pointer bg-rose-600 text-white p-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center"
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
                  </div>
                )}
              </button>

              {/* Manual select location */}
              <button
                type="button"
                onClick={handleManualMapSearch}
                className={`flex-1 sm:flex-none cursor-pointer p-2 rounded-lg transition flex items-center justify-center ${manualSearchMode
                  ? "bg-rose-500 text-white hover:bg-rose-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                title="Manually select location on map"
              >
                <div className="flex items-center gap-2">
                  <Focus size={20} />
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
          {error && <p className="text-center text-rose-600">{error}</p>}

          {!loading && (
            <div className="mb-8 h-96 w-full rounded-xl shadow-lg overflow-hidden border border-gray-200 bg-white z-0">
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

          {/* Results Grid */}
          {!loading && restaurants.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">
                    {restaurants.length} Restaurants Found
                  </h2>
                  <p className="text-gray-600">Sorted by distance from your location</p>
                </div>
                <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
                  <Sparkles size={16} className="text-amber-500" />
                  <span>✨ Premium spots highlighted</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {restaurants.map((restaurant, index) => (
                  <div
                    key={restaurant._id || `${restaurant.name}-${index}`}
                    className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden border border-gray-100"
                  >
                    {/* Image Header */}
                    <div className="relative h-48 overflow-hidden">
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
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://placehold.co/600x400/CCE3F5/36454F?text=${encodeURIComponent(
                            restaurant.name
                          )}`;
                        }}
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {restaurant.isFeatured && (
                          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                            <Sparkles size={12} />
                            Featured
                          </div>
                        )}
                        {favorites.has(restaurant._id) && (
                          <div className="bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                            <Heart size={12} fill="currentColor" />
                            Favorite
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={() => toggleFavorite(restaurant._id)}
                          className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-white/30 transition-all hover:scale-110"
                        >
                          <Heart
                            size={18}
                            fill={favorites.has(restaurant._id) ? "currentColor" : "none"}
                          />
                        </button>
                        <button className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-white/30 transition-all hover:scale-110">
                          <Link href="https://www.whatsapp.com">
                          <Share2 size={18} />
                          </Link>
                        </button>
                      </div>

                      {/* Restaurant Info Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-xl font-bold mb-1">{restaurant.name}</h3>
                        <p className="text-white/90 text-sm">{restaurant.cuisine}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Rating and Price */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full">
                            <Star size={16} className="text-amber-500 fill-current" />
                            <span className="font-bold text-gray-900">{restaurant.rating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <DollarSign size={16} />
                            <span className="font-semibold">{restaurant.priceRange}</span>
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      <p className="text-gray-600 mb-4 flex items-start gap-2">
                        <MapPin size={18} className="text-rose-500 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{restaurant.address}</span>
                      </p>

                      {/* Distance and Direction */}
                      {restaurant.distance !== undefined && (userLocation || manualMapLocation) && (
                        <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-2xl">
                          <div className="flex items-center gap-2 text-rose-600 font-semibold">
                            <Navigation size={16} />
                            <span>{restaurant.distance.toFixed(1)} km away</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Compass size={16} />
                            <span>
                              {getDirection(
                                userLocation?.latitude || manualMapLocation!.latitude,
                                userLocation?.longitude || manualMapLocation!.longitude,
                                restaurant.latitude,
                                restaurant.longitude
                              )}
                            </span>
                          </div>
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
                          <button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded-lg transition duration-300 cursor-pointer ease-in-out">
                            View Menu
                          </button>
                        </NextLink>

                        {(userLocation || manualMapLocation) && (
                          <a
                            href={getDirectionsLink(restaurant) || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 w-full inline-flex justify-center items-center bg-gray-200 hover:bg-rose-100 hover:text-rose-600 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                          >
                            <MapPin size={18} className="mr-2" />
                            Get Directions
                          </a>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
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