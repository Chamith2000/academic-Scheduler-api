import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    HiOutlineMenuAlt1,
    HiLogout,
    HiHome,
    HiCalendar,
    HiAcademicCap,
    HiCog,
    HiDocumentText,
    HiAdjustments // Using this icon for Preferences
} from "react-icons/hi";
import useAuth from "../hooks/useAuth";

export default function InstructorDashboard({ children }) {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleLogout = () => {
        setAuth(null);
        localStorage.removeItem("user");
        navigate("/login");
    };

    const NavItems = [
        {
            icon: HiHome,
            label: "Dashboard",
            path: "/dashboard",
            bgGradient: "from-blue-500 to-blue-700"
        },
        {
            icon: HiCalendar,
            label: "Timetable",
            path: "/instructor-timetable",
            bgGradient: "from-blue-500 to-blue-700"
        },
        {
            icon: HiAcademicCap,
            label: "Courses",
            path: "/instructor-courses",
            bgGradient: "from-blue-500 to-blue-700"
        },
        {
            icon: HiDocumentText,
            label: "Reports",
            path: "/instructor-reports",
            bgGradient: "from-blue-500 to-blue-700"
        },
        {
            icon: HiAdjustments, // New Preferences item
            label: "Preferences",
            path: "/instructor-preferences",
            bgGradient: "from-blue-500 to-blue-700"
        },
        {
            icon: HiCog,
            label: "Settings",
            path: "settings",
            bgGradient: "from-blue-500 to-blue-700"
        }
    ];

    return (
        <section className="min-h-screen flex bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-neutral-800">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out 
                    ${isExpanded ? 'w-64' : 'w-20'} 
                    bg-white dark:bg-gray-800 shadow-xl`}
            >
                {/* Sidebar Toggle */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="absolute top-4 right-4 z-50 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                    <HiOutlineMenuAlt1 className="w-6 h-6" />
                </button>

                {/* Logo */}
                <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-700">
                    <Link to="/landingpage" className="flex items-center">
                        <img
                            className="w-10 h-10 mr-3"
                            src="logoAS.svg"
                            alt="logo"
                        />
                        {isExpanded && (
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                                Academic Scheduler
                            </span>
                        )}
                    </Link>
                </div>

                {/*/!* Profile Section *!/*/}
                {/*{auth && (*/}
                {/*    <div className="px-4 py-6 border-b border-gray-200 dark:border-gray-700">*/}
                {/*        <div className="flex items-center">*/}
                {/*            <div className="flex-shrink-0">*/}
                {/*                <img*/}
                {/*                    className="w-12 h-12 rounded-full object-cover"*/}
                {/*                    src={auth.profilePicture || "/default-avatar.png"}*/}
                {/*                    alt="Profile"*/}
                {/*                />*/}
                {/*            </div>*/}
                {/*            {isExpanded && (*/}
                {/*                <div className="ml-4">*/}
                {/*                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">*/}
                {/*                        {auth.name}*/}
                {/*                    </h3>*/}
                {/*                    <p className="text-xs text-gray-500 dark:text-gray-400">*/}
                {/*                        {auth.department}*/}
                {/*                    </p>*/}
                {/*                </div>*/}
                {/*            )}*/}
                {/*        </div>*/}
                {/*        {isExpanded && (*/}
                {/*            <Link*/}
                {/*                to="/instructor-profile"*/}
                {/*                className="mt-3 block text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"*/}
                {/*            >*/}
                {/*                View Profile*/}
                {/*            </Link>*/}
                {/*        )}*/}
                {/*    </div>*/}
                {/*)}*/}

                {/* Navigation Items */}
                <nav className="mt-8 px-4">
                    <ul className="space-y-2">
                        {NavItems.map((item, index) => (
                            <li key={index}>
                                <Link
                                    to={item.path}
                                    className={`
                                        flex items-center p-3 rounded-lg transition-all duration-300 
                                        ${location.pathname === item.path
                                        ? `bg-gradient-to-r ${item.bgGradient} text-white`
                                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}
                                        ${isExpanded ? 'justify-start' : 'justify-center'}
                                    `}
                                >
                                    <item.icon className="w-6 h-6" />
                                    {isExpanded && (
                                        <span className="ml-3 text-sm font-medium">
                                            {item.label}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleLogout}
                        className={`
                            w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-yellow-600 
                            hover:from-yellow-500 hover:to-yellow-700 
                            text-gray-900 font-medium rounded-lg 
                            transition-all duration-200 transform hover:scale-[1.02] 
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 
                            shadow-lg hover:shadow-xl flex items-center 
                            ${isExpanded ? 'justify-start' : 'justify-center'}
                        `}
                    >
                        <HiLogout className="w-5 h-5" />
                        {isExpanded && <span className="ml-3">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main
                className={`
                    flex-grow p-6 transition-all duration-300 
                    ${isExpanded ? 'ml-64' : 'ml-20'}
                `}
            >
                <div className="main-content p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    {children}
                </div>
            </main>
        </section>
    );
}