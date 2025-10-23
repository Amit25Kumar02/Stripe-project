'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Home as HomeIcon,
  Utensils,
  CreditCard,
  Menu as MenuIcon,
  User,
  X as CloseIcon,
  ClipboardListIcon,
  LogOut as LogoutIcon,
  Sparkles,
  ChefHat,
  Zap,
  Star,
  TrendingUp,
} from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

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
}

interface Advertisement {
  id: number;
  title: string;
  desc: string;
  imageUrl: string;
  gradient: string;
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [totalRestaurants, setTotalRestaurants] = useState(0);
  const [activeAd, setActiveAd] = useState(0);
  const router = useRouter();

  // Example advertisements
  const [ads] = useState<Advertisement[]>([
    {
      id: 1,
      title: 'Weekend Special!',
      desc: 'Get 20% off on all orders above $500',
      imageUrl: '/sale-banner.webp',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      id: 2,
      title: 'Free Delivery',
      desc: 'On orders above $300',
      imageUrl: '/free-home.png',
      gradient: 'from-blue-600 to-cyan-500'
    },
    {
      id: 3,
      title: 'New Restaurant Launch',
      desc: 'Try delicious dishes now!',
      imageUrl: '/grand-opening.webp',
      gradient: 'from-orange-500 to-red-500'
    },
  ]);

  // Check token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthChecked(true);
    }
  }, [router]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get<Restaurant[]>("/api/restaurants/nearby");
        const topRated = response.data.sort((a, b) => b.rating - a.rating).slice(0, 4);
        setRestaurants(topRated);
        setTotalRestaurants(response.data.length);
      } catch {
        toast.error("⚠️ Failed to load restaurants");
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAd((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads.length]);

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <ChefHat className="text-white" size={28} />
          </div>
          <p className="text-gray-600 font-medium">Loading your culinary journey...</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { name: 'Home', href: '/', icon: <HomeIcon size={20} /> },
    { name: 'Restaurants', href: '/restaurants', icon: <Utensils size={20} /> },
    { name: 'Checkout', href: '/checkout', icon: <CreditCard size={20} /> },
    { name: 'Order History', href: '/order-history', icon: <ClipboardListIcon size={20} /> },
    { name: 'Profile', href: '/profile', icon: <User size={20} /> },
  ];

  const stats = [
    { label: 'Active Orders', value: '3', icon: <Zap size={20} />, color: 'text-yellow-600' },
    { label: 'Total Restaurants', value: totalRestaurants.toString(), icon: <Star size={20} />, color: 'text-rose-600' },
    { label: 'Total Orders', value: '47', icon: <TrendingUp size={20} />, color: 'text-green-600' },
  ];
  const dummyItems = [
    { name: '🍕 Pepperoni Pizza', desc: 'Hot & cheesy' },
    { name: '🍔 Classic Burger', desc: 'Juicy & fresh' },
    { name: '🍣 Sushi Platter', desc: 'Ocean fresh' },
    { name: '🥗 Healthy Salad', desc: 'Fresh veggies' },
    { name: '🌮 Tacos Fiesta', desc: 'Spicy & tangy' },
    { name: '🍩 Donut Treat', desc: 'Sweet delight' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 bg-rose-600 text-white p-2 rounded-full shadow-lg z-30 focus:outline-none focus:ring-2 focus:ring-red-300"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <MenuIcon size={24} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-300 ease-in-out p-6 flex flex-col z-40`}
      >
        <button
          className="absolute top-4 right-4 lg:hidden text-gray-500 hover:text-rose-600"
          onClick={() => setIsSidebarOpen(false)}
        >
          <CloseIcon size={22} />
        </button>

        <div className="mb-8 text-center lg:text-left">
          <h2 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center lg:justify-start">
            <span className="text-rose-600 mr-2">Tomato</span> 🍔
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
                  className="flex items-center px-4 py-3 text-lg font-medium text-gray-700 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition duration-150 ease-in-out group"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span className="mr-3 text-gray-500 group-hover:text-rose-600 transition-colors duration-150">
                    {link.icon}
                  </span>
                  {link.name}
                </Link>
              </li>
            ))}

            {/* Logout */}
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 cursor-pointer py-3 text-lg font-medium text-gray-700 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition duration-150 ease-in-out group"
              >
                <span className="mr-3 text-gray-500 group-hover:text-rose-600 transition-colors duration-150">
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
        {/* Hero Section */}
        <div className=" rounded-3xl shadow-2xl p-10 md:p-16 w-full max-w-full mx-auto text-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-2">
              Welcome Back, <span className="bg-gradient-to-r from-rose-600 to-rose-600 bg-clip-text text-transparent animate-bounce ">Foodie!</span>
              👋
            </h1>
            <p className="text-gray-600 text-lg">What delicious meal are you craving today?</p>
          </div>

        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 lg:mb-12">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                  <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-to-br from-gray-50 to-white ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative mb-12 rounded-3xl overflow-hidden shadow-2xl h-72 lg:h-80">
          {ads.map((ad, index) => (
            <div
              key={ad.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === activeAd ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${ad.gradient} opacity-90`} />
              <div className="absolute inset-0 flex items-center justify-between p-8 lg:p-16">
                <div className="text-white max-w-2xl">
                  <h2 className="text-3xl lg:text-5xl font-black mb-4">{ad.title}</h2>
                  <p className="text-xl lg:text-2xl opacity-90 mb-6">{ad.desc}</p>
                  <button className="bg-white text-gray-900 font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                    <Link href='/restaurants'>
                      Order Now 🚀
                    </Link>
                  </button>
                </div>
                <div className="hidden lg:block transform scale-125">
                  <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <div className="w-32 h-32 bg-white/30 rounded-full flex items-center justify-center">
                      <Sparkles size={48} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Restaurants */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Featured Restaurants</h2>
              <p className="text-gray-600">Handpicked for exceptional quality</p>
            </div>
            <Link href="/restaurants">
              <button className="bg-rose-600 cursor-pointer text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                View All
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant._id}
                className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden"
              >
                <div className="relative h-48 bg-gradient-to-br from-rose-100 to-orange-100 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-bold text-xl mb-1">{restaurant.name}</h3>
                    <p className="text-white/90 text-sm">{restaurant.cuisine}</p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-amber-500 fill-current" />
                      <span className="font-semibold text-gray-900">{restaurant.rating}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{restaurant.priceRange}</span>
                    </div>
                  </div>
                  <button className="w-full bg-rose-50 text-rose-600 font-semibold py-3 rounded-xl hover:bg-rose-100 transition-colors group-hover:bg-rose-600 group-hover:text-white">
                    Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dummy Items */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-8">Popular Categories</h2>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {dummyItems.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col bg-white justify-between p-6 rounded-2xl shadow-xl transform transition-transform hover:scale-105"
              >
                <div>
                  <h2 className="text-2xl text-rose-600 font-bold">{item.name}</h2>
                  <p className="text-rose-400">{item.desc}</p>
                </div>
                <div className="text-5xl text-right mt-4">{item.name.slice(0, 2)}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}
