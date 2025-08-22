"use client";

import Link from "next/link";


export default function SuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-green-50">
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
                <h1 className="text-3xl font-bold text-green-600 mb-4">🎉 Payment Successful!</h1>
                <p className="text-gray-700 mb-6">
                    Thank you for your purchase. Your subscription is now active.
                </p>
                <div>

                    <Link
                        href="/"
                        className="inline-block  px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        <h1 className="text-lg text-white font-semibold">Go to Dashboard</h1>
                    </Link>
                </div>
            </div>
        </div>
    );
}
