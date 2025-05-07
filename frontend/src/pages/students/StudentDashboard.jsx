import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { HiUserGroup, HiRefresh, HiAcademicCap, HiCalendar } from "react-icons/hi";
import Layout from "./Layout";

const StudentDashboard = () => {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [systemStats, setSystemStats] = useState({
        activeSessions: 0,
        systemStatus: "Loading...",
        lastLogin: "Loading...",
        browser: "Loading...",
    });

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
                timeout: 5000,
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

    const getInitials = (username) => {
        if (!username) return "U";
        return username.charAt(0).toUpperCase();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <Layout>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                {/* Header Section */}
                <header className="mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-semibold">
                            {getInitials(userData?.user)}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                                Welcome, {userData?.user || "Student"}!
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                                Here's an overview of your academic dashboard.
                            </p>
                        </div>
                    </div>
                </header>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Account Information</h2>
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                                <p className="font-medium text-gray-800 dark:text-white">{userData?.user}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    STUDENT
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Navigation Cards Section */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div
                            onClick={() => navigate("/student-courses")}
                            className="cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full">
                                    <HiAcademicCap className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">View Courses</h3>
                                    <p className="text-sm text-gray-200">
                                        Explore your enrolled courses and program details.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div
                            onClick={() => navigate("/student-timetable")}
                            className="cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full">
                                    <HiCalendar className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">View Timetable</h3>
                                    <p className="text-sm text-gray-200">
                                        Check your class schedule and upcoming sessions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">System Overview</h2>
                        <button
                            onClick={refreshSystemStats}
                            className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 ${
                                isRefreshing ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                            {isRefreshing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            ) : (
                                <HiRefresh className="h-4 w-4 mr-2" />
                            )}
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Active Sessions"
                            value={systemStats.activeSessions}
                            icon={<HiUserGroup className="h-5 w-5 text-blue-600" />}
                        />
                        <StatCard
                            title="System Status"
                            value={systemStats.systemStatus}
                            icon={
                                <svg
                                    className="h-5 w-5 text-green-600"
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
                        />
                        <StatCard
                            title="Last Login"
                            value={systemStats.lastLogin}
                            icon={
                                <svg
                                    className="h-5 w-5 text-purple-600"
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
                        />
                        <StatCard
                            title="Browser"
                            value={systemStats.browser}
                            icon={
                                <svg
                                    className="h-5 w-5 text-orange-600"
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
                        />
                    </div>
                </section>
            </div>
        </Layout>
    );
};

const StatCard = ({ title, value, icon }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-lg font-medium text-gray-800 dark:text-white">{value}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">{icon}</div>
            </div>
        </div>
    );
};

export default StudentDashboard;