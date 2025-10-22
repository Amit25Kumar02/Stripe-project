"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { 
    Home, User, LogOut, X, Menu, Save, Edit, XCircle, 
    Mail, Phone, MapPin, Calendar, Shield, ChevronRight, 
    Camera, CreditCard, Bell
} from "lucide-react";
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
    createdAt: string;
    orderCount?: number;
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
        createdAt: "",
    });
    const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);

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

                const userData = res.data.user || {};
                setProfile({
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    address: userData.address || "",
                    state: userData.state || "",
                    city: userData.city || "",
                    pincode: userData.pincode || "",
                    dob: userData.dob || "",
                    createdAt: userData.createdAt || new Date().toISOString(),
                    orderCount: userData.orderCount || 0,
                });
                setOriginalProfile(res.data.user);
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

        setSaving(true);
        try {
            const storedUser = localStorage.getItem("user");
            const userId = storedUser ? JSON.parse(storedUser)?.id : null;
            if (!userId) throw new Error("User not found");

            await axios.patch(`/api/users/${userId}`, profile, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success("Profile updated successfully!");
            setOriginalProfile(profile);
            setEditMode(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    // Cancel edit (revert to last saved state)
    const handleCancel = () => {
        if (originalProfile) {
            setProfile(originalProfile);
        }
        setEditMode(false);
    };

    const initials = profile.name ? profile.name.charAt(0).toUpperCase() : "U";

    // Format the member since date
    const getMemberSinceYear = () => {
        if (!profile.createdAt) return "2024";
        
        try {
            const date = new Date(profile.createdAt);
            return date.getFullYear().toString();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return "2024";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-rose-50 to-white">
            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed z-50 bg-white backdrop-blur-lg shadow-xl w-64 min-h-screen p-8 transition-all duration-300 ease-in-out ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0 lg:fixed lg:bg-white lg:backdrop-blur-none lg:shadow-none`}
            >
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                     
                        <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                            Tomato
                        </span>
                    </div>
                    <button
                        className="lg:hidden text-gray-500 hover:text-rose-600 transition-colors"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="space-y-2">
                    {[
                        { icon: Home, label: "Home", href: "/" },
                        { icon: User, label: "Profile", href: "/profile", active: true },
                        { icon: Bell, label: "Notifications", href: "/notifications" },
                    ].map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
                                item.active
                                    ? "bg-gradient-to-r from-rose-600 to-rose-600 text-white shadow-lg shadow-rose-200"
                                    : "text-gray-600 hover:bg-rose-100 hover:shadow-lg hover:text-rose-600"
                            }`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                            {item.active && <ChevronRight size={16} className="ml-auto" />}
                        </Link>
                    ))}
                    
                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("user");
                            router.push("/login");
                        }}
                        className="flex items-center gap-4 p-4 rounded-2xl text-gray-600 hover:bg-rose-100 hover:shadow-lg hover:text-rose-600 w-full transition-all duration-200"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-6 lg:p-8 overflow-y-auto">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between mb-8">
                    <button
                        className="p-3 bg-white rounded-2xl shadow-lg text-rose-600 hover:shadow-xl transition-shadow"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <Menu size={20} />
                    </button>
                </div>

                {/* Profile Header */}
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                My Profile
                            </h1>
                            <p className="text-gray-500 mt-2">Manage your personal information and preferences</p>
                        </div>
                        
                        {!editMode && (
                            <button
                                onClick={() => setEditMode(true)}
                                className="mt-4 lg:mt-0 flex cursor-pointer items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-rose-200 transition-all duration-200 text-gray-700 hover:text-rose-600 font-medium"
                            >
                                <Edit size={18} />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Profile Card */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Profile Overview */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                {/* Avatar Section */}
                                <div className="text-center mb-8">
                                    <div className="relative inline-block">
                                        <div className="w-32 h-32 bg-gradient-to-br from-rose-100 to-rose-100 rounded-2xl flex items-center justify-center text-4xl font-bold text-rose-600 mb-4">
                                            {initials}
                                        </div>
                                        <button className="absolute bottom-2 right-2 p-2 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                                            <Camera size={16} className="text-gray-600" />
                                        </button>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                                    <p className="text-gray-500 text-sm mt-1">Member since {getMemberSinceYear()}</p>
                                </div>

                                {/* User Stats */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl">
                                        <div>
                                            <p className="text-sm text-gray-600">Total Orders</p>
                                            <p className="text-lg font-bold text-gray-900">{profile.orderCount || 0}</p>
                                        </div>
                                        <CreditCard size={20} className="text-rose-600" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
                                        <div>
                                            <p className="text-sm text-gray-600">Account Status</p>
                                            <p className="text-lg font-bold text-green-600">Active</p>
                                        </div>
                                        <Shield size={20} className="text-green-600" />
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-6 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-700">
                                        Change Password
                                    </button>
                                    <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-700">
                                        Privacy Settings
                                    </button>
                                    <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-700">
                                        Download Data
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Profile Details */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                {editMode ? (
                                    // Edit Mode
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Personal Information</h3>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {[
                                                { label: "Full Name", name: "name", type: "text", icon: User, required: true },
                                                { label: "Email Address", name: "email", type: "email", icon: Mail, required: true },
                                                { label: "Phone Number", name: "phone", type: "tel", icon: Phone },
                                                { label: "Date of Birth", name: "dob", type: "date", icon: Calendar },
                                                { label: "Address", name: "address", type: "text", icon: MapPin, fullWidth: true },
                                            ].map((field) => (
                                                <div key={field.name} className={field.fullWidth ? "md:col-span-2" : ""}>
                                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                        <field.icon size={16} />
                                                        {field.label}
                                                        {field.required && <span className="text-red-500">*</span>}
                                                    </label>
                                                    <input
                                                        name={field.name}
                                                        type={field.type}
                                                        value={profile[field.name as keyof UserProfile] || ""}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all duration-200 outline-none"
                                                        required={field.required}
                                                    />
                                                </div>
                                            ))}
                                            
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                    <MapPin size={16} />
                                                    City
                                                </label>
                                                <input
                                                    name="city"
                                                    type="text"
                                                    value={profile.city}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all duration-200 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                    <MapPin size={16} />
                                                    State
                                                </label>
                                                <input
                                                    name="state"
                                                    type="text"
                                                    value={profile.state}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all duration-200 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                    <MapPin size={16} />
                                                    Pincode
                                                </label>
                                                <input
                                                    name="pincode"
                                                    type="text"
                                                    value={profile.pincode}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all duration-200 outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="flex-1 flex items-center cursor-pointer justify-center gap-2 px-6 py-4 bg-gradient-to-r from-rose-600 to-rose-600 text-white rounded-2xl hover:shadow-lg hover:shadow-rose-200 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Save size={18} />
                                                {saving ? "Saving..." : "Save Changes"}
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="flex-1 flex items-center cursor-pointer justify-center gap-2 px-6 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:shadow-lg hover:border-rose-200 transition-all duration-200 font-semibold"
                                            >
                                                <XCircle size={18} />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // View Mode
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Personal Information</h3>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {[
                                                { icon: User, label: "Full Name", value: profile.name },
                                                { icon: Mail, label: "Email Address", value: profile.email },
                                                { icon: Phone, label: "Phone Number", value: profile.phone || "Not set" },
                                                { icon: Calendar, label: "Date of Birth", value: profile.dob ? new Date(profile.dob).toLocaleDateString("en-IN") : "Not set" },
                                                { icon: MapPin, label: "Address", value: profile.address || "Not set", fullWidth: true },
                                                { icon: MapPin, label: "City", value: profile.city || "Not set" },
                                                { icon: MapPin, label: "State", value: profile.state || "Not set" },
                                                { icon: MapPin, label: "Pincode", value: profile.pincode || "Not set" },
                                            ].map((item) => (
                                                <div key={item.label} className={item.fullWidth ? "md:col-span-2" : ""}>
                                                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                                                        <item.icon size={16} />
                                                        <span className="text-sm font-medium">{item.label}</span>
                                                    </div>
                                                    <p className="text-gray-900 font-medium pl-7">{item.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Security Notice */}
                                        <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-rose-100">
                                            <div className="flex items-start gap-3">
                                                <Shield size={20} className="text-blue-600 mt-0.5" />
                                                <div>
                                                    <h3 className="font-semibold text-blue-900 mb-1">Account Security</h3>
                                                    <p className="text-blue-700 text-sm">
                                                        Your personal information is protected with advanced security measures. 
                                                        We never share your data with third parties without your consent.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <ToastContainer 
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                toastClassName="rounded-2xl shadow-lg"
            />
        </div>
    );
}