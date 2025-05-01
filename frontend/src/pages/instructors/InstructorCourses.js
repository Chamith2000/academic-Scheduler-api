import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Search, X } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import {
    HiOutlineMenuAlt1,
    HiLogout,
    HiHome,
    HiCalendar,
    HiAcademicCap,
    HiCog,
    HiDocumentText,
    HiAdjustments,
} from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "react-tooltip";
import { motion, AnimatePresence } from "framer-motion";

const InstructorCourses = () => {
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const NavItems = [
        { icon: HiHome, label: "Dashboard", path: "/dashboard", bgGradient: "from-indigo-600 to-blue-600", tooltip: "View your dashboard" },
        { icon: HiCalendar, label: "Timetable", path: "/instructor-timetable", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Check your schedule" },
        { icon: HiAcademicCap, label: "Courses", path: "/instructor-courses", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Manage your courses" },
        { icon: HiDocumentText, label: "Reports", path: "/instructor-reports", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Download reports" },
        { icon: HiAdjustments, label: "Preferences", path: "/instructor-preferences", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Set availability" },
        { icon: HiCog, label: "Settings", path: "/settings", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Account settings" },
    ];

    // Filter courses based on search term
    const filteredCourses = courses.filter(course =>
        (course.courseName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (course.courseCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (course.programmeName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (course.deptName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    const currentCourses = filteredCourses.slice(indexOfFirstRecord, indexOfLastRecord);
    const isFirstPage = currentPage === 1;
    const isLastPage = indexOfLastRecord >= filteredCourses.length;

    const handleLogout = () => {
        setAuth(null);
        localStorage.removeItem("user");
        navigate("/login");
    };

    const fetchInstructorCourses = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/api/instructors/courses", {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            });
            setCourses(response.data || []);
        } catch (error) {
            console.error(`Error fetching courses: ${error}`);
            toast.error("Failed to fetch courses");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructorCourses();
    }, []);

    const handleNextPage = () => {
        if (!isLastPage) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePreviousPage = () => {
        if (!isFirstPage) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setCurrentPage(1);
    };

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
            <main className={`flex-grow p-8 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-20"}`}>
                <AnimatePresence>
                    <motion.div
                        className="main-content p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
                        <div className="space-y-8">
                            {/* Welcome Banner */}
                            <motion.section
                                className="mb-8"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                                    <h1 className="text-3xl font-bold">
                                        My Courses
                                        {/* Sinhala: මගේ පාඨමාලා */}
                                    </h1>
                                    <p className="mt-2 text-indigo-100">
                                        View and manage your assigned courses.
                                        {/* Sinhala: ඔබට පවරා ඇති පාඨමාලා බලන්න සහ කළමනාකරණය කරන්න */}
                                    </p>
                                </div>
                            </motion.section>

                            {/* Courses Section */}
                            <motion.div
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-0">
                                        Assigned Courses
                                        {/* Sinhala: පවරා ඇති පාඨමාලා */}
                                    </h2>
                                    <div className="relative w-full md:w-80">
                                        <motion.input
                                            type="text"
                                            placeholder="Search courses..."
                                            className="pl-10 pr-10 py-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200 w-full"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            whileFocus={{ scale: 1.02 }}
                                            data-tooltip-id="search-courses"
                                            data-tooltip-content="Search by course name, code, programme, or department"
                                        />
                                        <div className="absolute left-3 top-3">
                                            <Search size={20} className="text-gray-400" />
                                        </div>
                                        {searchTerm && (
                                            <motion.button
                                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                                onClick={handleClearSearch}
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                data-tooltip-id="clear-search"
                                                data-tooltip-content="Clear search"
                                            >
                                                <X size={20} />
                                            </motion.button>
                                        )}
                                        <Tooltip id="search-courses" place="top" />
                                        <Tooltip id="clear-search" place="top" />
                                    </div>
                                </div>

                                {isLoading ? (
                                    <div className="space-y-4">
                                        {[...Array(5)].map((_, index) => (
                                            <div key={index} className="animate-pulse flex space-x-4">
                                                <div className="flex-1 space-y-6 py-1">
                                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-5 gap-4">
                                                            <div className="h-4 bg-gray-200 rounded col-span-2"></div>
                                                            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                                                            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                                                            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        {currentCourses.length === 0 ? (
                                            <motion.div
                                                className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                                <p className="text-xl font-medium">
                                                    No courses assigned
                                                    {/* Sinhala: පාඨමාලා පවරා නැත */}
                                                </p>
                                                <p className="text-sm mt-2">
                                                    You currently have no assigned courses.
                                                    {/* Sinhala: ඔබට වර්තමානයේ පවරා ඇති පාඨමාලා නැත */}
                                                </p>
                                                <motion.button
                                                    className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => navigate("/instructor-preferences")}
                                                    data-tooltip-id="set-preferences"
                                                    data-tooltip-content="Set your teaching preferences"
                                                >
                                                    Set Preferences
                                                    {/* Sinhala: අභිරුචි සකසන්න */}
                                                </motion.button>
                                                <Tooltip id="set-preferences" place="top" />
                                            </motion.div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th
                                                            className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-l-lg"
                                                            data-tooltip-id="course-header"
                                                            data-tooltip-content="Course name and code"
                                                        >
                                                            Course
                                                            {/* Sinhala: පාඨමාලාව */}
                                                        </th>
                                                        <th
                                                            className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                                            data-tooltip-id="year-header"
                                                            data-tooltip-content="Academic year"
                                                        >
                                                            Year
                                                            {/* Sinhala: වර්ෂය */}
                                                        </th>
                                                        <th
                                                            className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                                            data-tooltip-id="semester-header"
                                                            data-tooltip-content="Semester number"
                                                        >
                                                            Semester
                                                            {/* Sinhala: අර්ධ වාර්ෂික */}
                                                        </th>
                                                        <th
                                                            className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                                            data-tooltip-id="programme-header"
                                                            data-tooltip-content="Academic programme"
                                                        >
                                                            Programme
                                                            {/* Sinhala: වැඩසටහන */}
                                                        </th>
                                                        <th
                                                            className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-r-lg"
                                                            data-tooltip-id="department-header"
                                                            data-tooltip-content="Department name"
                                                        >
                                                            Department
                                                            {/* Sinhala: දෙපාර්තමේන්තුව */}
                                                        </th>
                                                    </tr>
                                                    <Tooltip id="course-header" place="top" />
                                                    <Tooltip id="year-header" place="top" />
                                                    <Tooltip id="semester-header" place="top" />
                                                    <Tooltip id="programme-header" place="top" />
                                                    <Tooltip id="department-header" place="top" />
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                                    {currentCourses.map((course, index) => (
                                                        <motion.tr
                                                            key={course.id || index}
                                                            className={`${
                                                                index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"
                                                            } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex flex-col">
                                                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                                            {course.courseName || "N/A"}
                                                                        </span>
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                            {course.courseCode || "N/A"}
                                                                        </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                                                {course.year || "N/A"}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                                                {course.semester || "N/A"}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                                                                        {course.programmeName || "N/A"}
                                                                    </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                                                                        {course.deptName || "N/A"}
                                                                    </span>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {/* Pagination */}
                                        <motion.div
                                            className="flex justify-between items-center mt-6"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredCourses.length)} of {filteredCourses.length} entries
                                                {/* Sinhala: {filteredCourses.length}න් {indexOfFirstRecord + 1} සිට {Math.min(indexOfLastRecord, filteredCourses.length)} දක්වා පෙන්වයි */}
                                            </div>
                                            <div className="flex gap-3">
                                                <motion.button
                                                    className={`px-4 py-2 rounded-lg shadow-sm transition-all duration-200 ${
                                                        isFirstPage
                                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                            : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 hover:shadow-md"
                                                    }`}
                                                    onClick={handlePreviousPage}
                                                    disabled={isFirstPage}
                                                    whileHover={isFirstPage ? {} : { scale: 1.05 }}
                                                    whileTap={isFirstPage ? {} : { scale: 0.95 }}
                                                    data-tooltip-id="prev-page"
                                                    data-tooltip-content="Go to previous page"
                                                >
                                                    Previous
                                                    {/* Sinhala: පෙර පිටුව */}
                                                </motion.button>
                                                <motion.button
                                                    className={`px-4 py-2 rounded-lg shadow-sm transition-all duration-200 ${
                                                        isLastPage
                                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                            : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 hover:shadow-md"
                                                    }`}
                                                    onClick={handleNextPage}
                                                    disabled={isLastPage}
                                                    whileHover={isLastPage ? {} : { scale: 1.05 }}
                                                    whileTap={isLastPage ? {} : { scale: 0.95 }}
                                                    data-tooltip-id="next-page"
                                                    data-tooltip-content="Go to next page"
                                                >
                                                    Next
                                                    {/* Sinhala: ඊළඟ පිටුව */}
                                                </motion.button>
                                                <Tooltip id="prev-page" place="top" />
                                                <Tooltip id="next-page" place="top" />
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>
        </section>
    );
};

export default InstructorCourses;