'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import {
  Home as HomeIcon,
  Utensils,
  X as CloseIcon,
  Menu as MenuIcon,
  ShoppingCart,
  Minus,
  Plus,
  ClipboardListIcon,
  MapPin,
  Star,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';

// Interfaces
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
}

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

interface CartItem extends MenuItem {
  quantity: number;
}

// Haversine distance
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function RestaurantMenuPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = params.id;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sortOrder, setSortOrder] = useState<'lowToHigh' | 'highToLow' | 'none'>('none');
  const [mounted, setMounted] = useState(false); // ✅ mount control

  // ✅ Token check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login'); // redirect if no token
    } else {
      setMounted(true);
    }
  }, [router]);

  // Load cart from localStorage
  useEffect(() => {
    if (!mounted) return;
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, [mounted]);

  // Save cart to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, mounted]);

  // Fetch restaurant details and menu
  useEffect(() => {
    if (!mounted || !restaurantId) return;

    const fetchRestaurantDetails = async () => {
      try {
        const { data } = await axios.get<Restaurant>(`/api/restaurants/${restaurantId}`);
        setRestaurant(data);

        const userLat = searchParams.get('lat');
        const userLon = searchParams.get('lon');

        if (userLat && userLon && data.latitude && data.longitude) {
          setDistance(
            haversineDistance(parseFloat(userLat), parseFloat(userLon), data.latitude, data.longitude)
          );
        } else {
          setDistance(null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch restaurant details');
      }
    };

    const fetchMenu = async () => {
      try {
        const { data } = await axios.get<{ menu: MenuItem[] }>(`/api/restaurants/${restaurantId}/menu`);
        setMenu(data.menu);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch menu');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
    fetchMenu();
  }, [restaurantId, searchParams, mounted]);

  // Sorted menu
  const sortedMenu = [...menu].sort((a, b) => {
    if (sortOrder === 'lowToHigh') return a.price - b.price;
    if (sortOrder === 'highToLow') return b.price - a.price;
    return 0;
  });

  // Cart logic
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const exist = prev.find((ci) => ci._id === item._id);
      if (exist) return prev.map((ci) => (ci._id === item._id ? { ...ci, quantity: ci.quantity + 1 } : ci));
      return [...prev, { ...item, quantity: 1 }];
    });
  };
  const removeFromCart = (id: string) => setCart((prev) => prev.filter((ci) => ci._id !== id));
  const increaseQuantity = (id: string) =>
    setCart((prev) => prev.map((ci) => (ci._id === id ? { ...ci, quantity: ci.quantity + 1 } : ci)));
  const decreaseQuantity = (id: string) =>
    setCart((prev) =>
      prev.map((ci) => (ci._id === id ? { ...ci, quantity: Math.max(1, ci.quantity - 1) } : ci))
    );
  const calculateTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const handleCheckout = () => {
    const totalAmount = calculateTotal();
    const encodedItems = encodeURIComponent(JSON.stringify(cart));
    router.push(`/checkout?amount=${totalAmount}&items=${encodedItems}`);
  };

  if (!mounted) return null; // ✅ block UI until auth check


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      {/* Sidebar toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 bg-blue-600 text-white p-2 rounded-full z-50"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform p-6 flex flex-col z-40`}
      >
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
          <span className="text-red-500 mr-2">Tomato</span> 🍔
        </h2>
        <nav className="flex-grow">
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-600"
              >
                <HomeIcon size={20} className="mr-3 text-gray-500" /> Home
              </Link>
            </li>
            <li>
              <Link
                href="/restaurants"
                className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-600"
              >
                <Utensils size={20} className="mr-3 text-gray-500" /> Restaurants
              </Link>
            </li>
            <li>
              <Dialog.Root>
                <Dialog.Trigger className="flex items-center cursor-pointer w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-600">
                  <ShoppingCart size={20} className="mr-3 text-gray-500" /> Cart
                  {cart.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  )}
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                  <Dialog.Content className="fixed right-0 top-0 w-80 h-full bg-white p-6 shadow-xl flex flex-col z-50">
                    <div className="flex justify-between items-center mb-6">
                      <Dialog.Title className="text-2xl font-bold">Your Cart</Dialog.Title>
                      <Dialog.Close className="text-gray-500 hover:text-gray-800">
                        <CloseIcon size={24} />
                      </Dialog.Close>
                    </div>
                    {cart.length === 0 ? (
                      <p className="text-gray-500 text-center flex-grow flex items-center justify-center">
                        Your cart is empty.
                      </p>
                    ) : (
                      <div className="flex-grow overflow-y-auto mb-4">
                        {cart.map((item) => (
                          <div
                            key={item._id}
                            className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
                          >
                            <div>
                              <h4 className="text-lg font-semibold">{item.name}</h4>
                              <p className="text-sm text-gray-600">${item.price}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => decreaseQuantity(item._id)}
                                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => increaseQuantity(item._id)}
                                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                              >
                                <Plus size={16} />
                              </button>
                              <button
                                onClick={() => removeFromCart(item._id)}
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                <CloseIcon size={20} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4 text-xl font-bold">
                        <span>Total:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                      <button
                        onClick={handleCheckout}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
                        disabled={cart.length === 0}
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </li>
            <li>
              <Link
                href="/order-history"
                className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-600"
              >
                <ClipboardListIcon size={20} className="mr-3 text-gray-500" /> Order History
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-600 font-semibold">{error}</p>}

        {!loading && restaurant && (
          <div className="mb-8">
            {/* Back Arrow Button */}
            <div className="mb-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                <ChevronLeft size={24} className="mr-1" />
                <span className="text-lg font-medium">Back to Restaurants</span>
              </button>
            </div>

            {/* Restaurant Header Section */}
            <div className="relative h-72 w-full text-white rounded-2xl overflow-hidden shadow-xl mb-10 group transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl">
              <Image
                src={`https://placehold.co/600x400/CCE3F5/36454F?text=${encodeURIComponent(
                  restaurant.name
                )}`}
                alt={restaurant.name}
                fill
                className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = `https://placehold.co/600x400/CCE3F5/36454F?text=${encodeURIComponent(
                    restaurant.name
                  )}`;
                }}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                {/* Restaurant Name */}
                {/* <h1 className="text-2xl font-extrabold mb-2 drop-shadow-lg tracking-wide">
                  {restaurant.name}
                </h1> */}

                {/* Cuisine */}
                <p className="text-sm font-medium flex items-center mb-2 opacity-90">
                  <Utensils size={16} className="mr-2 text-yellow-400" />
                  {restaurant.cuisine}
                </p>

                {/* Distance Badge */}
                {distance && (
                  <p className="text-xs font-medium mb-3">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full shadow-md">
                      {distance.toFixed(2)} km away
                    </span>
                  </p>
                )}

                {/* Address + Rating */}
                <div className="flex justify-between items-center text-sm font-medium">
                  <p className="flex items-center opacity-90 truncate max-w-[70%]">
                    <MapPin size={16} className="mr-1 text-emerald-400" />
                    {restaurant.address}
                  </p>
                  <p className="flex items-center font-semibold">
                    <Star size={16} className="mr-1 text-yellow-400 drop-shadow-sm" />
                    {restaurant.rating}
                  </p>
                </div>
              </div>
            </div>


            {/* Menu & Sorting Section */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Menu</h2>
              <div className="flex items-center space-x-2">
                <label className="text-gray-700 font-medium">Sort by:</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'lowToHigh' | 'highToLow' | 'none')}
                  className="border-2 border-gray-300 rounded-lg p-2 text-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                >
                  <option value="none">Default</option>
                  <option value="lowToHigh">Price: Low to High</option>
                  <option value="highToLow">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {!loading && sortedMenu.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedMenu.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col cursor-pointer"
              >
                <div className="relative h-40 w-full bg-gray-200">
                  <Image
                    src={
                      `https://placehold.co/600x400/CCE3F5/36454F?text=${encodeURIComponent(
                        item.name
                      )}`
                    }
                    alt={item.name}
                    width={400}
                    height={150}
                    className="w-full h-40 object-cover"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = `https://placehold.co/600x400/CCE3F5/36454F?text=${encodeURIComponent(
                        item.name
                      )}`;
                    }}
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{item.name}</h3>
                    <p className="text-lg font-semibold text-green-600">${item.price}</p>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="mt-4 w-full cursor-pointer bg-blue-600 text-white font-semibold py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart size={20} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}