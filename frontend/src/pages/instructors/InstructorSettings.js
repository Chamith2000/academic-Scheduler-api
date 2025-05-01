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
    HiAdjustments,
} from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InstructorReportsPage = () => {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoadingCourses, setIsLoadingCourses] = useState(false);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    const [isLoadingWorkload, setIsLoadingWorkload] = useState(false);

    const NavItems = [
        { icon: HiHome, label: "Dashboard", path: "/dashboard", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiCalendar, label: "Timetable", path: "/instructor-timetable", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiAcademicCap, label: "Courses", path: "/instructor-courses", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiDocumentText, label: "Reports", path: "/instructor-reports", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiAdjustments, label: "Preferences", path: "/instructor-preferences", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiCog, label: "Settings", path: "/instructor-settings", bgGradient: "from-blue-500 to-blue-700" },
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
                                    Reports
                                    {/* Sinhala: වාර්තා */}
                                </h1>
                                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                                    Download reports for your courses, availability, and workload
                                    {/* Sinhala: ඔබේ පාඨමාලා, ලබා ගත හැකි කාලය සහ වැඩ බර සඳහා වාර්තා බාගත කරන්න */}
                                </p>
                            </div>
                        </div>

                        {/* Courses Report */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                Courses Report
                                {/* Sinhala: පාඨමාලා වාර්තාව */}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Download a CSV file containing details of all courses assigned to you.
                                {/* Sinhala: ඔබට පවරා ඇති සියලුම පාඨමාලාවල විස්තර අඩංගු CSV ගොනුවක් බාගත කරන්න */}
                            </p>
                            <button
                                onClick={handleDownloadCoursesReport}
                                disabled={isLoadingCourses}
                                className={`
                                    px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md 
                                    hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                                    transition-all duration-200 transform hover:scale-105
                                    ${isLoadingCourses ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                {isLoadingCourses ? "Downloading..." : "Download Courses Report"}
                                {/* Sinhala: {isLoadingCourses ? "බාගත වෙමින්..." : "පාඨමාලා වාර්තාව බාගත කරන්න"} */}
                            </button>
                        </div>

                        {/* Availability Gaps Report */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                Availability Gaps Report
                                {/* Sinhala: ලබා ගත හැකි කාල පරතර වාර්තාව */}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Download a CSV file listing time slots where you are available but not scheduled.
                                {/* Sinhala: ඔබ ලබා ගත හැකි නමුත් කාලසටහනට ඇතුළත් නොකළ කාල පරාසයන් ලැයිස්තුගත කරන CSV ගොනුවක් බාගත කරන්න */}
                            </p>
                            <button
                                onClick={handleDownloadAvailabilityGapsReport}
                                disabled={isLoadingAvailability}
                                className={`
                                    px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md 
                                    hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                                    transition-all duration-200 transform hover:scale-105
                                    ${isLoadingAvailability ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                {isLoadingAvailability ? "Downloading..." : "Download Availability Gaps Report"}
                                {/* Sinhala: {isLoadingAvailability ? "බාගත වෙමින්..." : "ලබා ගත හැකි කාල පරතර වාර්තාව බාගත කරන්න"} */}
                            </button>
                        </div>

                        {/* Workload Report */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                Workload Report
                                {/* Sinhala: වැඩ බර වාර්තාව */}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Download a CSV file summarizing your teaching workload, including total courses and hours.
                                {/* Sinhala: ඔබේ ඉගැන්වීමේ වැඩ බර, මුළු පාඨමාලා සහ පැය ගණන ඇතුළත් CSV ගොනුවක් බාගත කරන්න */}
                            </p>
                            <button
                                onClick={handleDownloadWorkloadReport}
                                disabled={isLoadingWorkload}
                                className={`
                                    px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md 
                                    hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                                    transition-all duration-200 transform hover:scale-105
                                    ${isLoadingWorkload ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                {isLoadingWorkload ? "Downloading..." : "Download Workload Report"}
                                {/* Sinhala: {isLoadingWorkload ? "බාගත වෙමින්..." : "වැඩ බර වාර්තාව බාගත කරන්න"} */}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </section>
    );
};

export default InstructorReportsPage;