import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import {
    HiOutlineMenuAlt1,
    HiLogout,
    HiHome,
    HiCalendar,
    HiAcademicCap,
    HiCog,
    HiDocumentText,
    HiAdjustments,
    HiUserGroup,
    HiRefresh
} from "react-icons/hi";

const Dashboard = () => {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [systemStats, setSystemStats] = useState({
        activeSessions: 0,
        systemStatus: "Loading...",
        lastLogin: "Loading...",
        browser: "Loading..."
    });

    const NavItems = [
        { icon: HiHome, label: "Dashboard", path: "/dashboard", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiCalendar, label: "Timetable", path: "/instructor-timetable", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiAcademicCap, label: "Courses", path: "/instructor-courses", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiDocumentText, label: "Reports", path: "/instructor-reports", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiAdjustments, label: "Preferences", path: "/instructor-preferences", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiCog, label: "Settings", path: "/settings", bgGradient: "from-blue-500 to-blue-700" }
    ];

    const fetchUserData = async () => {
        try {
            // Check if user is authenticated
            if (!auth?.accessToken) {
                navigate("/login");
                return;
            }

            // Retrieve user data from localStorage
            const userInfo = JSON.parse(localStorage.getItem("user"));

            if (!userInfo) {
                navigate("/login");
                return;
            }

            setUserData(userInfo);

            // Fetch system statistics from API
            try {
                const statsResponse = await axios.get("http://localhost:8080/api/stats/user-stats", {
                    headers: {
                        Authorization: `Bearer ${userInfo.accessToken}`
                    }
                });

                if (statsResponse.data) {
                    setSystemStats({
                        activeSessions: statsResponse.data.activeSessions || 1,
                        systemStatus: statsResponse.data.systemStatus || "Online",
                        lastLogin: formatLoginTime(statsResponse.data.lastLogin) || "Just now",
                        browser: getBrowserInfo()
                    });
                }
            } catch (statsError) {
                console.error("Error fetching system stats:", statsError);
                // Fallback to sensible defaults with some dynamic data
                setSystemStats({
                    activeSessions: 1,
                    systemStatus: "Online",
                    lastLogin: "Just now",
                    browser: getBrowserInfo()
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

        // Set up periodic refresh of system stats (every 60 seconds)
        const refreshInterval = setInterval(refreshSystemStats, 60000);

        return () => clearInterval(refreshInterval);
    }, [auth, navigate]);

    // Function to refresh system stats
    const refreshSystemStats = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("user"));
            if (!userInfo?.accessToken) return;

            const statsResponse = await axios.get("http://localhost:8080/api/stats/user-stats", {
                headers: {
                    Authorization: `Bearer ${userInfo.accessToken}`
                }
            });

            if (statsResponse.data) {
                setSystemStats({
                    activeSessions: statsResponse.data.activeSessions || 1,
                    systemStatus: statsResponse.data.systemStatus || "Online",
                    lastLogin: formatLoginTime(statsResponse.data.lastLogin) || "Just now",
                    browser: getBrowserInfo()
                });
            }
        } catch (error) {
            console.error("Error refreshing system stats:", error);
        }
    };

    // Format the login time in a user-friendly way
    const formatLoginTime = (timestamp) => {
        if (!timestamp) return "Just now";

        try {
            const loginDate = new Date(timestamp);
            const now = new Date();
            const diffMs = now - loginDate;
            const diffMins = Math.round(diffMs / 60000);

            if (diffMins < 1) return "Just now";
            if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;

            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;

            return loginDate.toLocaleString();
        } catch (e) {
            return "Just now";
        }
    };

    // Get browser information from user agent
    const getBrowserInfo = () => {
        const userAgent = navigator.userAgent;

        // Extract browser name
        if (userAgent.indexOf("Firefox") > -1) {
            return "Firefox";
        } else if (userAgent.indexOf("Edge") > -1) {
            return "Edge";
        } else if (userAgent.indexOf("Chrome") > -1) {
            return "Chrome";
        } else if (userAgent.indexOf("Safari") > -1) {
            return "Safari";
        } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
            return "Opera";
        } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident/") > -1) {
            return "Internet Explorer";
        } else {
            return userAgent.split(" ").slice(-1)[0].split("/")[0];
        }
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
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <section className="min-h-screen flex bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-neutral-800">
            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'} bg-white dark:bg-gray-800 shadow-xl`}>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="absolute top-4 right-4 z-50 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                    <HiOutlineMenuAlt1 className="w-6 h-6" />
                </button>
                <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-700">
                    <Link to="/landingpage" className="flex items-center">
                        <img className="w-10 h-10 mr-3" src="logoAS.svg" alt="logo" />
                        {isExpanded && (
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
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
                                    className={`flex items-center p-3 rounded-lg transition-all duration-300 ${location.pathname === item.path ? `bg-gradient-to-r ${item.bgGradient} text-white` : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'} ${isExpanded ? 'justify-start' : 'justify-center'}`}
                                >
                                    <item.icon className="w-6 h-6" />
                                    {isExpanded && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleLogout}
                        className={`w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-gray-900 font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 shadow-lg hover:shadow-xl flex items-center ${isExpanded ? 'justify-start' : 'justify-center'}`}
                    >
                        <HiLogout className="w-5 h-5" />
                        {isExpanded && <span className="ml-3">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-grow p-6 transition-all duration-300 ${isExpanded ? 'ml-64' : 'ml-20'}`}>
                <div className="main-content p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    <h1 className="font-bold text-3xl mb-6">Dashboard</h1>

                    {/* User Info */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Account Information</h2>
                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                                    <p className="font-medium text-gray-800 dark:text-white">{userData?.user}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                                    <div className="flex items-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            userData?.role === "INSTRUCTOR"
                                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                : userData?.role === "STUDENT"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                        }`}>
                                            {userData?.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Quick Actions Section */}
                    {userData?.role === "INSTRUCTOR" && (
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <DashboardCard
                                    title="Manage Courses"
                                    description="View and manage your courses"
                                    icon={<HiAcademicCap className="w-6 h-6" />}
                                    link="/instructor-courses"
                                />
                                <DashboardCard
                                    title="Timetable"
                                    description="View your teaching schedule"
                                    icon={<HiCalendar className="w-6 h-6" />}
                                    link="/instructor-timetable"
                                />
                                <DashboardCard
                                    title="Settings"
                                    description="Manage your account settings"
                                    icon={<HiCog className="w-6 h-6" />}
                                    link="/settings"
                                />
                            </div>
                        </section>
                    )}

                    {userData?.role === "STUDENT" && (
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <DashboardCard
                                    title="My Courses"
                                    description="View your enrolled courses"
                                    icon={<HiAcademicCap className="w-6 h-6" />}
                                    link="/student-courses"
                                />
                                <DashboardCard
                                    title="Timetable"
                                    description="View your class schedule"
                                    icon={<HiCalendar className="w-6 h-6" />}
                                    link="/student-timetable"
                                />
                                <DashboardCard
                                    title="Settings"
                                    description="Manage your account settings"
                                    icon={<HiCog className="w-6 h-6" />}
                                    link="/settings"
                                />
                            </div>
                        </section>
                    )}

                    {/* Stats Section */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">System Overview</h2>
                            <button
                                onClick={refreshSystemStats}
                                className="text-blue-600 dark:text-blue-400 flex items-center text-sm"
                            >
                                <HiRefresh className="h-4 w-4 mr-1" />
                                Refresh
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Active Sessions"
                                value={systemStats.activeSessions}
                                icon={<HiUserGroup className="h-6 w-6 text-blue-600" />}
                            />
                            <StatCard
                                title="System Status"
                                value={systemStats.systemStatus}
                                icon={
                                    <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                }
                            />
                            <StatCard
                                title="Last Login"
                                value={systemStats.lastLogin}
                                icon={
                                    <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                }
                            />
                            <StatCard
                                title="Browser"
                                value={systemStats.browser}
                                icon={
                                    <svg className="h-6 w-6 text-orange-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="2" y1="12" x2="22" y2="12"></line>
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                    </svg>
                                }
                            />
                        </div>
                    </section>
                </div>
            </main>
        </section>
    );
};

// Dashboard Card Component
const DashboardCard = ({ title, description, icon, link }) => {
    const navigate = useNavigate();

    return (
        <div
            className="bg-white dark:bg-gray-750 rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => navigate(link)}
        >
            <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    {icon}
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
            <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium">
                <span>Access</span>
                <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ title, value, icon }) => {
    return (
        <div className="bg-white dark:bg-gray-750 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-xl font-semibold text-gray-800 dark:text-white">{value}</p>
                </div>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;