/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Truck,
  CheckCircle,
  Clock,
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
  orderStatus: "ordered" | "delivered";
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const router = useRouter();

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthChecked(true);
    }
  }, [router]);

  // Fetch orders when authenticated
  useEffect(() => {
    if (!isAuthChecked) return;

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get("/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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

    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, [isAuthChecked]);

const [isCartOpen, setIsCartOpen] = useState(false);

// Status badge helper
const getStatusStyle = (status: "ordered" | "in process" | "delivered") => {
  switch (status) {
    case "in process":
      return {
        text: "In Process",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        icon: <Clock size={16} className="mr-1" />,
      };
    case "ordered":
      return {
        text: "Ordered",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        icon: <Truck size={16} className="mr-1" />,
      };
    case "delivered":
      return {
        text: "Delivered",
        color: "text-green-600",
        bgColor: "bg-green-100",
        icon: <CheckCircle size={16} className="mr-1" />,
      };
    default:
      return {
        text: "Unknown",
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        icon: null,
      };
  }
};

//  Prevent UI flash before auth check
if (!isAuthChecked) {
  return null; // or show loader
}

return (
  <div className="min-h-screen flex bg-gray-50 text-rose-600">
    {/* Mobile toggle button */}
    <button
      className="lg:hidden fixed top-4 left-4 bg-rose-600 text-white p-2 rounded-full shadow-lg z-30 focus:outline-none focus:ring-2 focus:ring-rose-600 transition-all duration-300"
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      aria-label="Toggle sidebar"
    >
      <MenuIcon size={24} />
    </button>

    {/* Sidebar */}
    <aside
      className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out p-6 flex flex-col z-40`}
    >
      {/* Close button for mobile */}
      <button
        className="lg:hidden absolute top-4 right-4 text-gray-600 hover:text-gray-900 focus:outline-none"
        onClick={() => setIsSidebarOpen(false)}
      >
        <CloseIcon size={22} />
      </button>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
        <span className="text-rose-600 mr-2">Tomato</span> 🍔
      </h2>
      <nav className="flex-grow">
        <ul className="space-y-2">
          <li>
            <NextLink
              href="/"
              className="flex items-center px-4 py-3 text-lg font-medium text-gray-600 rounded-lg hover:bg-rose-100 hover:text-rose-600 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <HomeIcon size={20} className="mr-3 " /> Home
            </NextLink>
          </li>
          <li>
            <NextLink
              href="/restaurants"
              className="flex items-center px-4 py-3 text-lg font-medium text-gray-600 rounded-lg hover:bg-rose-100 hover:text-rose-600 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Utensils size={20} className="mr-3" /> Restaurants
            </NextLink>
          </li>
          <li>
            <button
              onClick={() => {
                setIsCartOpen(true);
                setIsSidebarOpen(false);
              }}
              className="flex items-center cursor-pointer px-4 py-3 text-lg font-medium text-gray-600 rounded-lg w-full text-left hover:bg-rose-100 hover:text-rose-600 relative transition-colors"
              disabled={cart.length === 0}
            >
              <ShoppingCart size={20} className="mr-3" />
              Cart
              {cart.length > 0 && (
                <span className="absolute top-2 right-4 bg-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
          </li>
          <li>
            <NextLink
              href="/order-history"
              className="flex items-center px-4 py-3 text-lg font-medium text-gray-600 hover:text-rose-600 rounded-lg"
              onClick={() => setIsSidebarOpen(false)}
            >
              <ClipboardListIcon size={20} className="mr-3" /> Order History
            </NextLink>
          </li>
        </ul>
      </nav>
      <div className="mt-auto text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
        &copy; {new Date().getFullYear()} Tomato
      </div>
    </aside>

    {/* Main content */}
    <main className="flex-1 lg:ml-64 p-6 lg:p-12 relative overflow-hidden ">
      {/* Page Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-rose-600 drop-shadow-lg">
          📦 My Order History
        </h1>
        <p className="mt-3 text-gray-600 text-lg">
          Track and manage all your past orders here
        </p>
      </div>

      {loading ? (
        <div className="space-y-6 max-w-4xl mx-auto">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white/70 backdrop-blur-md p-6 rounded-2xl animate-pulse h-40 shadow-xl"
            ></div>
          ))}
        </div>
      ) : error ? (
        <p className="text-center text-rose-600 font-semibold max-w-4xl mx-auto">
          {error}
        </p>
      ) : orders.length === 0 ? (
        <div className="relative z-10 flex flex-col items-center justify-center py-20 bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 max-w-3xl mx-auto">
          <ClipboardListIcon
            size={72}
            className="text-indigo-400 mb-6 animate-bounce"
          />
          <p className="text-2xl font-semibold text-gray-700">No Orders Yet</p>
          <p className="text-gray-500 mt-2">
            Start by ordering from your favorite restaurant 🍴
          </p>
          <NextLink
            href="/restaurants"
            className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-transform hover:scale-105"
          >
            Explore Restaurants
          </NextLink>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {orders.map((order) => {
            const status = getStatusStyle(order.orderStatus);

            return (
              <div
                key={order._id}
                className="group relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-600">
                      Order ID
                    </h2>
                    <p className="text-lg font-bold text-gray-800">
                      #{order._id.slice(-6)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(order.date).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true, // optional, shows AM/PM
                      })}
                    </p>
                    <span
                      className={`inline-flex items-center mt-1 px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${status.bgColor} ${status.color}`}
                    >
                      {status.icon}
                      {status.text}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <ul className="divide-y divide-gray-100 px-5 py-4">
                  {order.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center py-2 text-gray-700"
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-gray-500">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-t border-gray-100">
                  <p className="font-semibold text-gray-700">Total</p>
                  <p className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
                    ${order.amount.toFixed(2)}
                  </p>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-indigo-200 transition"></div>
              </div>
            );
          })}
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
