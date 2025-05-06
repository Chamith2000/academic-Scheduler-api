import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import {
    HiOutlineMenuAlt1,
    HiLogout,
    HiHome,
    HiAcademicCap,
    HiCog,
    HiDocumentText,
    HiAdjustments,
    HiUserGroup,
    HiRefresh,
} from "react-icons/hi";
import { Tooltip } from "react-tooltip";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [systemStats, setSystemStats] = useState({
        activeSessions: 0,
        systemStatus: "Loading...",
        lastLogin: "Loading...",
        browser: "Loading...",
    });

    const NavItems = [
        { icon: HiHome, label: "Dashboard", path: "/instructor-dashboard", bgGradient: "from-indigo-600 to-blue-600", tooltip: "View your dashboard" },
        { icon: HiAcademicCap, label: "Courses", path: "/instructor-courses", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Manage your courses" },
        { icon: HiDocumentText, label: "Reports", path: "/instructor-reports", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Download reports" },
        { icon: HiAdjustments, label: "Preferences", path: "/instructor-preferences", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Set availability" },
        { icon: HiCog, label: "Settings", path: "/settings", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Account settings" },
    ];

    const fetchUserData = async () => {
        try {
            if (!auth?.accessToken) {
                navigate("/login");
                return;
            }

            const userInfo = JSON.parse(localStorage.getItem("user"));
            if (!userInfo) {
                navigate("/login");
                return;
            }

            setUserData(userInfo);

            try {
                const statsResponse = await axios.get("http://localhost:8080/api/stats/user-stats", {
                    headers: { Authorization: `Bearer ${userInfo.accessToken}` },
                });

                if (statsResponse.data) {
                    setSystemStats({
                        activeSessions: statsResponse.data.activeSessions || 1,
                        systemStatus: statsResponse.data.systemStatus || "Online",
                        lastLogin: formatLoginTime(statsResponse.data.lastLogin) || "Just now",
                        browser: getBrowserInfo(),
                    });
                }
            } catch (statsError) {
                console.error("Error fetching system stats:", statsError);
                setSystemStats({
                    activeSessions: 1,
                    systemStatus: "Online",
                    lastLogin: "Just now",
                    browser: getBrowserInfo(),
                });
            }
        } catch (error) {
            console.error("Error in dashboard setup:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
        const refreshInterval = setInterval(refreshSystemStats, 60000);
        return () => clearInterval(refreshInterval);
    }, [auth, navigate]);

    const refreshSystemStats = async () => {
        setIsRefreshing(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem("user"));
            if (!userInfo?.accessToken) return;

            const statsResponse = await axios.get("http://localhost:8080/api/stats/user-stats", {
                headers: { Authorization: `Bearer ${userInfo.accessToken}` },
            });

            if (statsResponse.data) {
                setSystemStats({
                    activeSessions: statsResponse.data.activeSessions || 1,
                    systemStatus: statsResponse.data.systemStatus || "Online",
                    lastLogin: formatLoginTime(statsResponse.data.lastLogin) || "Just now",
                    browser: getBrowserInfo(),
                });
            }
        } catch (error) {
            console.error("Error refreshing system stats:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const formatLoginTime = (timestamp) => {
        if (!timestamp) return "Just now";
        try {
            const loginDate = new Date(timestamp);
            const now = new Date();
            const diffMs = now - loginDate;
            const diffMins = Math.round(diffMs / 60000);

            if (diffMins < 1) return "Just now";
            if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;

            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;

            return loginDate.toLocaleString();
        } catch (e) {
            return "Just now";
        }
    };

    const getBrowserInfo = () => {
        const userAgent = navigator.userAgent;
        if (userAgent.includes("Firefox")) return "Firefox";
        if (userAgent.includes("Edge")) return "Edge";
        if (userAgent.includes("Chrome")) return "Chrome";
        if (userAgent.includes("Safari")) return "Safari";
        if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera";
        if (userAgent.includes("MSIE") || userAgent.includes("Trident/")) return "Internet Explorer";
        return userAgent.split(" ").slice(-1)[0].split("/")[0];
    };

    const handleLogout = () => {
        setAuth(null);
        localStorage.removeItem("user");
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-neutral-800">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                        Loading your dashboard... {/* Sinhala: ඔබගේ උපකරණ පුවරුව පූරණය වෙමින්... */}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <section className="min-h-screen flex bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-neutral-800">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out ${
                    isExpanded ? "w-64" : "w-20"
                } bg-white dark:bg-gray-800 shadow-2xl rounded-r-2xl`}
            >
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="absolute top-4 right-4 z-50 text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors duration-200"
                    data-tooltip-id="toggle-sidebar"
                    data-tooltip-content={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                    <HiOutlineMenuAlt1 className="w-6 h-6" />
                </button>
                <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-700">
                    <Link to="/landingpage" className="flex items-center group">
                        <motion.img
                            className="w-10 h-10 mr-3"
                            src="logoAS.svg"
                            alt="logo"
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            transition={{ duration: 0.2 }}
                        />
                        {isExpanded && (
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
                                Academic Scheduler
                            </span>
                        )}
                    </Link>
                </div>
                <nav className="mt-8 px-4">
                    <ul className="space-y-2">
                        {NavItems.map((item, index) => (
                            <li key={index}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center p-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md ${
                                        location.pathname === item.path
                                            ? `bg-gradient-to-r ${item.bgGradient} text-white`
                                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    } ${isExpanded ? "justify-start" : "justify-center"}`}
                                    data-tooltip-id={`nav-${index}`}
                                    data-tooltip-content={item.tooltip}
                                >
                                    <item.icon className="w-6 h-6" />
                                    {isExpanded && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                                </Link>
                                {!isExpanded && <Tooltip id={`nav-${index}`} place="right" />}
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
                    <motion.button
                        onClick={handleLogout}
                        className={`w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-medium rounded-lg transition-all duration-200 flex items-center ${
                            isExpanded ? "justify-start" : "justify-center"
                        }`}
                        whileHover={{ scale: 1.02, boxShadow: "0 0 10px rgba(234, 179, 8, 0.5)" }}
                        whileTap={{ scale: 0.98 }}
                        data-tooltip-id="logout"
                        data-tooltip-content="Sign out of your account"
                    >
                        <HiLogout className="w-5 h-5" />
                        {isExpanded && <span className="ml-3">Logout</span>}
                    </motion.button>
                    <Tooltip id="logout" place="top" />
                </div>
                <Tooltip id="toggle-sidebar" place="right" />
            </aside>

            {/* Main Content */}
            <main className={`flex-grow p-6 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-20"}`}>
                <AnimatePresence>
                    <motion.div
                        className="main-content p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Welcome Banner */}
                        <section className="mb-8">
                            <motion.div
                                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-lg shadow-lg"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h1 className="text-3xl font-bold">
                                    Welcome, {userData?.user || "User"}!
                                    {/* Sinhala: ආයුබෝවන්, {userData?.user || "පරිශීලක"}! */}
                                </h1>
                                <p className="mt-2 text-indigo-100">
                                    Manage your academic tasks efficiently with Academic Scheduler.
                                    {/* Sinhala: ඔබේ අධ්‍යයන කටයුතු කාර්යක්ෂමව කළමනාකරණය කරන්න */}
                                </p>
                            </motion.div>
                        </section>

                        {/* User Info */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                                Account Information
                                {/* Sinhala: ගිණුම් තොරතුරු */}
                            </h2>
                            <motion.div
                                className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                                        <p className="font-medium text-gray-800 dark:text-white">{userData?.user}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                                        <div className="flex items-center">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    userData?.role === "INSTRUCTOR"
                                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                        : userData?.role === "STUDENT"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                }`}
                                            >
                                                {userData?.role}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        {/* Quick Actions Section */}
                        {userData?.role === "INSTRUCTOR" && (
                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                                    Quick Actions
                                    {/* Sinhala: ඉක්මන් ක්‍රියා */}
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <DashboardCard
                                        title="Manage Courses"
                                        description="View and manage your courses"
                                        icon={<HiAcademicCap className="w-6 h-6" />}
                                        link="/instructor-courses"
                                        tooltip="Access your course list"
                                    />
                                    <DashboardCard
                                        title="Settings"
                                        description="Manage your account settings"
                                        icon={<HiCog className="w-6 h-6" />}
                                        link="/settings"
                                        tooltip="Update your profile"
                                    />
                                </div>
                            </section>
                        )}

                        {/* Stats Section */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                                    System Overview
                                    {/* Sinhala: පද්ධති දළ විශ්ලේෂණය */}
                                </h2>
                                <motion.button
                                    onClick={refreshSystemStats}
                                    className={`flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                                        isRefreshing ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={isRefreshing}
                                >
                                    {isRefreshing ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    ) : (
                                        <HiRefresh className="h-4 w-4 mr-2" />
                                    )}
                                    Refresh
                                    {/* Sinhala: නැවුම් කරන්න */}
                                </motion.button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard
                                    title="Active Sessions"
                                    value={systemStats.activeSessions}
                                    icon={<HiUserGroup className="h-6 w-6 text-indigo-600" />}
                                    tooltip="Number of active user sessions"
                                />
                                <StatCard
                                    title="System Status"
                                    value={systemStats.systemStatus}
                                    icon={
                                        <svg
                                            className="h-6 w-6 text-green-600"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                    }
                                    tooltip="Current system status"
                                />
                                <StatCard
                                    title="Last Login"
                                    value={systemStats.lastLogin}
                                    icon={
                                        <svg
                                            className="h-6 w-6 text-purple-600"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                    }
                                    tooltip="Time of your last login"
                                />
                                <StatCard
                                    title="Browser"
                                    value={systemStats.browser}
                                    icon={
                                        <svg
                                            className="h-6 w-6 text-orange-600"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="2" y1="12" x2="22" y2="12"></line>
                                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                        </svg>
                                    }
                                    tooltip="Current browser used"
                                />
                            </div>
                        </section>
                    </motion.div>
                </AnimatePresence>
            </main>
        </section>
    );
};

// Dashboard Card Component
const DashboardCard = ({ title, description, icon, link, tooltip }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            className="relative bg-white dark:bg-gray-750 rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden"
            onClick={() => navigate(link)}
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            data-tooltip-id={`card-${title}`}
            data-tooltip-content={tooltip}
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-blue-600"></div>
            <div className="flex items-center mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    {icon}
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
            <div className="mt-4 flex items-center text-indigo-600 dark:text-indigo-400 font-medium">
                <span>Access</span>
                <svg
                    className="ml-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </div>
            <Tooltip id={`card-${title}`} place="top" />
        </motion.div>
    );
};

// Stat Card Component
const StatCard = ({ title, value, icon, tooltip }) => {
    return (
        <motion.div
            className="bg-white dark:bg-gray-750 rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            data-tooltip-id={`stat-${title}`}
            data-tooltip-content={tooltip}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-xl font-semibold text-gray-800 dark:text-white">{value}</p>
                </div>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">{icon}</div>
            </div>
            <Tooltip id={`stat-${title}`} place="top" />
        </motion.div>
    );
};

export default Dashboard;