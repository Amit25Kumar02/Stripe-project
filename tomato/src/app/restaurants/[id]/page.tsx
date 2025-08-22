/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Home as HomeIcon, Utensils, X as CloseIcon, Menu as MenuIcon } from 'lucide-react';
import Link from 'next/link';

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export default function RestaurantMenuPage() {
  const { id } = useParams();
  const router = useRouter();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await axios.get(`/api/restaurants/${id}/menu`);
        setMenu(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch menu');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [id]);

  const handleBuyNow = (price: number) => {
    // Redirect to /checkout with price as query param
    router.push(`/checkout?amount=${price}`);
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
          </ul>
        </nav>
        <div className="mt-auto text-center text-sm text-gray-500 border-t pt-4">
          &copy; {new Date().getFullYear()} Tomato
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6">
        <h1 className="text-4xl font-extrabold mb-6 text-center">Restaurant Menu</h1>

        {loading && <p className="text-center text-gray-700 text-lg">Loading menu... 🍽️</p>}
        {error && <p className="text-center text-red-600 text-lg font-semibold">{error}</p>}

        {!loading && menu.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menu.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between transform transition-transform hover:scale-105 hover:shadow-2xl"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
                  <p className="text-gray-700 font-semibold text-lg">${item.price}</p>
                </div>
                <button
                  onClick={() => handleBuyNow(item.price)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition transform hover:-translate-y-1 hover:scale-105"
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && menu.length === 0 && !error && (
          <p className="text-center text-gray-500 text-lg">No menu items found for this restaurant.</p>
        )}
      </main>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
