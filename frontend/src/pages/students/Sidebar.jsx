import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { HiOutlineMenuAlt1, HiLogout, HiHome, HiCalendar, HiAcademicCap, HiCog } from "react-icons/hi";
import { motion } from "framer-motion";
import { Tooltip } from "react-tooltip";

const Sidebar = ({ isSidebarExpanded, setIsSidebarExpanded }) => {
    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const NavItems = [
        { icon: HiHome, label: "Dashboard", path: "/student-dashboard", tooltip: "View your dashboard" },
        { icon: HiCalendar, label: "Timetable", path: "/student-timetable", tooltip: "Check your class schedule" },
        // Note: /student-courses route is not defined in App.jsx; included for future compatibility
        { icon: HiAcademicCap, label: "My Courses", path: "/student-courses", tooltip: "View your enrolled courses" },
        { icon: HiCog, label: "Settings", path: "/student-settings", tooltip: "Account settings" },
    ];

    const handleLogout = () => {
        setAuth(null);
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <aside
            className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out ${
                isSidebarExpanded ? "w-64" : "w-16"
            } bg-blue-900 dark:bg-blue-950 shadow-lg`}
        >
            <button
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="absolute top-4 right-4 text-white bg-blue-700 hover:bg-blue-600 rounded-md p-1 transition-colors duration-200"
                data-tooltip-id="toggle-sidebar"
                data-tooltip-content={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            >
                <HiOutlineMenuAlt1 className="w-6 h-6" />
            </button>
            <div className="flex items-center justify-center h-16 border-b border-blue-800 dark:border-blue-900">
                <Link to="/landingpage" className="flex items-center">
                    <motion.img
                        className="w-8 h-8 mr-2"
                        src="logoAS.svg"
                        alt="logo"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                    />
                    {isSidebarExpanded && (
                        <span className="text-lg font-semibold text-white bg-clip-text">
                            Academic Scheduler
                            {/* Sinhala: අධ්‍යයන සැලසුම්කරු */}
                        </span>
                    )}
                </Link>
            </div>
            <nav className="mt-6 px-3">
                <ul className="space-y-2">
                    {NavItems.map((item, index) => (
                        <li key={index}>
                            <Link
                                to={item.path}
                                className={`flex items-center p-3 rounded-lg transition-all duration-200 hover:shadow-sm ${
                                    location.pathname === item.path
                                        ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white"
                                        : "text-white hover:bg-blue-800"
                                } ${isSidebarExpanded ? "justify-start" : "justify-center"}`}
                                data-tooltip-id={`nav-${index}`}
                                data-tooltip-content={item.tooltip}
                            >
                                <item.icon className="w-6 h-6" />
                                {isSidebarExpanded && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                            </Link>
                            {!isSidebarExpanded && <Tooltip id={`nav-${index}`} place="right" />}
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-800 dark:border-blue-900">
                <motion.button
                    onClick={handleLogout}
                    className={`w-full py-3 px-4 bg-orange-600 dark:bg-orange-700 text-white rounded-lg transition-all duration-200 flex items-center ${
                        isSidebarExpanded ? "justify-start" : "justify-center"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-tooltip-id="logout"
                    data-tooltip-content="Sign out of your account"
                >
                    <HiLogout className="w-6 h-6" />
                    {isSidebarExpanded && <span className="ml-10 text-sm font-medium">Logout</span>}
                </motion.button>

            </div>

        </aside>
    );
};

export default Sidebar;