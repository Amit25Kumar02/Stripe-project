/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import {
  Home as HomeIcon,
  Utensils,
  X as CloseIcon,
  Menu as MenuIcon,
  MapPin,
  Star,
  DollarSign,
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

// Define the Restaurant interface
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

// Define the MenuItem interface
interface MenuItem {
  id: string;
  name: string;
  price: number;
}

// Define the CartItem interface
interface CartItem extends MenuItem {
  quantity: number;
}

// Haversine distance calculation
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function RestaurantMenuPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const { data } = await axios.get<Restaurant>(`/api/restaurants/${id}`);
        setRestaurant(data);

        const userLat = searchParams.get('lat');
        const userLon = searchParams.get('lon');

        if (userLat && userLon && data.latitude && data.longitude) {
          const dist = haversineDistance(
            parseFloat(userLat),
            parseFloat(userLon),
            data.latitude,
            data.longitude
          );
          setDistance(dist);
        } else {
          setDistance(null); // Explicitly set to null if location is not available
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch restaurant details');
      }
    };

    const fetchMenu = async () => {
      try {
        const { data } = await axios.get<MenuItem[]>(`/api/restaurants/${id}/menu`);
        setMenu(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch menu');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurantDetails();
      fetchMenu();
    }
  }, [id, searchParams]);

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const increaseQuantity = (itemId: string) => {
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item))
    );
  };

  const decreaseQuantity = (itemId: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const handleCheckout = () => {
    const totalAmount = calculateTotal();
    clearCart();
    router.push(`/checkout?amount=${totalAmount}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      {/* Sidebar & Mobile Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 bg-blue-600 text-white p-2 rounded-full shadow-lg z-50"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* Cart Button for Mobile (Main Content) */}
      <button
        className="lg:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg z-50 transition-transform transform hover:scale-110"
        onClick={() => setIsCartOpen(!isCartOpen)}
        disabled={cart.length === 0}
      >
        <ShoppingCart size={24} />
        {cart.length > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {cart.reduce((total, item) => total + item.quantity, 0)}
          </span>
        )}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out p-6 flex flex-col z-40`}
      >
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
          <span className="text-red-500 mr-2">Tomato</span> 🍔
        </h2>
        <nav className="flex-grow">
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className="flex items-center px-4 py-3 text-lg font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setIsSidebarOpen(false)}
              >
                <HomeIcon size={20} className="mr-3 text-gray-500" /> Home
              </Link>
            </li>
            <li>
              <Link
                href="/restaurants"
                className="flex items-center px-4 py-3 text-lg font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setIsSidebarOpen(false)}
              >
                <Utensils size={20} className="mr-3 text-gray-500" /> Restaurants
              </Link>
            </li>
            {/* Cart Button in Sidebar */}
            <li>
              <button
                onClick={() => {
                  setIsCartOpen(true);
                  setIsSidebarOpen(false); // Close the main sidebar
                }}
                className="flex items-center cursor-pointer px-4 py-3 text-lg font-medium text-gray-700 rounded-lg w-full text-left hover:bg-blue-50 hover:text-blue-600 relative "
                disabled={cart.length === 0}
              >
                <ShoppingCart size={20} className="mr-3 text-gray-500" />
                Cart
                {cart.length > 0 && (
                  <span className="absolute top-2 right-4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </nav>
        <div className="mt-auto text-center text-sm text-gray-500 border-t pt-4">
          &copy; {new Date().getFullYear()} Tomato
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6">
        {loading && <p className="text-center text-gray-700 text-lg">Loading restaurant details... 🍽️</p>}
        {error && <p className="text-center text-red-600 text-lg font-semibold">{error}</p>}

        {!loading && restaurant && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link
                href={{
                  pathname: '/restaurants',
                  query: {
                    lat: searchParams.get('lat'),
                    lon: searchParams.get('lon'),
                  },
                }}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft size={24} className="mr-2" />
                <span className="text-lg font-semibold">Back</span>
              </Link>
            </div>

            <h1 className="text-5xl font-extrabold text-gray-900 mb-2">{restaurant.name}</h1>
            <p className="text-gray-600 text-lg mb-4">{restaurant.cuisine}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center text-gray-700">
                <MapPin className="mr-2 text-blue-500" size={20} />
                {distance !== null ? (
                  <span className="font-medium">{distance.toFixed(2)} km away</span>
                ) : (
                  <span className="font-medium">Please choose your location first</span>
                )}
              </div>
              <div className="flex items-center justify-center text-gray-700">
                <Star className="mr-2 text-yellow-500" size={20} />
                <span className="font-medium">Rating: {restaurant.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-center text-gray-700">
                <DollarSign className="mr-2 text-green-600" size={20} />
                <span className="font-medium">Price Range: {restaurant.priceRange}</span>
              </div>
            </div>
          </div>
        )}

        {!loading && menu.length > 0 && (
          <>
            <h2 className="text-3xl font-extrabold mb-6 text-center">Menu</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {menu.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between transform transition-transform hover:scale-105 hover:shadow-2xl"
                >
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{item.name}</h3>
                    <p className="text-gray-700 font-semibold text-lg">${item.price}</p>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition transform hover:-translate-y-1 hover:scale-105"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && menu.length === 0 && !error && (
          <p className="text-center text-gray-500 text-lg">No menu items found for this restaurant.</p>
        )}
      </main>

      {/* Cart Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-80 bg-white shadow-xl transform ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out z-50 p-6 flex flex-col`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Cart</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-gray-800">
            <CloseIcon size={24} />
          </button>
        </div>

        {cart.length === 0 ? (
          <p className="text-gray-500 text-center flex-grow flex items-center justify-center">Your cart is empty.</p>
        ) : (
          <div className="flex-grow overflow-y-auto mb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center">
                  <div>
                    <h4 className="text-lg font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-600">${item.price}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => decreaseQuantity(item.id)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                    <Minus size={16} />
                  </button>
                  <span className="font-semibold">{item.quantity}</span>
                  <button onClick={() => increaseQuantity(item.id)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                    <Plus size={16} />
                  </button>
                  <button onClick={() => removeFromCart(item.id)} className="ml-2 text-red-500 hover:text-red-700">
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
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}