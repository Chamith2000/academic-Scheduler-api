import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import {
    HiOutlineMenuAlt1,
    HiLogout,
    HiHome,
    HiCalendar,
    HiAcademicCap,
    HiCog,
    HiDocumentText,
    HiAdjustments, HiX,
} from "react-icons/hi";
import { Download } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "react-tooltip";
import { motion, AnimatePresence } from "framer-motion";

const InstructorReportsPage = () => {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    const [isLoadingWorkload, setIsLoadingWorkload] = useState(false);

    const NavItems = [
        { icon: HiHome, label: "Dashboard", path: "/instructor-dashboard", bgGradient: "from-indigo-600 to-blue-600", tooltip: "View your dashboard" },
        { icon: HiCalendar, label: "Timetable", path: "/instructor-timetable", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Check your schedule" },
        { icon: HiAcademicCap, label: "Courses", path: "/instructor-courses", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Manage your courses" },
        {icon: HiX, label: "Cancel Class", path: "/instructor-cancel-class", bgGradient: "from-red-500 to-red-700", tooltip: "Cancel a scheduled class"},
        { icon: HiDocumentText, label: "Reports", path: "/instructor-reports", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Download reports" },
        { icon: HiAdjustments, label: "Preferences", path: "/instructor-preferences", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Set availability" },
        { icon: HiCog, label: "Settings", path: "/instructor-settings", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Account settings" },
    ];

    const handleLogout = () => {
        setAuth(null);
        localStorage.removeItem("user");
        navigate("/login");
    };

    const downloadReport = async (endpoint, filename, setLoading) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/instructors/me/reports/${endpoint}`, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success(`Report downloaded successfully`);
        } catch (error) {
            console.error(`Error downloading ${endpoint} report: ${error}`);
            toast.error(`Failed to download ${endpoint} report`);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCoursesReport = () => downloadReport("courses", "courses_report.csv", setIsLoadingCourses);
    const handleDownloadAvailabilityGapsReport = () => downloadReport("availability-gaps", "availability_gaps_report.csv", setIsLoadingAvailability);
    const handleDownloadWorkloadReport = () => downloadReport("workload", "workload_report.csv", setIsLoadingWorkload);

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
                                        Reports
                                        {/* Sinhala: වාර්තා */}
                                    </h1>
                                    <p className="mt-2 text-indigo-100">
                                        Download reports for your courses, availability, and workload.
                                        {/* Sinhala: ඔබේ පාඨමාලා, ලබා ගත හැකි කාලය සහ වැඩ බර සඳහා වාර්තා බාගත කරන්න */}
                                    </p>
                                </div>
                            </motion.section>

                            {/* Report Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Courses Report */}
                                <motion.div
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                                    whileHover={{ scale: 1.02 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                >
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 relative">
                                        Courses Report
                                        {/* Sinhala: පාඨමාලා වාර්තාව */}
                                        <motion.span
                                            className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-indigo-600 to-blue-600"
                                            initial={{ width: 0 }}
                                            animate={{ width: 48 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Download a CSV file containing details of all courses assigned to you.
                                        {/* Sinhala: ඔබට පවරා ඇති සියලුම පාඨමාලාවල විස්තර අඩංගු CSV ගොනුවක් බාගත කරන්න */}
                                    </p>
                                    <motion.button
                                        onClick={handleDownloadCoursesReport}
                                        disabled={isLoadingCourses}
                                        className={`w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                                            isLoadingCourses ? "opacity-50 cursor-not-allowed" : "hover:from-indigo-700 hover:to-blue-700"
                                        }`}
                                        whileHover={isLoadingCourses ? {} : { scale: 1.05 }}
                                        whileTap={isLoadingCourses ? {} : { scale: 0.95 }}
                                        data-tooltip-id="courses-report"
                                        data-tooltip-content="Download your courses report"
                                    >
                                        {isLoadingCourses ? (
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Downloading...
                                            </div>
                                        ) : (
                                            <>
                                                <Download className="w-5 h-5 mr-2" />
                                                Download Courses Report
                                            </>
                                        )}
                                        {/* Sinhala: {isLoadingCourses ? "බාගත වෙමින්..." : "පාඨමාලා වාර්තාව බාගත කරන්න"} */}
                                    </motion.button>
                                    <Tooltip id="courses-report" place="top" />
                                </motion.div>

                                {/* Availability Gaps Report */}
                                <motion.div
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                                    whileHover={{ scale: 1.02 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                >
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 relative">
                                        Availability Gaps Report
                                        {/* Sinhala: ලබා ගත හැකි කාල පරතර වාර්තාව */}
                                        <motion.span
                                            className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-indigo-600 to-blue-600"
                                            initial={{ width: 0 }}
                                            animate={{ width: 48 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Download a CSV file listing time slots where you are available but not scheduled.
                                        {/* Sinhala: ඔබ ලබා ගත හැකි නමුත් කාලසටහනට ඇතුළත් නොකළ කාල පරාසයන් ලැයිස්තුගත කරන CSV ගොනුවක් බාගත කරන්න */}
                                    </p>
                                    <motion.button
                                        onClick={handleDownloadAvailabilityGapsReport}
                                        disabled={isLoadingAvailability}
                                        className={`w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                                            isLoadingAvailability ? "opacity-50 cursor-not-allowed" : "hover:from-indigo-700 hover:to-blue-700"
                                        }`}
                                        whileHover={isLoadingAvailability ? {} : { scale: 1.05 }}
                                        whileTap={isLoadingAvailability ? {} : { scale: 0.95 }}
                                        data-tooltip-id="availability-report"
                                        data-tooltip-content="Download your availability gaps report"
                                    >
                                        {isLoadingAvailability ? (
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Downloading...
                                            </div>
                                        ) : (
                                            <>
                                                <Download className="w-5 h-5 mr-2" />
                                                Download Availability Gaps Report
                                            </>
                                        )}
                                        {/* Sinhala: {isLoadingAvailability ? "බාගත වෙමින්..." : "ලබා ගත හැකි කාල පරතර වාර්තාව බාගත කරන්න"} */}
                                    </motion.button>
                                    <Tooltip id="availability-report" place="top" />
                                </motion.div>

                                {/* Workload Report */}
                                <motion.div
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                                    whileHover={{ scale: 1.02 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.3 }}
                                >
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 relative">
                                        Workload Report
                                        {/* Sinhala: වැඩ බර වාර්තාව */}
                                        <motion.span
                                            className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-indigo-600 to-blue-600"
                                            initial={{ width: 0 }}
                                            animate={{ width: 48 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Download a CSV file summarizing your teaching workload, including total courses and hours.
                                        {/* Sinhala: ඔබේ ඉගැන්වීමේ වැඩ බර, මුළු පාඨමාලා සහ පැය ගණන ඇතුළත් CSV ගොනුවක් බාගත කරන්න */}
                                    </p>
                                    <motion.button
                                        onClick={handleDownloadWorkloadReport}
                                        disabled={isLoadingWorkload}
                                        className={`w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                                            isLoadingWorkload ? "opacity-50 cursor-not-allowed" : "hover:from-indigo-700 hover:to-blue-700"
                                        }`}
                                        whileHover={isLoadingWorkload ? {} : { scale: 1.05 }}
                                        whileTap={isLoadingWorkload ? {} : { scale: 0.95 }}
                                        data-tooltip-id="workload-report"
                                        data-tooltip-content="Download your workload report"
                                    >
                                        {isLoadingWorkload ? (
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Downloading...
                                            </div>
                                        ) : (
                                            <>
                                                <Download className="w-5 h-5 mr-2" />
                                                Download Workload Report
                                            </>
                                        )}
                                        {/* Sinhala: {isLoadingWorkload ? "බාගත වෙමින්..." : "වැඩ බර වාර්තාව බාගත කරන්න"} */}
                                    </motion.button>
                                    <Tooltip id="workload-report" place="top" />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>
        </section>
    );
};

export default InstructorReportsPage;