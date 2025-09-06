'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Home as HomeIcon,
  Utensils,
  CreditCard,
  Menu as MenuIcon,
  X as CloseIcon,
  ClipboardListIcon,
  LogOut as LogoutIcon,
} from 'lucide-react';


export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const router = useRouter();

  // ✅ Check token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login'); // redirect if no token
    } else {
      // optionally validate token here with backend if needed
      setIsAuthChecked(true);
    }
  }, [router]);

  if (!isAuthChecked) {
    return null; // or a loader/spinner
  }

  const navLinks = [
    { name: 'Home', href: '/', icon: <HomeIcon size={20} /> },
    { name: 'Restaurants', href: '/restaurants', icon: <Utensils size={20} /> },
    { name: 'Checkout', href: '/checkout', icon: <CreditCard size={20} /> },
    { name: 'Order History', href: '/order-history', icon: <ClipboardListIcon size={20} /> },
  ];

  const dummyItems = [
    { name: '🍕 Pepperoni Pizza', desc: 'Hot & cheesy' },
    { name: '🍔 Classic Burger', desc: 'Juicy & fresh' },
    { name: '🥗 Healthy Salad', desc: 'Fresh veggies' },
    { name: '🍣 Sushi Platter', desc: 'Ocean fresh' },
    { name: '🌮 Tacos Fiesta', desc: 'Spicy & tangy' },
    { name: '🍩 Donut Treat', desc: 'Sweet delight' },
  ];

  // ✅ Logout logic
  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');
    router.push('/login'); // redirect to login
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">

      {/* Mobile Sidebar Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 bg-blue-600 text-white p-2 rounded-full shadow-lg z-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-300 ease-in-out p-6 flex flex-col z-40`}
      >
        <div className="mb-8 text-center lg:text-left">
          <h2 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center lg:justify-start">
            <span className="text-red-500 mr-2">Tomato</span> 🍔
          </h2>
          <p className="text-sm text-gray-500 mt-1">Your Culinary Companion</p>
        </div>

        {/* Navigation */}
        <nav className="flex-grow">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="flex items-center px-4 py-3 text-lg font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition duration-150 ease-in-out group"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span className="mr-3 text-gray-500 group-hover:text-blue-500 transition-colors duration-150">
                    {link.icon}
                  </span>
                  {link.name}
                </Link>
              </li>
            ))}

            {/* ✅ Logout Button */}
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-lg font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-blue-600 transition duration-150 ease-in-out group"
              >
                <span className="mr-3 text-gray-500 group-hover:text-blue-500 transition-colors duration-150">
                  <LogoutIcon size={20} />
                </span>
                Logout
              </button>
            </li>
          </ul>
        </nav>

        <div className="mt-auto text-center text-sm text-gray-500 border-t pt-4">
          <p>&copy; {new Date().getFullYear()} Tomato</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 flex flex-col gap-10">
        <div className="bg-gradient-to-r from-rose-600 to-amber-500 text-white rounded-3xl shadow-2xl p-10 md:p-16 w-full max-w-full mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            Welcome to <span className="text-yellow-300">My Restaurant App</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-12">
            Discover delicious nearby restaurants, manage your orders, and enjoy seamless payments.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/restaurants">
              <button className="w-full sm:w-auto bg-white text-blue-600 font-bold py-4 px-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                Find Nearby Restaurants 📍
              </button>
            </Link>
            <Link href="/checkout">
              <button className="w-full sm:w-auto bg-yellow-400 text-gray-900 font-bold py-4 px-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                Go to Checkout 💳
              </button>
            </Link>
          </div>
        </div>

        {/* Dummy Items */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {dummyItems.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col bg-white justify-between p-6 rounded-2xl shadow-xl transform transition-transform hover:scale-105"
            >
              <div>
                <h2 className="text-2xl font-bold">{item.name}</h2>
                <p className="text-gray-400">{item.desc}</p>
              </div>
              <div className="text-5xl text-right mt-4">{item.name.slice(0, 2)}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
