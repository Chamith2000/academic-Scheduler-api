import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import { BiTrash } from "react-icons/bi";
import useAuth from "../hooks/useAuth";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "react-tooltip";
import { motion, AnimatePresence } from "framer-motion";

const InstructorPreferencesPage = () => {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [preferences, setPreferences] = useState([]);
    const [timeslots, setTimeslots] = useState([]);
    const [selectedTimeslot, setSelectedTimeslot] = useState("");
    const [instructorId, setInstructorId] = useState(null);
    const [deletePreferenceId, setDeletePreferenceId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const handleLogout = () => {
        setAuth(null);
        localStorage.removeItem("user");
        navigate("/login");
    };

    const NavItems = [
        { icon: HiHome, label: "Dashboard", path: "/instructor-dashboard", bgGradient: "from-indigo-600 to-blue-600", tooltip: "View your dashboard" },
        { icon: HiCalendar, label: "Timetable", path: "/instructor-timetable", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Check your schedule" },
        { icon: HiAcademicCap, label: "Courses", path: "/instructor-courses", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Manage your courses" },
        {icon: HiX, label: "Cancel Class", path: "/instructor-cancel-class", bgGradient: "from-red-500 to-red-700", tooltip: "Cancel a scheduled class"},
        { icon: HiDocumentText, label: "Reports", path: "/instructor-reports", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Download reports" },
        { icon: HiAdjustments, label: "Preferences", path: "/instructor-preferences", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Set availability" },
        { icon: HiCog, label: "Settings", path: "/settings", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Account settings" },
    ];

    // Fetch instructor's ID
    const fetchInstructorId = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/instructors/me", {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            });
            setInstructorId(response.data.id);
        } catch (error) {
            console.error(`Error fetching instructor ID: ${error}`);
            toast.error("Failed to fetch instructor details");
        }
    };

    // Fetch available timeslots
    const fetchTimeslots = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/timeslots", {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            });
            setTimeslots(response.data);
        } catch (error) {
            console.error(`Error fetching timeslots: ${error}`);
            toast.error("Failed to fetch timeslots");
        }
    };

    // Fetch preferences
    const fetchPreferences = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/instructors/me/preferences", {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            });
            const fetchedPreferences = response.data.preferences || [];
            setPreferences(fetchedPreferences);
        } catch (error) {
            console.error(`Error fetching preferences: ${error}`);
            toast.error("Failed to fetch preferences");
        }
    };

    // Add preference
    const addPreference = async (e) => {
        e.preventDefault();
        if (!selectedTimeslot || !instructorId) {
            toast.error("Please select a timeslot");
            return;
        }

        setIsAdding(true);
        try {
            await axios.post(
                `http://localhost:8080/api/instructors/${instructorId}/preferences`,
                {},
                {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                    params: { timeslotId: selectedTimeslot },
                }
            );
            toast.success("Preference added successfully");
            fetchPreferences();
            setSelectedTimeslot("");
        } catch (error) {
            console.error(`Error adding preference: ${error}`);
            toast.error("Failed to add preference");
        } finally {
            setIsAdding(false);
        }
    };

    // Delete preference
    const handleDeletePreference = async () => {
        if (!deletePreferenceId || !instructorId) {
            toast.error("Invalid preference selected");
            return;
        }

        try {
            await axios.delete(
                `http://localhost:8080/api/instructors/${instructorId}/preferences/${deletePreferenceId}`,
                { headers: { Authorization: `Bearer ${auth.accessToken}` } }
            );
            toast.success("Preference deleted successfully");
            fetchPreferences();
            setShowDeleteModal(false);
            setDeletePreferenceId(null);
        } catch (error) {
            console.error(`Error deleting preference: ${error}`);
            toast.error("Failed to delete preference");
        }
    };

    useEffect(() => {
        fetchInstructorId();
        fetchTimeslots();
        fetchPreferences();
    }, []);

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

            {/* Main Content Area */}
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
                                        My Preferences
                                        {/* Sinhala: මගේ අභිරුචි */}
                                    </h1>
                                    <p className="mt-2 text-indigo-100">
                                        Manage your scheduled time preferences to optimize your teaching schedule.
                                        {/* Sinhala: ඔබේ ඉගැන්වීමේ කාලසටහන ප්‍රශස්ත කිරීමට ඔබේ කාලසටහන්ගත කාල අභිරුචි කළමනාකරණය කරන්න */}
                                    </p>
                                </div>
                            </motion.section>

                            {/* Add Preference Form */}
                            <motion.div
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 hover:shadow-xl transition-shadow duration-300"
                                whileHover={{ scale: 1.01 }}
                            >
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                    Add New Preference
                                    {/* Sinhala: නව අභිරුචියක් එක් කරන්න */}
                                </h2>
                                <form onSubmit={addPreference} className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                    <div className="flex-1 max-w-lg">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Select Timeslot
                                            {/* Sinhala: කාල පරාසය තෝරන්න */}
                                        </label>
                                        <motion.select
                                            value={selectedTimeslot}
                                            onChange={(e) => setSelectedTimeslot(e.target.value)}
                                            className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200"
                                            whileFocus={{ scale: 1.02 }}
                                            disabled={isAdding}
                                        >
                                            <option value="">Select a timeslot</option>
                                            {timeslots.map((timeslot) => (
                                                <option key={timeslot.id} value={timeslot.id}>
                                                    {timeslot.day}: {timeslot.startTime} - {timeslot.endTime}
                                                </option>
                                            ))}
                                        </motion.select>
                                    </div>
                                    <motion.button
                                        type="submit"
                                        className={`px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                                            isAdding ? "opacity-50 cursor-not-allowed" : "hover:from-indigo-700 hover:to-blue-700"
                                        }`}
                                        whileHover={isAdding ? {} : { scale: 1.05 }}
                                        whileTap={isAdding ? {} : { scale: 0.95 }}
                                        disabled={isAdding}
                                        data-tooltip-id="add-preference"
                                        data-tooltip-content="Add this timeslot to your preferences"
                                    >
                                        {isAdding ? (
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Adding...
                                            </div>
                                        ) : (
                                            "Add Preference"
                                        )}
                                        {/* Sinhala: {isAdding ? "එකතු කරමින්..." : "අභිරුචිය එක් කරන්න"} */}
                                    </motion.button>
                                    <Tooltip id="add-preference" place="top" />
                                </form>
                            </motion.div>

                            {/* Preferences Table */}
                            <motion.div
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Day
                                            {/* Sinhala: දිනය */}
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Start Time
                                            {/* Sinhala: ආරම්භක වේලාව */}
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            End Time
                                            {/* Sinhala: අවසන් වේලාව */}
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                            {/* Sinhala: ක්‍රියා */}
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                    {preferences.length > 0 ? (
                                        preferences.map((pref, index) => (
                                            <motion.tr
                                                key={pref.id}
                                                className={`${
                                                    index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"
                                                } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                                                    {pref.day || "N/A"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                                    {pref.startTime || "N/A"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                                    {pref.endTime || "N/A"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                                    <motion.button
                                                        onClick={() => {
                                                            setDeletePreferenceId(pref.id);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                                                        whileHover={{ scale: 1.2 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        data-tooltip-id={`delete-${pref.id}`}
                                                        data-tooltip-content="Remove this preference"
                                                    >
                                                        <BiTrash className="w-5 h-5" />
                                                    </motion.button>
                                                    <Tooltip id={`delete-${pref.id}`} place="top" />
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                                            >
                                                No preferences added yet.
                                                {/* Sinhala: තවම අභිරුචි එකතු කර නැත */}
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Delete Preference Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Delete Preference
                                {/* Sinhala: අභිරුචිය ඉවත් කරන්න */}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Are you sure you want to delete this preference?
                                {/* Sinhala: ඔබට මෙම අභිරුචිය ඉවත් කිරීමට අවශ්‍ය බව විශ්වාසද? */}
                            </p>
                            <div className="flex justify-end space-x-4">
                                <motion.button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeletePreferenceId(null);
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    data-tooltip-id="cancel-delete"
                                    data-tooltip-content="Cancel deletion"
                                >
                                    Cancel
                                    {/* Sinhala: අවලංගු කරන්න */}
                                </motion.button>
                                <motion.button
                                    onClick={handleDeletePreference}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    data-tooltip-id="confirm-delete"
                                    data-tooltip-content="Confirm deletion"
                                >
                                    Delete
                                    {/* Sinhala: ඉවත් කරන්න */}
                                </motion.button>
                                <Tooltip id="cancel-delete" place="top" />
                                <Tooltip id="confirm-delete" place="top" />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default InstructorPreferencesPage;