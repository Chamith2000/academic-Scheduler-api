import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { Clock, Download } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import Layout from "../../Layout/InstructorDashboard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "react-tooltip";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/styles.css";

const InstructorTimetable = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [timetable, setTimetable] = useState([]);
    const [timeslots, setTimeslots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch timetable of an instructor
    const fetchTimetable = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/schedule/instructor", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            });
            setTimetable(response.data);
        } catch (error) {
            console.error(`Error fetching timetable: ${error}`);
            toast.error("Failed to fetch timetable");
        }
    };

    const fetchTimeslots = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/timeslots", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            });
            setTimeslots(
                response.data.map((timeslot) => {
                    const startHour = timeslot.startTime.slice(0, 5);
                    const endHour = timeslot.endTime.slice(0, 5);
                    return `${timeslot.day}: ${startHour} - ${endHour}`;
                })
            );
        } catch (error) {
            console.error(`Error fetching timeslots: ${error}`);
            toast.error("Failed to fetch timeslots");
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([fetchTimetable(), fetchTimeslots()]);
            setIsLoading(false);
        };
        loadData();
    }, []);

    return (
        <Layout>
            <section className="container mx-auto p-6 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-neutral-800 min-h-screen">
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Welcome Banner */}
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                            <h1 className="text-3xl font-bold">
                                Instructor Timetable
                                {/* Sinhala: උපදේශක කාලසටහන */}
                            </h1>
                            <p className="mt-2 text-indigo-100">
                                View and download your weekly teaching schedule.
                                {/* Sinhala: ඔබේ සතිපතා ඉගැන්වීමේ කාලසටහන බලන්න සහ බාගත කරන්න */}
                            </p>
                        </div>
                    </motion.div>

                    {isLoading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                            <div className="grid grid-cols-6 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-8 bg-gray-200 rounded-lg w-full"></div>
                                ))}
                            </div>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="grid grid-cols-6 gap-4">
                                    {[...Array(6)].map((_, j) => (
                                        <div key={j} className="h-16 bg-gray-200 rounded-lg w-full"></div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Table data={timetable} timeslots={timeslots} />
                    )}
                </motion.div>
            </section>
        </Layout>
    );
};

const formatTimetableData = (scheduleData, uniqueTimeslots) => {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    // Initialize timetable
    let timetable = {
        days: daysOfWeek,
        timeslots: uniqueTimeslots,
        schedule: {},
    };

    // Initialize schedule with empty arrays
    daysOfWeek.forEach((day) => {
        timetable.schedule[day] = Array(uniqueTimeslots.length).fill(null);
    });

    // Make sure we have schedule data
    if (scheduleData) {
        if (scheduleData.timeSlots) {
            scheduleData.timeSlots.forEach((timeSlot, index) => {
                const day = timeSlot.split(" ")[0];
                const timeslotStripped = timeSlot.replace(day, "").trim();

                const timetableIndex = uniqueTimeslots.indexOf(timeslotStripped);

                if (timetableIndex !== -1) {
                    timetable.schedule[day][timetableIndex] = {
                        courseCode: scheduleData.courseCodes[index],
                        roomName: scheduleData.roomNames[index],
                    };
                }
            });
        }
    }

    return timetable;
};

const Table = ({ data, timeslots }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    // Extract unique timeslots from the timeslots prop
    const uniqueTimeslots = [...new Set(timeslots.map((timeSlot) => timeSlot.split(": ")[1]))];

    // Check if data is an array and take the first element
    const scheduleData = Array.isArray(data) ? data[0] : data;

    // As there's only one timetable, we don't need to map over data
    const timetable = formatTimetableData(scheduleData, uniqueTimeslots);

    // Download timetable as Excel file
    const downloadTimetable = () => {
        setIsDownloading(true);
        try {
            // Prepare data for Excel
            const excelData = [
                // Header row
                ["Time Slot", ...timetable.days],
                // Data rows
                ...timetable.timeslots.map((timeslot, index) => [
                    timeslot,
                    ...timetable.days.map((day) => {
                        const slot = timetable.schedule[day][index];
                        return slot ? `${slot.courseCode} (${slot.roomName})` : "-";
                    }),
                ]),
            ];

            // Create workbook and worksheet
            const worksheet = XLSX.utils.aoa_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Timetable");

            // Generate and download Excel file
            XLSX.writeFile(workbook, "Instructor_Timetable.xlsx");
            toast.success("Timetable downloaded successfully");
        } catch (error) {
            console.error(`Error downloading timetable: ${error}`);
            toast.error("Failed to download timetable");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <motion.div
            className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="p-4 bg-gray-100 dark:bg-gray-700 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Weekly Schedule
                    {/* Sinhala: සතිපතා කාලසටහන */}
                </h2>
                <motion.button
                    onClick={downloadTimetable}
                    disabled={isDownloading}
                    className={`flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                        isDownloading ? "opacity-50 cursor-not-allowed" : "hover:from-indigo-700 hover:to-blue-700"
                    }`}
                    whileHover={isDownloading ? {} : { scale: 1.05 }}
                    whileTap={isDownloading ? {} : { scale: 0.95 }}
                    data-tooltip-id="download-timetable"
                    data-tooltip-content="Download your timetable as an Excel file"
                >
                    {isDownloading ? (
                        <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Downloading...
                        </div>
                    ) : (
                        <>
                            <Download className="w-5 h-5 mr-2" />
                            Download Timetable
                        </>
                    )}
                    {/* Sinhala: {isDownloading ? "බාගත වෙමින්..." : "කාලසටහන බාගත කරන්න"} */}
                </motion.button>
                <Tooltip id="download-timetable" place="top" />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="p-3 border dark:border-gray-600 text-left">
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                                Time Slot
                                {/* Sinhala: කාල පරාසය */}
                            </div>
                        </th>
                        {timetable.days.map((day) => (
                            <th
                                key={day}
                                className="p-3 border dark:border-gray-600 text-center font-semibold text-gray-900 dark:text-gray-100"
                            >
                                {day}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {timetable.timeslots.map((timeslot, index) => (
                        <motion.tr
                            key={timeslot}
                            className="hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors duration-200"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                            <td className="p-3 border dark:border-gray-600 font-medium text-gray-900 dark:text-gray-100">
                                {timeslot}
                            </td>
                            {timetable.days.map((day) => (
                                <td
                                    key={day}
                                    className="p-3 border dark:border-gray-600 text-center"
                                    data-tooltip-id={`slot-${day}-${index}`}
                                    data-tooltip-content={
                                        timetable.schedule[day][index]
                                            ? `${timetable.schedule[day][index].courseCode} in ${timetable.schedule[day][index].roomName}`
                                            : "No class scheduled"
                                    }
                                >
                                    {timetable.schedule[day][index] ? (
                                        <motion.div
                                            className="space-y-1"
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                {timetable.schedule[day][index].courseCode}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {timetable.schedule[day][index].roomName}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <span className="text-gray-400 dark:text-gray-500">-</span>
                                    )}
                                    <Tooltip id={`slot-${day}-${index}`} place="top" />
                                </td>
                            ))}
                        </motion.tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default InstructorTimetable;