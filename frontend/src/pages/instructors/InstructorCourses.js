import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Search } from "lucide-react";
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
        { icon: HiHome, label: "Dashboard", path: "/dashboard", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiCalendar, label: "Timetable", path: "/instructor-timetable", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiAcademicCap, label: "Courses", path: "/instructor-courses", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiDocumentText, label: "Reports", path: "/instructor-reports", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiAdjustments, label: "Preferences", path: "/instructor-preferences", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiCog, label: "Settings", path: "/instructor-settings", bgGradient: "from-blue-500 to-blue-700" },
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
            console.log("Courses API response:", response.data);
            setCourses(response.data || []);
            setIsLoading(false);
        } catch (error) {
            console.error(`Error fetching courses: ${error}`);
            toast.error("Failed to fetch courses");
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

    return (
        <section className="min-h-screen flex bg-white dark:bg-gray-900">
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out ${
                    isExpanded ? 'w-64' : 'w-20'
                } bg-white dark:bg-gray-800 shadow-2xl rounded-r-2xl`}
            >
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
                                    className={`
                                        flex items-center p-3 rounded-lg transition-all duration-300 
                                        ${
                                        location.pathname === item.path
                                            ? `bg-gradient-to-r ${item.bgGradient} text-white shadow-md`
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                    } 
                                        ${isExpanded ? 'justify-start' : 'justify-center'}
                                    `}
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
            <main
                className={`flex-grow p-8 transition-all duration-300 ${isExpanded ? 'ml-64' : 'ml-20'}`}
            >
                <div className="main-content p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
                    <div className="space-y-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                                    My Courses
                                </h1>
                                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                                    View your assigned courses
                                </p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-0">
                                    Assigned Courses
                                </h2>
                                <div className="relative w-full md:w-80">
                                    <input
                                        type="text"
                                        placeholder="Search courses..."
                                        className="pl-10 pr-4 py-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200 w-full"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <div className="absolute left-3 top-3">
                                        <Search size={20} className="text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : (
                                <>
                                    {currentCourses.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                                            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <p className="text-xl font-medium">No courses assigned</p>
                                            <p className="text-sm mt-2">You currently have no assigned courses</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-l-lg">
                                                        Course
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Year
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Semester
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Programme
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-r-lg">
                                                        Department
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                                {currentCourses.map((course, index) => (
                                                    <tr
                                                        key={course.id || index}
                                                        className={`${
                                                            index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                                                        } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                                    {course.courseName || 'N/A'}
                                                                </span>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {course.courseCode || 'N/A'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                                            {course.year || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                                            {course.semester || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                                                                {course.programmeName || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                                                                {course.deptName || 'N/A'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Pagination */}
                                    <div className="flex justify-between items-center mt-6">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredCourses.length)} of {filteredCourses.length} entries
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                className={`
                                                    px-4 py-2 rounded-lg shadow-sm transition-all duration-200 
                                                    ${
                                                    isFirstPage
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                                                }
                                                `}
                                                onClick={handlePreviousPage}
                                                disabled={isFirstPage}
                                            >
                                                Previous
                                            </button>
                                            <button
                                                className={`
                                                    px-4 py-2 rounded-lg shadow-sm transition-all duration-200 
                                                    ${
                                                    isLastPage
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                                                }
                                                `}
                                                onClick={handleNextPage}
                                                disabled={isLastPage}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </section>
    );
};

export default InstructorCourses;