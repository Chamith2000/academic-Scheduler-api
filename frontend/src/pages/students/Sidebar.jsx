import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { HiOutlineMenuAlt1, HiLogout, HiHome, HiCalendar, HiAcademicCap, HiCog } from "react-icons/hi";

const Sidebar = ({ isSidebarExpanded, setIsSidebarExpanded }) => {
    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const NavItems = [
        { icon: HiHome, label: "Dashboard", path: "/student-dashboard" },
        { icon: HiCalendar, label: "Timetable", path: "/student-timetable" },
        { icon: HiAcademicCap, label: "My Courses", path: "/student-courses" },
        { icon: HiCog, label: "Settings", path: "/student-settings" },
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
            } bg-gradient-to-b from-blue-700 to-blue-900 shadow-xl`}
        >
            <button
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="absolute top-4 right-4 text-white bg-blue-600 hover:bg-blue-500 rounded-full p-2 transition-colors duration-200"
            >
                <HiOutlineMenuAlt1 className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-center h-16 border-b border-blue-800">
                <Link to="/landingpage" className="flex items-center">
                    <img
                        className="w-10 h-10"
                        src="logoAS.svg"
                        alt="logo"
                    />
                    {isSidebarExpanded && (
                        <span className="text-xl font-bold text-white ml-2">Academic Scheduler</span>
                    )}
                </Link>
            </div>
            <nav className="mt-6 px-3">
                <ul className="space-y-2">
                    {NavItems.map((item, index) => (
                        <li key={index}>
                            <Link
                                to={item.path}
                                className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
                                    location.pathname === item.path
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "text-blue-100 hover:bg-blue-800 hover:text-white"
                                } ${isSidebarExpanded ? "justify-start" : "justify-center"}`}
                            >
                                <item.icon className="w-6 h-6" />
                                {isSidebarExpanded && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-800">
                <button
                    onClick={handleLogout}
                    className={`w-full py-3 px-4 bg-orange-600 text-white rounded-xl transition-all duration-200 flex items-center ${
                        isSidebarExpanded ? "justify-start" : "justify-center"
                    } hover:bg-orange-700`}
                >
                    <HiLogout className="w-6 h-6" />
                    {isSidebarExpanded && <span className="ml-10 text-sm font-medium">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;