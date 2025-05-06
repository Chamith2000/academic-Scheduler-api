import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import Layout from "../../Layout/InstructorDashboard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "react-tooltip";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/styles.css";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Correct import for jspdf-autotable v5.x.x

const InstructorTimetable = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [timetable, setTimetable] = useState([]);
    const [timeslots, setTimeslots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    // Fetch instructor timetable
    const fetchTimetable = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get("http://localhost:8080/api/schedule/instructor/all", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            });
            setTimetable(response.data || []);
        } catch (error) {
            console.error(`Error fetching timetable: ${error}`);
            toast.error("Failed to fetch timetable");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch timeslots
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

    // Download timetable as Excel file
    const downloadTimetableExcel = () => {
        setIsDownloading(true);
        try {
            const excelData = [
                ["Course", "Time Slot", "Room", "Instructor", "Semester", "Year"],
                ...timetable.map((schedule) => [
                    schedule.courseCodes?.join(", ") || "N/A",
                    schedule.timeSlots?.join(", ") || "N/A",
                    schedule.roomNames?.join(", ") || "N/A",
                    schedule.instructorNames?.join(", ") || "N/A",
                    schedule.semester || "N/A",
                    schedule.year || "N/A",
                ]),
            ];

            const worksheet = XLSX.utils.aoa_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Timetable");
            XLSX.writeFile(workbook, "Instructor_Timetable.xlsx");
            toast.success("Timetable downloaded successfully as Excel");
        } catch (error) {
            console.error(`Error downloading timetable: ${error}`);
            toast.error("Failed to download timetable as Excel");
        } finally {
            setIsDownloading(false);
        }
    };

    // Download timetable as PDF file
    const downloadTimetablePDF = () => {
        setIsDownloading(true);
        try {
            const doc = new jsPDF();

            // Add title
            doc.setFontSize(18);
            doc.text("Instructor Timetable", 14, 20);

            // Prepare table data
            const tableData = timetable.map((schedule) => [
                schedule.courseCodes?.join(", ") || "N/A",
                schedule.timeSlots?.join(", ") || "N/A",
                schedule.roomNames?.join(", ") || "N/A",
                schedule.instructorNames?.join(", ") || "N/A",
                schedule.semester || "N/A",
                schedule.year || "N/A",
            ]);

            // Generate table using autoTable
            autoTable(doc, {
                head: [["Course", "Time Slot", "Room", "Instructor", "Semester", "Year"]],
                body: tableData,
                startY: 30,
                theme: "grid",
                styles: { fontSize: 10 },
                headStyles: { fillColor: [79, 70, 229] }, // Indigo color for header
            });

            // Save the PDF
            doc.save("Instructor_Timetable.pdf");
            toast.success("Timetable downloaded successfully as PDF");
        } catch (error) {
            console.error(`Error downloading timetable as PDF: ${error}`);
            toast.error("Failed to download timetable as PDF");
        } finally {
            setIsDownloading(false);
        }
    };

    useEffect(() => {
        if (auth?.accessToken) {
            fetchTimetable();
            fetchTimeslots();
        }
    }, [auth]);

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
                            </h1>
                            <p className="mt-2 text-indigo-100">
                                View and download your weekly teaching schedule.
                            </p>
                        </div>
                    </motion.div>

                    {/* Download Buttons */}
                    <div className="mb-6 flex justify-end space-x-4">
                        {/* Excel Download Button */}
                        <motion.button
                            onClick={downloadTimetableExcel}
                            disabled={isLoading || isDownloading}
                            className={`flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                                isDownloading || isLoading ? "opacity-50 cursor-not-allowed" : "hover:from-indigo-700 hover:to-blue-700"
                            }`}
                            whileHover={isDownloading || isLoading ? {} : { scale: 1.05 }}
                            whileTap={isDownloading || isLoading ? {} : { scale: 0.95 }}
                            data-tooltip-id="download-timetable-excel"
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
                                    Excel
                                </>
                            )}
                        </motion.button>
                        <Tooltip id="download-timetable-excel" place="top" />

                        {/* PDF Download Button */}
                        <motion.button
                            onClick={downloadTimetablePDF}
                            disabled={isLoading || isDownloading}
                            className={`flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                                isDownloading || isLoading ? "opacity-50 cursor-not-allowed" : "hover:from-indigo-700 hover:to-blue-700"
                            }`}
                            whileHover={isDownloading || isLoading ? {} : { scale: 1.05 }}
                            whileTap={isDownloading || isLoading ? {} : { scale: 0.95 }}
                            data-tooltip-id="download-timetable-pdf"
                            data-tooltip-content="Download your timetable as a PDF file"
                        >
                            {isDownloading ? (
                                <div className="flex items-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Downloading...
                                </div>
                            ) : (
                                <>
                                    <Download className="w-5 h-5 mr-2" />
                                    PDF
                                </>
                            )}
                        </motion.button>
                        <Tooltip id="download-timetable-pdf" place="top" />
                    </div>

                    {/* Timetable Display */}
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading timetable...</p>
                        </div>
                    ) : timetable.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 dark:text-gray-300">No schedule found for your account.</p>
                            <motion.button
                                onClick={fetchTimetable}
                                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Retry
                            </motion.button>
                        </div>
                    ) : (
                        <TimetableDisplay timetable={timetable} timeslots={timeslots} />
                    )}
                </motion.div>
            </section>
        </Layout>
    );
};

// TimetableDisplay component (unchanged)
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
            formattedTimetable.schedule[day] = Array(uniqueTimeslots.length).fill(null).map(() => []);
        });

        scheduleData.forEach((schedule) => {
            schedule.timeSlots.forEach((timeSlot, index) => {
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

                formattedTimetable.schedule[day][timetableIndex].push({
                    courseCode: schedule.courseCodes[index] || "Unknown",
                    instructorName: schedule.instructorNames[index] || "Unknown",
                    roomName: schedule.roomNames[index] || "Unknown",
                });
            });
        });

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
                                const classDataList = formattedData.schedule[day][index];
                                return (
                                    <TableCell key={day} sx={{ p: 1 }}>
                                        {classDataList.length > 0 ? (
                                            classDataList.map((classData, idx) => (
                                                <Box
                                                    key={idx}
                                                    sx={{
                                                        p: 2,
                                                        mb: classDataList.length - 1 === idx ? 0 : 1,
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
                                            ))
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

export default InstructorTimetable;