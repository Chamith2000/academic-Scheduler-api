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
    HiAdjustments,
} from "react-icons/hi";
import { BiTrash } from "react-icons/bi";
import useAuth from "../hooks/useAuth";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

    const handleLogout = () => {
        setAuth(null);
        localStorage.removeItem("user");
        navigate("/login");
    };

    const NavItems = [
        { icon: HiHome, label: "Dashboard", path: "/dashboard", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiCalendar, label: "Timetable", path: "/instructor-timetable", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiAcademicCap, label: "Courses", path: "/instructor-courses", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiDocumentText, label: "Reports", path: "/instructor-reports", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiAdjustments, label: "Preferences", path: "/instructor-preferences", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiCog, label: "Settings", path: "/settings", bgGradient: "from-blue-500 to-blue-700" },
    ];

    // Fetch instructor's ID
    const fetchInstructorId = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/instructors/me", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
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
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
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
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            });
            console.log("Preferences API response:", response.data);
            const fetchedPreferences = response.data.preferences || [];
            console.log("Fetched preferences:", fetchedPreferences);
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

        try {
            await axios.post(
                `http://localhost:8080/api/instructors/${instructorId}/preferences`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${auth.accessToken}`,
                    },
                    params: {
                        timeslotId: selectedTimeslot,
                    },
                }
            );
            toast.success("Preference added successfully");
            fetchPreferences();
            setSelectedTimeslot("");
        } catch (error) {
            console.error(`Error adding preference: ${error}`);
            toast.error("Failed to add preference");
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
                {
                    headers: {
                        Authorization: `Bearer ${auth.accessToken}`,
                    },
                }
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
        <section className="min-h-screen flex bg-white dark:bg-gray-900">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out 
                    ${isExpanded ? 'w-64' : 'w-20'} 
                    bg-white dark:bg-gray-800 shadow-2xl rounded-r-2xl`}
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
                                        ${location.pathname === item.path
                                        ? `bg-gradient-to-r ${item.bgGradient} text-white shadow-md`
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
                    flex-grow p-8 transition-all duration-300 
                    ${isExpanded ? 'ml-64' : 'ml-20'}
                `}
            >
                <div className="main-content p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
                    <div className="space-y-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                                    My Preferences
                                </h1>
                                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                                    Manage your scheduled time preferences
                                </p>
                            </div>
                        </div>

                        {/* Add Preference Form */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 hover:shadow-xl transition-shadow duration-300">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                Add New Preference
                            </h2>
                            <form onSubmit={addPreference} className="flex items-center space-x-4">
                                <div className="flex-1 max-w-lg">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Select Timeslot
                                    </label>
                                    <select
                                        value={selectedTimeslot}
                                        onChange={(e) => setSelectedTimeslot(e.target.value)}
                                        className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200"
                                    >
                                        <option value="">Select a timeslot</option>
                                        {timeslots.map((timeslot) => (
                                            <option key={timeslot.id} value={timeslot.id}>
                                                {timeslot.day}: {timeslot.startTime} - {timeslot.endTime}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
                                >
                                    Add Preference
                                </button>
                            </form>
                        </div>

                        {/* Preferences Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Day
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Start Time
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        End Time
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                {preferences.length > 0 ? (
                                    preferences.map((pref, index) => (
                                        <tr
                                            key={pref.id}
                                            className={`${
                                                index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                                            } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                                                {pref.day || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                                {pref.startTime || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                                {pref.endTime || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                                <button
                                                    onClick={() => {
                                                        setDeletePreferenceId(pref.id);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="text-red-600 hover:text-red-800 transition-colors duration-200"
                                                >
                                                    <BiTrash className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                            No preferences added yet.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Delete Preference Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            Delete Preference
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete this preference?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletePreferenceId(null);
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeletePreference}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default InstructorPreferencesPage;