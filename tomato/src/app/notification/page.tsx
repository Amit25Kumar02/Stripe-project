"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import {
    Home, User, LogOut, X, Menu, Bell, BellOff,
    ChevronRight, CheckCircle, AlertCircle,
    Info, Trash2, CheckCheck,
} from "lucide-react";
// import axios from "axios";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'promotional';
    read: boolean;
    createdAt: string;
    actionUrl?: string;
}

export default function NotificationsPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread' | 'promotional'>('all');
    const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

    // Check token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) router.push("/login");
    }, [router]);

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                // Simulated API call - replace with your actual API
                // const res = await axios.get(`/api/notification`, {
                //     headers: { Authorization: `Bearer ${token}` },
                // });
                // console.log("Response",res)

                // For demo purposes, using mock data
                const mockNotifications: Notification[] = [
                    {
                        id: "1",
                        title: "Order Confirmed",
                        message: "Your order #ORD-12345 has been confirmed and is being processed.",
                        type: "success",
                        read: false,
                        createdAt: new Date().toISOString(),
                        actionUrl: "/orders/12345"
                    },
                    {
                        id: "2",
                        title: "Delivery Update",
                        message: "Your order will be delivered between 7:00 PM - 8:00 PM today.",
                        type: "info",
                        read: false,
                        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    },
                    {
                        id: "3",
                        title: "Special Offer",
                        message: "Get 20% off on your next order. Use code: SAVE20",
                        type: "promotional",
                        read: true,
                        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    },
                    {
                        id: "4",
                        title: "Payment Successful",
                        message: "Your payment of ₹450 has been processed successfully.",
                        type: "success",
                        read: true,
                        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    },
                    {
                        id: "5",
                        title: "Restaurant Closed",
                        message: "Your favorite restaurant is temporarily closed today.",
                        type: "warning",
                        read: true,
                        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    },
                    {
                        id: "6",
                        title: "New Feature",
                        message: "Check out our new group ordering feature!",
                        type: "info",
                        read: true,
                        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    }
                ];

                setNotifications(mockNotifications);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load notifications.");
            }
        };

        fetchNotifications();
    }, []);

    // Filter notifications based on current filter
    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.read;
        if (filter === 'promotional') return notification.type === 'promotional';
        return true;
    });

    // Mark notification as read
    const markAsRead = async () => {
        toast.success("This feature will be available soon!");
        // try {
        //     const token = localStorage.getItem("token");
        //     await axios.patch(`/api/notifications/${id}/read`, {}, {
        //         headers: { Authorization: `Bearer ${token}` },
        //     });

        //     setNotifications(prev =>
        //         prev.map(notif =>
        //             notif.id === id ? { ...notif, read: true } : notif
        //         )
        //     );
        // } catch (err) {
        //     console.error(err);
        //     toast.error("Failed to mark as read.");
        // }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        toast.success("This feature will be available soon!");
        // try {
        //     const token = localStorage.getItem("token");
        //     await axios.patch(`/api/notifications/read-all`, {}, {
        //         headers: { Authorization: `Bearer ${token}` },
        //     });

        //     setNotifications(prev => 
        //         prev.map(notif => ({ ...notif, read: true }))
        //     );
        //     setSelectedNotifications([]);
        //     toast.success("All notifications marked as read");
        // } catch (err) {
        //     console.error(err);
        //     toast.error("Failed to mark all as read.");
        // }
    };

    // Delete notification
    const deleteNotification = async () => {
        toast.success("This feature will be available soon!");

        // try {
        //     const token = localStorage.getItem("token");
        //     await axios.delete(`/api/notifications/${id}`, {
        //         headers: { Authorization: `Bearer ${token}` },
        //     });

        //     setNotifications(prev => prev.filter(notif => notif.id !== id));
        //     setSelectedNotifications(prev => prev.filter(selectedId => selectedId !== id));
        //     toast.success("Notification deleted");
        // } catch (err) {
        //     console.error(err);
        //     toast.error("Failed to delete notification.");
        // }
    };

    // Delete selected notifications
    const deleteSelected = async () => {
        toast.success("This feature will be available soon!");
        // try {
        //     const token = localStorage.getItem("token");
        //     await axios.post(`/api/notifications/delete-batch`, {
        //         notificationIds: selectedNotifications
        //     }, {
        //         headers: { Authorization: `Bearer ${token}` },
        //     });

        //     setNotifications(prev => 
        //         prev.filter(notif => !selectedNotifications.includes(notif.id))
        //     );
        //     setSelectedNotifications([]);
        //     toast.success("Selected notifications deleted");
        // } catch (err) {
        //     console.error(err);
        //     toast.error("Failed to delete notifications.");
        // }
    };

    // Toggle notification selection
    const toggleSelection = (id: string) => {
        setSelectedNotifications(prev =>
            prev.includes(id)
                ? prev.filter(selectedId => selectedId !== id)
                : [...prev, id]
        );
    };

    // Select all visible notifications
    const selectAllVisible = () => {
        const visibleIds = filteredNotifications.map(notif => notif.id);
        setSelectedNotifications(visibleIds);
    };

    // Clear selection
    const clearSelection = () => {
        setSelectedNotifications([]);
    };

    // Get notification icon based on type
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="text-green-500" size={20} />;
            case 'warning':
                return <AlertCircle className="text-yellow-500" size={20} />;
            case 'promotional':
                return <Bell className="text-purple-500" size={20} />;
            default:
                return <Info className="text-blue-500" size={20} />;
        }
    };

    // Format date relative to now
    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString("en-IN");
    };

    const unreadCount = notifications.filter(n => !n.read).length;


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
                className={`fixed z-50 bg-white backdrop-blur-lg shadow-xl w-64 min-h-screen p-8 transition-all duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0 lg:fixed lg:bg-white lg:backdrop-blur-none lg:shadow-none`}
            >
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-rose-600 bg-clip-text text-transparent">
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
                        { icon: User, label: "Profile", href: "/profile" },
                        { icon: Bell, label: "Notifications", href: "/notification", active: true, badge: unreadCount },
                    ].map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 relative ${item.active
                                ? "bg-gradient-to-r from-rose-600 to-rose-600 text-white shadow-lg shadow-rose-200"
                                : "text-gray-600 hover:bg-rose-100 hover:shadow-lg hover:text-rose-600"
                                }`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                            {item.active && <ChevronRight size={16} className="ml-auto" />}
                            {item.badge && item.badge > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}

                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("user");
                            router.push("/login");
                        }}
                        className="flex items-center gap-4 p-4 cursor-pointer rounded-2xl text-gray-600 hover:bg-white hover:shadow-lg hover:text-rose-600 w-full transition-all duration-200"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-6 lg:p-8 overflow-y-auto">
                {/* Mobile Header */}
                <div className="lg:hidden fixed flex items-center justify-between mb-8">
                    <button
                        className="p-3 bg-rose-600 rounded-full shadow-lg text-white hover:shadow-xl transition-shadow"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <Menu size={20} />
                    </button>

                </div>

                {/* Header */}
                <div className="max-w-6xl mt-12 lg:mt-2 mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Notifications
                            </h1>
                            <p className="text-gray-500 mt-2">
                                {unreadCount > 0
                                    ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                                    : "All caught up!"
                                }
                            </p>
                        </div>

                        <div className="flex gap-3 mt-4 lg:mt-0">
                            {selectedNotifications.length > 0 ? (
                                <>
                                    <button
                                        onClick={deleteSelected}
                                        className="flex items-center cursor-pointer
                                         gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                        Delete ({selectedNotifications.length})
                                    </button>
                                    <button
                                        onClick={clearSelection}
                                        className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={markAllAsRead}
                                        disabled={unreadCount === 0}
                                        className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-rose-200 transition-all duration-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCheck size={16} />
                                        Mark all as read
                                    </button>
                                    <button
                                        onClick={selectAllVisible}
                                        className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-rose-200 transition-all duration-200 text-gray-700"
                                    >
                                        Select all
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-6 inline-flex w-full md:w-fit ">
                        {[
                            { key: 'all', label: 'All', count: notifications.length },
                            { key: 'unread', label: 'Unread', count: unreadCount },
                            { key: 'promotional', label: 'Promotional', count: notifications.filter(n => n.type === 'promotional').length },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onClick={() => setFilter(tab.key as any)}
                                className={`px-2 md:px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-2 ${filter === tab.key
                                    ? 'bg-rose-500 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-xs" >{tab.label}</span>
                                {tab.count > 0 && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === tab.key
                                        ? 'bg-white text-rose-500'
                                        : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Notifications List */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        {filteredNotifications.length === 0 ? (
                            <div className="text-center py-16">
                                <BellOff size={64} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">No notifications</h3>
                                <p className="text-gray-500">
                                    {filter === 'all'
                                        ? "You're all caught up!"
                                        : `No ${filter} notifications`
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {filteredNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-6 transition-all duration-200 hover:bg-gray-50 ${selectedNotifications.includes(notification.id) ? 'bg-rose-50' : ''
                                            } ${!notification.read ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Selection Checkbox */}
                                            <input
                                                type="checkbox"
                                                checked={selectedNotifications.includes(notification.id)}
                                                onChange={() => toggleSelection(notification.id)}
                                                className="mt-1.5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                                            />

                                            {/* Notification Icon */}
                                            <div className="flex-shrink-0">
                                                {getNotificationIcon(notification.type)}
                                            </div>

                                            {/* Notification Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                                                    <div>
                                                        <h3
                                                            className={`font-semibold ${!notification.read ? "text-gray-900" : "text-gray-700"
                                                                }`}
                                                        >
                                                            {notification.title}
                                                        </h3>
                                                        <p className="text-gray-600 mt-1">{notification.message}</p>
                                                    </div>

                                                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                                        <span className="text-sm text-gray-500 whitespace-nowrap">
                                                            {formatRelativeTime(notification.createdAt)}
                                                        </span>

                                                        {!notification.read && (
                                                            <button
                                                                onClick={() => markAsRead}
                                                                className="p-1 text-gray-400 cursor-pointer hover:text-rose-600 transition-colors"
                                                                title="Mark as read"
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => deleteNotification}
                                                            className="p-1 text-gray-400 cursor-pointer hover:text-red-600 transition-colors"
                                                            title="Delete notification"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {notification.actionUrl && (
                                                    <button
                                                       
                                                        className="mt-3 text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center gap-1"
                                                    >
                                                        View details
                                                        <ChevronRight size={14} />
                                                    </button>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notification Preferences */}
                    <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                { label: "Order Updates", description: "Get notified about your order status" },
                                { label: "Promotional Offers", description: "Receive special offers and discounts" },
                                { label: "Security Alerts", description: "Important security and account notifications" },
                                { label: "New Features", description: "Updates about new platform features" },
                            ].map((pref) => (
                                <div key={pref.label} className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl">
                                    <div>
                                        <p className="font-medium text-gray-900">{pref.label}</p>
                                        <p className="text-sm text-gray-500">{pref.description}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <ToastContainer
                position="top-right"
                autoClose={3000}
            />
        </div>
    );
}