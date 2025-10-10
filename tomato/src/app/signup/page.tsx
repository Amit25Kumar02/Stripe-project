/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL;

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`${API_BASE_URL}/api/users`, {
                name,
                email,
                phone,
                password,
            });

            if (res.status === 201 || res.status === 200) {
                toast.success("Signup successful! 🎉 You can now login.");
                setName("");
                setEmail("");
                setPhone("");
                setPassword("");
                setConfirmPassword("");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            }
        } catch (err: any) {
            if (err.response) {
                toast.error(err.response.data.message || "Signup failed");
            } else {
                toast.error("Error connecting to server");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
            {/* Left Side - Food Banner */}
            <div className="hidden md:flex w-full md:w-1/2 relative items-center justify-center text-white p-8 md:p-16 overflow-hidden bg-gradient-to-r from-amber-600 to-rose-500">
                {/* Decorative food icons */}
                <div className="absolute top-1/4 left-1/4 animate-float-slow z-10">
                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-4xl">🍕</span>
                    </div>
                </div>

                <div className="absolute bottom-1/4 right-1/4 animate-float-medium z-10">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-3xl">🍔</span>
                    </div>
                </div>

                <div className="absolute top-1/3 right-1/3 animate-float-fast z-10">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-2xl">🥗</span>
                    </div>
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
                        Join the <span className="text-amber-300">Tomato</span> Family
                    </h1>
                    <p className="text-xl text-white/90 mb-8 leading-relaxed">
                        Create your account today and discover amazing food experiences with exclusive offers and fast delivery.
                    </p>

                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-12 h-1 bg-amber-300 rounded-full"></div>
                        <div className="w-6 h-1 bg-amber-300 rounded-full"></div>
                        <div className="w-3 h-1 bg-amber-300 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Right Side - Signup Form */}
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
                            <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
                            <p className="text-gray-600 mt-2">Join Tomato for delicious food experiences</p>
                        </span>
                    </div>

                    <form
                        onSubmit={handleSignup}
                        className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
                    >
                        {/* Name Input */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. Amit Kumar"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    placeholder="e.g. amit@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                                />
                            </div>
                        </div>

                        {/* Phone Input */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <input
                                    type="tel"
                                    placeholder="e.g. 9876543210"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors pr-12"
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
                        </div>

                        {/* Confirm Password Input */}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Re-enter password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors pr-12"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-rose-600"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
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
                                    Creating Account...
                                </>
                            ) : (
                                "Sign Up"
                            )}
                        </button>

                        {/* Login Link */}
                        <p className="mt-4 text-center text-gray-600 text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="text-rose-600 font-semibold hover:text-rose-700 transition-colors">
                                Login here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

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