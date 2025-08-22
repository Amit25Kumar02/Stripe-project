/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Map from '../components/map';
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
} from 'lucide-react';
import NextLink from 'next/link';
import axios from 'axios';

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

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const fetchRestaurants = async (query?: string, filter?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<Restaurant[]>('/api/restaurants/nearby', {
        params: { q: query, filter: filter },
      });

      // Instead of relying on client-side filtering, fetch the filtered data from the API
      // The API route would need to be updated to handle the 'filter' parameter
      let filteredData = response.data;
      if (filter && filter !== 'all') {
        if (filter === 'popular') {
          filteredData = filteredData.filter(r => r.rating >= 4.5);
        } else if (filter === 'new') {
          // Assuming your new restaurants have a specific ID format or property
          // This is just a placeholder example. You'd need a real rule.
          filteredData = filteredData.filter(r => r.id.startsWith('res'));
        } else {
          filteredData = filteredData.filter(r => r.cuisine.toLowerCase().includes(filter));
        }
      }

      setRestaurants(filteredData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch restaurants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants(searchQuery, activeFilter);
  }, [searchQuery, activeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchQuery);
    setActiveFilter('all');
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    setIsSidebarOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 bg-blue-600 text-white p-2 rounded-full shadow-lg z-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* Sidebar */}
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
                // Use Next.js Link for navigation
                <NextLink href={cat.href} passHref>
                  <span className="flex items-center w-full px-3 py-2 rounded transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer">
                    <span className="mr-2">{cat.icon}</span>
                    {cat.name}
                  </span>
                </NextLink>
              ) : (
                // Use a button for filtering
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

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <h1 className="text-4xl font-extrabold text-gray-900 text-center">
            Nearby Restaurants
          </h1>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <input
              type="text"
              placeholder="Search by city, area or cuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Search
            </button>
          </form>

          {/* Loading/Error */}
          {loading && (
            <p className="text-center text-gray-700">Loading restaurants... 🍽️</p>
          )}
          {error && <p className="text-center text-red-600">{error}</p>}

          {/* Map */}
          {!loading && restaurants.length > 0 && (
            <div className="mb-8 h-96 w-full rounded-xl shadow-lg overflow-hidden border border-gray-200 bg-white">
              <Map restaurants={restaurants} />
            </div>
          )}

          {/* Restaurant Grid */}
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
                    <p className="text-gray-500 text-sm mb-4">
                      Cuisine: {restaurant.cuisine}
                    </p>
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

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}