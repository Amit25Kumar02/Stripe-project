/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export default function LoginPage() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE_URL}/api/login`, {
                phone,
                password,
            });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            toast.success("Login successful! 🍕");
            window.location.href = "/";
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
            {/* Left Side - Food Promo */}
            <div className="hidden md:flex w-full md:w-1/2 relative items-center justify-center text-white p-8 md:p-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-amber-500 z-0" />
                <div className="absolute inset-0 bg-black/20 z-0" />

                {/* Animated floating food items */}
                <div className="absolute top-1/4 left-1/4 animate-float-slow z-10">
                    <Image
                        src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                        alt="Pasta"
                        width={120}
                        height={120}
                        className="rounded-full shadow-lg"
                    />
                </div>

                <div className="absolute bottom-1/4 right-1/4 animate-float-medium z-10">
                    <Image
                        src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                        alt="Salad"
                        width={100}
                        height={100}
                        className="rounded-full shadow-lg"
                    />
                </div>

                <div className="absolute top-1/3 right-1/3 animate-float-fast z-10">
                    <Image
                        src="https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                        alt="Pizza"
                        width={80}
                        height={80}
                        className="rounded-full shadow-lg"
                    />
                </div>

                <div className="relative z-20 max-w-md text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                            <Image
                                src="/favicon.ico"
                                alt="Tomato"
                                width={80}
                                height={80}
                                className="rounded-full shadow-lg"
                            />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        Welcome Back to <span className="text-amber-300">Tomato</span>
                    </h1>
                    <p className="text-xl text-white/90 mb-8 leading-relaxed">
                        Sign in to continue your culinary journey and discover amazing food experiences
                    </p>

                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-12 h-1 bg-amber-300 rounded-full"></div>
                        <div className="w-6 h-1 bg-amber-300 rounded-full"></div>
                        <div className="w-3 h-1 bg-amber-300 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex w-full md:w-1/2 items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-md">
                    <div className="mb-8 flex items-center">
                        <span className="mr-4">
                            <Image
                                src="/favicon.ico"
                                alt="Tomato"
                                width={80}
                                height={80}
                                className="rounded-full shadow-lg"
                            />
                        </span>
                        <span>
                            <h1 className="text-3xl font-bold text-gray-800">Welcome back</h1>
                            <p className="text-gray-600 mt-2">Sign in to your Tomato account</p>
                        </span>
                    </div>

                    <form
                        onSubmit={handleLogin}
                        className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
                    >
                        {/* Mobile Number Input */}
                        <div className="mb-6">
                            <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                                Mobile Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500">+91</span>
                                </div>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className="w-full pl-12 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                                    placeholder="9876543210"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="mb-6">
                            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors pr-12"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-rose-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <div className="mt-2 text-right">
                                <Link href="/forgot-password" className="text-sm text-rose-600 hover:text-rose-700 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-rose-600 to-rose-500 text-white py-3 px-4 rounded-lg hover:from-rose-700 hover:to-rose-600 transition-all shadow-md hover:shadow-lg font-semibold flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing In...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>

                        {/* Signup Link */}
                        <p className="text-center text-gray-600 text-sm mt-6">
                            Don&apos;t have an account?{" "}
                            <Link href="/signup" className="text-rose-600 font-semibold hover:text-rose-700 transition-colors">
                                Create account
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            <style jsx global>{`
        @keyframes float-slow {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes float-medium {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes float-fast {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 4s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 5s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}