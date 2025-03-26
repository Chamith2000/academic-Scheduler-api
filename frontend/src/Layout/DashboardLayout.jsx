import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { SiGoogleclassroom } from "react-icons/si";
import { FaUniversity, FaBuilding } from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";
import { MdOutlineTableRows, MdOutlinePeople } from "react-icons/md";
import { GiBookshelf } from "react-icons/gi";
import { BiTimeFive } from "react-icons/bi";
import { IoLogOutOutline } from "react-icons/io5";
import AuthContext from "../context/AuthProvider";

// Assuming we have a context for user role/permissions
const UserContext = React.createContext();

export default function DashboardLayout({ children }) {
    const { userRole } = useContext(UserContext) || { userRole: "admin" }; // Default to admin for demo
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const logout = () => {
        setAuth({});
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`bg-indigo-800 text-white ${sidebarOpen ? "w-64" : "w-20"} transition-all duration-300 ease-in-out flex flex-col`}>
                {/* Logo and toggle */}
                <div className="flex items-center justify-between p-4 border-b border-indigo-700">
                    {sidebarOpen ? (
                        <h1 className="text-xl font-bold">Academic Portal</h1>
                    ) : (
                        <h1 className="text-xl font-bold">AP</h1>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        <HiOutlineMenuAlt1 size={24} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-grow py-4">
                    <ul className="space-y-1">
                        <li>
                            <Link to="/" className="flex items-center px-4 py-3 hover:bg-indigo-700 transition-colors">
                                <IoCalendarOutline size={20} className="flex-shrink-0" />
                                {sidebarOpen && <span className="ml-3">Timetable</span>}
                            </Link>
                        </li>
                        <li>
                            <Link to="/instructor" className="flex items-center px-4 py-3 hover:bg-indigo-700 transition-colors">
                                <MdOutlinePeople size={20} className="flex-shrink-0" />
                                {sidebarOpen && <span className="ml-3">Instructors</span>}
                            </Link>
                        </li>
                        <li>
                            <Link to="/course" className="flex items-center px-4 py-3 hover:bg-indigo-700 transition-colors">
                                <GiBookshelf size={20} className="flex-shrink-0" />
                                {sidebarOpen && <span className="ml-3">Courses</span>}
                            </Link>
                        </li>
                        <li>
                            <Link to="/room" className="flex items-center px-4 py-3 hover:bg-indigo-700 transition-colors">
                                <FaBuilding size={20} className="flex-shrink-0" />
                                {sidebarOpen && <span className="ml-3">Rooms</span>}
                            </Link>
                        </li>
                        <li>
                            <Link to="/section" className="flex items-center px-4 py-3 hover:bg-indigo-700 transition-colors">
                                <SiGoogleclassroom size={20} className="flex-shrink-0" />
                                {sidebarOpen && <span className="ml-3">Sections</span>}
                            </Link>
                        </li>

                        {/* Admin Section - Only visible to admins */}
                        {userRole === "admin" && (
                            <>
                                <li className="pt-4 pb-2 px-4">
                                    {sidebarOpen && <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Admin Controls</span>}
                                </li>
                                <li>
                                    <Link to="/faculty" className="flex items-center px-4 py-3 hover:bg-indigo-700 transition-colors">
                                        <FaUniversity size={20} className="flex-shrink-0" />
                                        {sidebarOpen && <span className="ml-3">Faculties</span>}
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/department" className="flex items-center px-4 py-3 hover:bg-indigo-700 transition-colors">
                                        <FaBuilding size={20} className="flex-shrink-0" />
                                        {sidebarOpen && <span className="ml-3">Departments</span>}
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/programme" className="flex items-center px-4 py-3 hover:bg-indigo-700 transition-colors">
                                        <MdOutlineTableRows size={20} className="flex-shrink-0" />
                                        {sidebarOpen && <span className="ml-3">Programmes</span>}
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/timeslot" className="flex items-center px-4 py-3 hover:bg-indigo-700 transition-colors">
                                        <BiTimeFive size={20} className="flex-shrink-0" />
                                        {sidebarOpen && <span className="ml-3">Time Slots</span>}
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>

                {/* Logout Button at the bottom of sidebar */}
                <div className="border-t border-indigo-700 p-4">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-all"
                    >
                        <IoLogOutOutline size={20} className="flex-shrink-0" />
                        {sidebarOpen && <span className="ml-2">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Content */}
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}