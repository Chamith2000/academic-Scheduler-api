import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Modal,
    Fade,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthProvider";
import Filter from "../components/Filter";
import DashboardLayout from "../Layout/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
    HiRefresh,
    HiCalendar,
    HiAcademicCap,
    HiCog,
    HiDocumentText
} from "react-icons/hi";
import { Tooltip } from "react-tooltip";

const Home = () => {
    const { auth } = useContext(AuthContext);
    const [semester, setSemester] = useState(1);
    const [timetables, setTimetables] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [timeslots, setTimeslots] = useState([]);
    const [resetLoading, setResetLoading] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.accessToken) {
            navigate("/login");
        }
    }, [auth, navigate]);

    const fetchTimeslots = () => {
        axios
            .get("http://localhost:8080/api/timeslots", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                setTimeslots(
                    response.data.map((timeslot) => {
                        const startHour = timeslot.startTime.slice(0, 5);
                        const endHour = timeslot.endTime.slice(0, 5);
                        return `${timeslot.day}: ${startHour} - ${endHour}`;
                    })
                );
            })
            .catch((error) => {
                setError("Failed to fetch timeslots: " + (error.message || "Unknown error"));
                console.error(`Error: ${error}`);
            });
    };

    const generateTimetable = (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        axios
            .post(
                `http://localhost:8080/api/schedule/generate?semester=${semester}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${auth.accessToken}`,
                    },
                }
            )
            .then(() => {
                let attempts = 0;
                const maxAttempts = 24; // Poll for up to 2 minutes
                let intervalId = setInterval(() => {
                    axios
                        .get(
                            `http://localhost:8080/api/schedule/status?semester=${semester}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${auth.accessToken}`,
                                },
                            }
                        )
                        .then((response) => {
                            console.log("Status:", response.data);
                            if (response.data === "COMPLETED" || response.data === "SUCCESS") {
                                clearInterval(intervalId);
                                setLoading(false);
                                setIsCompleted(true);
                                setTimeout(() => {
                                    fetchTimetables();
                                    setIsCompleted(false);
                                }, 1500);
                            } else if (response.data.includes("FAILED")) {
                                clearInterval(intervalId);
                                setLoading(false);
                                setError("Timetable generation failed: " + response.data);
                            } else if (attempts >= maxAttempts) {
                                clearInterval(intervalId);
                                setLoading(false);
                                setError("Timetable generation timed out. Please try again.");
                            }
                            attempts++;
                        })
                        .catch((error) => {
                            setError("Failed to check status: " + (error.message || "Unknown error"));
                            console.error(`Error: ${error}`);
                            clearInterval(intervalId);
                            setLoading(false);
                        });
                }, 5000);
            })
            .catch((error) => {
                setError("Failed to start timetable generation: " + (error.message || "Unknown error"));
                console.error(`Error: ${error}`);
                setLoading(false);
            });
    };

    const fetchTimetables = () => {
        const endpoint =
            auth.role === "STUDENT"
                ? `http://localhost:8080/api/schedule/myTimetable?semester=${semester}`
                : auth.role === "INSTRUCTOR"
                    ? `http://localhost:8080/api/schedule/instructor?semester=${semester}`
                    : `http://localhost:8080/api/schedule/timetables?semester=${semester}`;

        axios
            .get(endpoint, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                console.log("Fetched Timetables:", response.data);
                setTimetables(response.data);
                setOriginalData(response.data);
            })
            .catch((error) => {
                if (error.response?.status === 404) {
                    setError("Timetables endpoint not found. Please check the backend configuration.");
                } else if (error.response?.status === 400) {
                    setError("Invalid semester value. Please select Semester 1 or 2.");
                } else {
                    setError("Failed to fetch timetables: " + (error.message || "Unknown error"));
                }
                console.error(`Error: ${error}`);
            });
    };

    const handleHardReset = () => {
        setShowResetModal(true);
    };

    const confirmHardReset = () => {
        setResetLoading(true);
        setShowResetModal(false);
        axios
            .post("http://localhost:8080/reset", null, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then(() => {
                setResetLoading(false);
                setIsCompleted(true);
                setTimeout(() => {
                    fetchTimetables();
                    setIsCompleted(false);
                }, 1500);
            })
            .catch((error) => {
                setError("Failed to reset schedules: " + (error.message || "Unknown error"));
                console.error(`Error: ${error}`);
                setResetLoading(false);
            });
    };

    const cancelReset = () => {
        setShowResetModal(false);
    };

    const handleFilter = (filters) => {
        let filteredData = [...originalData];

        if (filters.ID) {
            filteredData = filteredData.filter((item) => item.id === Number(filters.ID));
        }

        if (filters["Course Codes"]) {
            filteredData = filteredData.filter((item) =>
                item.courseCodes.some((courseCode) =>
                    courseCode.toLowerCase().includes(filters["Course Codes"].toLowerCase())
                )
            );
        }

        if (filters["Time Slots"]) {
            filteredData = filteredData.filter((item) =>
                item.timeSlots.some((timeSlot) =>
                    timeSlot.toLowerCase().includes(filters["Time Slots"].toLowerCase())
                )
            );
        }

        if (filters["Instructor Names"]) {
            filteredData = filteredData.filter((item) =>
                item.instructorNames.some((instructorName) =>
                    instructorName.toLowerCase().includes(filters["Instructor Names"].toLowerCase())
                )
            );
        }

        if (filters["Room Names"]) {
            filteredData = filteredData.filter((item) =>
                item.roomNames.some((roomName) =>
                    roomName.toLowerCase().includes(filters["Room Names"].toLowerCase())
                )
            );
        }

        setTimetables(filteredData);
    };

    const handleReset = () => {
        setTimetables(originalData);
    };

    useEffect(() => {
        if (auth.accessToken) {
            fetchTimetables();
            fetchTimeslots();
        }
    }, [auth.accessToken, auth.role, semester]);

    return (
        <DashboardLayout>
            <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-neutral-800">
                {/* Loading/Success Overlay */}
                {(loading || isCompleted) && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <motion.div
                            className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center shadow-xl"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            {isCompleted ? (
                                <div className="text-6xl text-green-500 mb-4">✓</div>
                            ) : (
                                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            )}
                            <p className="text-lg font-medium text-gray-800 dark:text-white mt-4">
                                {isCompleted ? "Successfully generated timetables!" : "Generating timetables..."}
                            </p>
                        </motion.div>
                    </div>
                )}

                {/* Reset Modal */}
                <Modal open={showResetModal} onClose={cancelReset}>
                    <Fade in={showResetModal}>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Confirm Reset</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Are you sure you want to reset all schedules? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-4">
                                <motion.button
                                    onClick={cancelReset}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    onClick={confirmHardReset}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium shadow-md"
                                    whileHover={{ scale: 1.03, boxShadow: "0 5px 15px rgba(239, 68, 68, 0.3)" }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Reset
                                </motion.button>
                            </div>
                        </div>
                    </Fade>
                </Modal>

                <AnimatePresence>
                    <motion.div
                        className="main-content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Page Header */}
                        <div className="mb-8">
                            <motion.div
                                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-lg shadow-lg"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h1 className="text-3xl font-bold">Academic Scheduler</h1>
                                <p className="mt-2 text-indigo-100">
                                    Manage your academic timetables efficiently with Academic Scheduler.
                                </p>
                                {/* Error message displayed immediately under the header */}
                                {error && (
                                    <motion.div
                                        className="mt-4 text-white border-l-4 border-white pl-3"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                                            </svg>
                                            <span>{error}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>

                        {/* Admin Controls Section */}
                        {auth.role === "ADMIN" && (
                            <motion.div
                                className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
                                whileHover={{ scale: 1.01 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center mb-4">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                        <HiDocumentText className="w-6 h-6" />
                                    </div>
                                    <h2 className="ml-3 text-xl font-semibold text-gray-800 dark:text-white">Generate Timetable</h2>
                                </div>

                                <div className="flex flex-wrap gap-4 items-end">
                                    <div className="w-48">
                                        <FormControl fullWidth>
                                            <InputLabel>Semester</InputLabel>
                                            <Select
                                                value={semester}
                                                label="Semester"
                                                onChange={(e) => setSemester(parseInt(e.target.value))}
                                                disabled={loading}
                                                className="bg-gray-50 dark:bg-gray-700"
                                            >
                                                <MenuItem value={1}>Semester 1</MenuItem>
                                                <MenuItem value={2}>Semester 2</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>

                                    <motion.button
                                        onClick={generateTimetable}
                                        disabled={loading}
                                        className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(79, 70, 229, 0.4)" }}
                                        whileTap={{ scale: 0.95 }}
                                        data-tooltip-id="generate-tooltip"
                                        data-tooltip-content="Create new timetable for selected semester"
                                    >
                                        <HiCalendar className="mr-2 h-5 w-5" />
                                        Generate Timetable
                                    </motion.button>

                                    <motion.button
                                        onClick={handleHardReset}
                                        disabled={resetLoading}
                                        className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(239, 68, 68, 0.4)" }}
                                        whileTap={{ scale: 0.95 }}
                                        data-tooltip-id="reset-tooltip"
                                        data-tooltip-content="Reset all schedule data"
                                    >
                                        <HiRefresh className="mr-2 h-5 w-5" />
                                        Reset Schedules
                                    </motion.button>

                                    <Tooltip id="generate-tooltip" place="top" />
                                    <Tooltip id="reset-tooltip" place="top" />
                                </div>
                            </motion.div>
                        )}

                        {/* Semester Selector */}
                        <motion.div
                            className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex items-center mb-4">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                    <HiAcademicCap className="w-6 h-6" />
                                </div>
                                <h2 className="ml-3 text-xl font-semibold text-gray-800 dark:text-white">View Timetable</h2>
                            </div>

                            <div className="w-48">
                                <FormControl fullWidth>
                                    <InputLabel>Semester</InputLabel>
                                    <Select
                                        value={semester}
                                        label="Semester"
                                        onChange={(e) => setSemester(parseInt(e.target.value))}
                                        className="bg-gray-50 dark:bg-gray-700"
                                    >
                                        <MenuItem value={1}>Semester 1</MenuItem>
                                        <MenuItem value={2}>Semester 2</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        </motion.div>

                        {/* Timetable Display */}
                        <motion.div
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <div className="flex flex-wrap justify-between items-center mb-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 mr-3">
                                        <HiCalendar className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                        {auth.role === "ADMIN"
                                            ? `Semester ${semester} Timetable`
                                            : auth.role === "INSTRUCTOR"
                                                ? `Your Semester ${semester} Timetable`
                                                : `Your Semester ${semester} Student Timetable`}
                                    </h2>
                                </div>

                                {timetables.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
                                        <Filter
                                            columns={["ID", "Course Codes", "Time Slots", "Instructor Names", "Room Names"]}
                                            onFilter={handleFilter}
                                        />
                                        <motion.button
                                            onClick={handleReset}
                                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium"
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Reset Filters
                                        </motion.button>
                                    </div>
                                )}
                            </div>

                            {timetables.length === 0 ? (
                                <motion.div
                                    className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                >
                                    <div className="mx-auto w-16 h-16 text-gray-400 mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                                        No timetables available for Semester {semester}.
                                        {auth.role === "ADMIN" && " Generate one to get started."}
                                    </p>
                                </motion.div>
                            ) : (
                                // Keep timetable display as is
                                <TimetableDisplay timetable={timetables} timeslots={timeslots} />
                            )}
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

// Kept TimetableDisplay component unchanged as per request
const TimetableDisplay = ({ timetable, timeslots }) => {
    const daysOfWeek = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];
    const uniqueTimeslots = [...new Set(timeslots.map((timeSlot) => timeSlot.split(": ")[1]))];

    const formatTimetableData = (scheduleData, uniqueTimeslots) => {
        let formattedTimetable = {
            days: daysOfWeek,
            timeslots: uniqueTimeslots,
            schedule: {},
        };

        daysOfWeek.forEach((day) => {
            formattedTimetable.schedule[day] = Array(uniqueTimeslots.length).fill(null);
        });

        console.log("Schedule Data:", scheduleData);
        console.log("Unique Timeslots:", uniqueTimeslots);

        scheduleData.forEach((schedule) => {
            schedule.timeSlots.forEach((timeSlot, index) => {
                console.log("Processing timeSlot:", timeSlot);
                const splitResult = timeSlot.split(": ");
                if (splitResult.length < 2) {
                    console.warn(`Invalid timeSlot format: ${timeSlot}`);
                    return;
                }
                let [day, timeslot] = splitResult;
                day = day.trim().charAt(0).toUpperCase() + day.slice(1).toLowerCase();
                const timeslotStripped = timeslot?.trim() || "";

                if (!daysOfWeek.includes(day)) {
                    console.warn(`Invalid day: ${day}`);
                    return;
                }

                const timetableIndex = uniqueTimeslots.indexOf(timeslotStripped);
                if (timetableIndex === -1) {
                    console.warn(`Timeslot not found in uniqueTimeslots: ${timeslotStripped}`);
                    return;
                }

                formattedTimetable.schedule[day][timetableIndex] = {
                    courseCode: schedule.courseCodes[index] || "Unknown",
                    instructorName: schedule.instructorNames[index] || "Unknown",
                    roomName: schedule.roomNames[index] || "Unknown",
                };
            });
        });

        console.log("Formatted Timetable:", formattedTimetable);
        return formattedTimetable;
    };

    const getCourseColor = (courseCode) => {
        const colors = [
            "bg-blue-100 border-blue-300",
            "bg-green-100 border-green-300",
            "bg-purple-100 border-purple-300",
            "bg-yellow-100 border-yellow-300",
            "bg-red-100 border-red-300",
            "bg-indigo-100 border-indigo-300",
            "bg-pink-100 border-pink-300",
            "bg-teal-100 border-teal-300",
        ];
        const index =
            courseCode.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        return colors[index];
    };

    const formattedData = formatTimetableData(timetable, uniqueTimeslots);

    return (
        <TableContainer component={Paper} sx={{ maxWidth: "100%", overflowX: "auto" }}>
            {timetable.length > 0 && timetable[0].message && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    {timetable[0].message}
                </Typography>
            )}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Time Slot</TableCell>
                        {formattedData.days.map((day) => (
                            <TableCell key={day} sx={{ fontWeight: "bold" }}>
                                {day}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {formattedData.timeslots.map((timeslot, index) => (
                        <TableRow key={timeslot} sx={{ bgcolor: index % 2 === 0 ? "grey.50" : "white" }}>
                            <TableCell>{timeslot}</TableCell>
                            {formattedData.days.map((day) => {
                                const classData = formattedData.schedule[day][index];
                                return (
                                    <TableCell key={day} sx={{ p: 1 }}>
                                        {classData ? (
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 1,
                                                    border: 1,
                                                    borderColor: getCourseColor(classData.courseCode).split(" ")[1],
                                                    bgcolor: getCourseColor(classData.courseCode).split(" ")[0],
                                                }}
                                            >
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {classData.courseCode}
                                                </Typography>
                                                <Typography variant="body2">{classData.instructorName}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Room: {classData.roomName}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box sx={{ minHeight: 64 }} />
                                        )}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default Home;