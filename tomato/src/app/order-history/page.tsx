/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Menu as MenuIcon,
  X as CloseIcon,
  Home as HomeIcon,
  CreditCard,
  Utensils,
  ShoppingCart,
  ClipboardListIcon,
  ReceiptText,
} from "lucide-react";
import NextLink from "next/link";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  amount: number;
  date: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cart, setCart] = useState<OrderItem[]>([]); // Example cart

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/orders");
        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          setError("Failed to load orders");
        }
      } catch (err) {
        setError("Network error");
      } finally {
          setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 bg-gray-800 text-white p-2 rounded-full shadow-lg z-50 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all duration-300"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out p-6 flex flex-col z-40`}
      >
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
          <span className="text-red-500 mr-2">Tomato</span> 🍔
        </h2>
        <nav className="flex-grow">
          <ul className="space-y-2">
            <li>
              <NextLink
                href="/"
                className="flex items-center px-4 py-3 text-lg font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                <HomeIcon size={20} className="mr-3 text-gray-500" /> Home
              </NextLink>
            </li>
            <li>
              <NextLink
                href="/restaurants"
                className="flex items-center px-4 py-3 text-lg font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                <Utensils size={20} className="mr-3 text-gray-500" /> Restaurants
              </NextLink>
            </li>
            <li>
              <button
                onClick={() => {
                  setIsCartOpen(true);
                  setIsSidebarOpen(false);
                }}
                className="flex items-center cursor-pointer px-4 py-3 text-lg font-medium text-gray-700 rounded-lg w-full text-left hover:bg-gray-100 hover:text-blue-600 relative transition-colors"
                disabled={cart.length === 0}
              >
                <ShoppingCart size={20} className="mr-3 text-gray-500" />
                Cart
                {cart.length > 0 && (
                  <span className="absolute top-2 right-4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>
            </li>
            <li>
              <NextLink
                href="/order-history"
                className="flex items-center px-4 py-3 text-lg font-medium text-gray-700 rounded-lg bg-gray-100 "
                onClick={() => setIsSidebarOpen(false)}
              >
                <ClipboardListIcon size={20} className="mr-3 text-blue-600" /> Order History
              </NextLink>
            </li>
          </ul>
        </nav>
        <div className="mt-auto text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
          &copy; {new Date().getFullYear()} Tomato
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-12 relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-12 relative z-10 bg-clip-text from-blue-600  drop-shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
          📦 My Order History
        </h1>

        {loading ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl animate-pulse h-40 shadow-xl"
              ></div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-600 font-semibold max-w-4xl mx-auto">{error}</p>
        ) : orders.length === 0 ? (
          <div className="relative z-10 flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-xl border border-gray-200 max-w-4xl mx-auto">
            <ClipboardListIcon size={64} className="text-gray-400 mb-4 animate-pulse" />
            <p className="text-xl text-gray-600 font-medium">
              You haven&apos;t placed any orders yet.
            </p>
            <p className="text-gray-500 mt-2">
              Start by ordering from your favorite restaurant!
            </p>
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {orders.map((order) => (
              <div
                key={order._id}
                className="relative bg-white rounded-2xl shadow-xl p-6 border border-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:ring-2 hover:ring-blue-500"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <ReceiptText size={24} className="text-blue-500 mr-2" />
                    Order #<span className="text-gray-600 font-normal">{order._id.slice(-6)}</span>
                  </h2>
                  <span className="text-sm font-medium text-gray-500">
                    {new Date(order.date).toLocaleDateString()}
                  </span>
                </div>
                
                <ul className="space-y-3 mb-4 text-gray-700">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center text-base">
                      <span className="font-medium text-gray-800">{item.name}</span>
                      <span className="text-gray-500">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                  <p className="font-semibold text-lg text-gray-800">
                    Total:
                  </p>
                  <p className="font-extrabold text-xl text-green-600">
                    ${order.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
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