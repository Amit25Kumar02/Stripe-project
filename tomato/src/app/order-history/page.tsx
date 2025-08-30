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
    <div className="min-h-screen flex bg-gray-100">
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 bg-blue-600 text-white p-2 rounded-full shadow-lg z-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                className="flex items-center px-4 py-3 text-lg font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setIsSidebarOpen(false)}
              >
                <HomeIcon size={20} className="mr-3 text-gray-500" /> Home
              </NextLink>
            </li>
            <li>
              <NextLink
                href="/restaurants"
                className="flex items-center px-4 py-3 text-lg font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
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
                className="flex items-center cursor-pointer px-4 py-3 text-lg font-medium text-gray-700 rounded-lg w-full text-left hover:bg-blue-50 hover:text-blue-600 relative"
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
            <li>
              <NextLink
                href="/order-history"
                className="flex items-center px-4 py-3 text-lg font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setIsSidebarOpen(false)}
              >
                <ClipboardListIcon size={20} className="mr-3 text-gray-500" /> Order History
              </NextLink>
            </li>
          </ul>
        </nav>
        <div className="mt-auto text-center text-sm text-gray-500 border-t pt-4">
          &copy; {new Date().getFullYear()} Tomato
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 p-6">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">
          📦 My Order History
        </h1>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl animate-pulse h-36 shadow-md"
              ></div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-600 font-semibold">{error}</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500 font-medium">
            No orders found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <h2 className="text-xl font-bold mb-3 text-blue-600">
                  Order #{order._id.slice(-6)}
                </h2>
                <ul className="space-y-2 mb-3">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>
                        {item.quantity} x {item.name}
                      </span>
                      <span className="font-semibold text-gray-700">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 font-semibold text-green-600 text-lg">
                  Total: ${order.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Ordered at: {new Date(order.date).toLocaleString()}
                </p>
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
