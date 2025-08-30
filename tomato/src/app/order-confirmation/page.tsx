
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { CheckCircle, Home as HomeIcon, CreditCard, Menu as MenuIcon, X as CloseIcon, Utensils, ClipboardList } from "lucide-react";

// Define the shape of an item in the order for type safety
interface OrderedItem {
  name: string;
  quantity: number;
  price: number;
}

// Separate component for client-side logic
function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const amount = searchParams.get("amount");
  const itemsParam = searchParams.get("items");

  const [orderedItems, setOrderedItems] = useState<OrderedItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Redirect to home if no amount is provided in the URL
    if (!amount) {
      router.push("/");
      return;
    }

    if (itemsParam) {
      try {
        const parsedItems = JSON.parse(decodeURIComponent(itemsParam));
        setOrderedItems(parsedItems);
      } catch (e) {
        console.error("Failed to parse ordered items", e);
      }
    }
  }, [amount, itemsParam, router]);

  const menuItems = [
    { name: "Home", href: "/", icon: <HomeIcon size={20} /> },
    { name: "Restaurants", href: "/restaurants", icon: <Utensils size={20} /> },
    { name: "Orders", href: "/orders", icon: <CreditCard size={20} /> },
    { name: "Order History", href: "/order-history", icon: <ClipboardList size={20} /> },
  ];

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
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out p-6 flex flex-col z-40`}
      >
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
          <span className="text-red-500 mr-2">Tomato</span> 🍔
        </h2>
        <nav className="flex-grow">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center px-4 py-3 text-lg font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span> {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto text-center text-sm text-gray-500 border-t pt-4">
          &copy; {new Date().getFullYear()} Tomato
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Order Confirmed 🎉
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for your order! Your food is on the way 🚀
          </p>

          {orderedItems.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-xl mb-6 text-left">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Order Details</h2>
              <ul className="space-y-2">
                {orderedItems.map((item, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span className="text-gray-700">
                      {item.quantity} x {item.name}
                    </span>
                    <span className="text-gray-900 font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xl font-bold text-gray-900 flex justify-between">
                  <span>Total Paid:</span>
                  <span className="text-green-600">${amount}</span>
                </p>
              </div>
            </div>
          )}

          <Link
            href="/orders"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition"
          >
            View My Orders
          </Link>
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

// Main page component wrapped in a Suspense boundary
export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-medium text-gray-500 animate-pulse">
          Loading confirmation...
        </p>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}