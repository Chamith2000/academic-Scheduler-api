import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HiExclamationCircle, HiCalendar } from "react-icons/hi";
import InstructorDashboard from "../../Layout/InstructorDashboard";

const InstructorCancelClass = () => {
    const { auth } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [semester, setSemester] = useState(1);
    const [year, setYear] = useState(2025);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSchedules = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `http://localhost:8080/api/schedule/instructor/all`,
                {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                }
            );
            setSchedules(response.data);
        } catch (err) {
            setError(err.response?.data || "Failed to fetch schedules");
            toast.error(err.response?.data || "Failed to fetch schedules");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth?.accessToken) {
            fetchSchedules();
        }
    }, [semester, year, auth]);

    const handleCancelClass = async (scheduleId) => {
        try {
            const response = await axios.post(
                `http://localhost:8080/api/schedule/reschedule/${scheduleId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                }
            );
            toast.success("Class rescheduled successfully!");
            // Refresh schedules after rescheduling
            fetchSchedules();
        } catch (err) {
            toast.error(err.response?.data || "Failed to reschedule class");
        }
    };

    return (
        <InstructorDashboard>
            <motion.div
                className="min-h-screen p-6 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-neutral-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <ToastContainer position="top-right" autoClose={3000} />
                <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                        <HiCalendar className="w-8 h-8 mr-2 text-indigo-600" />
                        Cancel Class
                    </h1>

                    {/* Semester and Year Selection */}
                    <div className="mb-6 flex space-x-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Semester
                            </label>
                            <select
                                value={semester}
                                onChange={(e) => setSemester(Number(e.target.value))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value={1}>Semester 1</option>
                                <option value={2}>Semester 2</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Year
                            </label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                min="2000"
                                max="2099"
                            />
                        </div>
                    </div>

                    {/* Schedules Table */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="text-red-600 dark:text-red-400 text-center">{error}</div>
                    ) : schedules.length === 0 ? (
                        <div className="text-gray-600 dark:text-gray-400 text-center">
                            No schedules found for Semester {semester}, {year}.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Course Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Time Slot
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Room
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                {schedules.map((schedule) => (
                                    <tr key={schedule.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {schedule.courseCodes?.join(", ") || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {schedule.timeSlots?.join(", ") || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {schedule.roomNames?.join(", ") || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <motion.button
                                                onClick={() => handleCancelClass(schedule.id)}
                                                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <HiExclamationCircle className="w-5 h-5 mr-2" />
                                                Cancel
                                            </motion.button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </motion.div>
        </InstructorDashboard>
    );
};

export default InstructorCancelClass;