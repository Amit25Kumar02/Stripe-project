"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { Home, User, LogOut, X, MenuIcon, Save, Edit, XCircle } from "lucide-react";
import axios from "axios";

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    address: string;
    state: string;
    city: string;
    pincode: string;
    dob: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({
        name: "",
        email: "",
        phone: "",
        address: "",
        state: "",
        city: "",
        pincode: "",
        dob: "",
    });
    const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    // Check token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) router.push("/login");
    }, [router]);

    // Fetch user profile
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const storedUser = localStorage.getItem("user");
                const userId = storedUser ? JSON.parse(storedUser)?.id : null;
                if (!userId) throw new Error("User not found");

                const res = await axios.get(`/api/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setProfile(res.data.user);
                setOriginalProfile(res.data.user); // Keep a copy to revert if cancel
            } catch (err) {
                console.error(err);
                toast.error("Failed to fetch profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    // Save profile
    const handleSave = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const storedUser = localStorage.getItem("user");
            const userId = storedUser ? JSON.parse(storedUser)?.id : null;
            if (!userId) throw new Error("User not found");

            await axios.patch(`/api/users/${userId}`, profile, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success("Profile updated successfully!");
            setOriginalProfile(profile); // ✅ Save updated version as baseline
            setEditMode(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile.");
        }
    };

    // Cancel edit (revert to last saved state)
    const handleCancel = () => {
        if (originalProfile) {
            setProfile(originalProfile);
        }
        setEditMode(false);
    };

    const initials = profile.name ? profile.name.charAt(0).toUpperCase() : "?";

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-10 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:static z-20 bg-white shadow-md w-64 min-h-screen p-6 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                    }`}
            >
                <button
                    className="absolute top-4 right-4 md:hidden text-gray-500 hover:text-rose-600"
                    onClick={() => setSidebarOpen(false)}
                >
                    <X size={22} />
                </button>

                <h2 className="text-2xl font-bold text-rose-600 mb-8 flex items-center gap-2">
                    Tomato
                </h2>

                <nav className="flex flex-col gap-3 text-gray-700">
                    <Link
                        href="/"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-rose-100"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <Home size={18} /> Home
                    </Link>
                    <Link
                        href="/profile"
                        className="flex items-center gap-3 p-2 rounded-lg bg-rose-600 text-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <User size={18} /> Profile
                    </Link>
                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("user");
                            router.push("/login");
                        }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-rose-100 text-left cursor-pointer"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <button
                    className="md:hidden mb-4 bg-rose-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <MenuIcon size={18} /> Menu
                </button>

                <h1 className="text-3xl font-bold text-rose-600 mb-6">Profile</h1>

                {loading ? (
                    <p className="text-gray-500">Loading profile...</p>
                ) : (
                    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-100 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-rose-600 text-white font-bold rounded-full flex items-center justify-center text-2xl">
                                {initials}
                            </div>
                            {!editMode && (
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700 cursor-pointer"
                                >
                                    <Edit size={16} /> Edit Profile
                                </button>
                            )}
                        </div>

                        {/* Edit Mode */}
                        {editMode ? (
                            <div className="space-y-4">
                                {/* Form Fields */}
                                {[
                                    { label: "Name *", name: "name", type: "text", required: true },
                                    { label: "Email *", name: "email", type: "email", required: true },
                                    { label: "Phone", name: "phone", type: "text", disabled: true },
                                    { label: "Address", name: "address", type: "text" },
                                    { label: "City", name: "city", type: "text" },
                                    { label: "State", name: "state", type: "text" },
                                    { label: "Pincode", name: "pincode", type: "text" },
                                    { label: "Date of Birth", name: "dob", type: "date" },
                                ].map((field) => (
                                    <div key={field.name}>
                                        <label className="text-sm text-gray-700">{field.label}</label>
                                        <input
                                            name={field.name}
                                            type={field.type}
                                            value={profile[field.name as keyof UserProfile] || ""}
                                            onChange={handleChange}
                                            className="input"
                                            required={field.required}
                                            disabled={field.disabled}
                                        />
                                    </div>
                                ))}

                                {/* Save + Cancel Buttons */}
                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 transition-all font-semibold flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Save size={16} /> Save
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg hover:bg-gray-400 transition-all font-semibold flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <XCircle size={16} /> Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="md:grid grid-cols-2 gap-4 text-gray-700">
                                <p><strong>Name:</strong> {profile.name}</p>
                                <p><strong>Email:</strong> {profile.email}</p>
                                <p><strong>Phone:</strong> {profile.phone}</p>
                                <p><strong>Address:</strong> {profile.address}</p>
                                <p><strong>City:</strong> {profile.city}</p>
                                <p><strong>State:</strong> {profile.state}</p>
                                <p><strong>Pincode:</strong> {profile.pincode}</p>
                                <p><strong>DOB:</strong> {profile.dob ? new Date(profile.dob).toLocaleDateString("en-IN") : ""}</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <ToastContainer position="top-right" autoClose={4000} />

            <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          outline: none;
          transition: all 0.2s;
        }
        .input:focus {
          border-color: #f43f5e;
          box-shadow: 0 0 0 2px #fecdd3;
        }
      `}</style>
        </div>
    );
}
