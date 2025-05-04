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
    Tabs,
    Tab,
    Modal,
    Fade,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthProvider";
import Filter from "../components/Filter";

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
    const [activeTab, setActiveTab] = useState(0);
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
                                    setActiveTab(0);
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
                ? "http://localhost:8080/api/schedule/myTimetable"
                : auth.role === "INSTRUCTOR"
                    ? "http://localhost:8080/api/schedule/instructor"
                    : "http://localhost:8080/api/schedule/timetables";

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
    }, [auth.accessToken, auth.role]);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {(loading || isCompleted) && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 50,
                    }}
                >
                    <Box sx={{ bgcolor: "white", p: 4, borderRadius: 2, textAlign: "center" }}>
                        {isCompleted ? (
                            <Typography color="success.main" variant="h4">
                                ✓
                            </Typography>
                        ) : (
                            <CircularProgress />
                        )}
                        <Typography variant="body1" mt={2}>
                            {isCompleted ? "Successfully generated timetables!" : "Generating timetables..."}
                        </Typography>
                    </Box>
                </Box>
            )}

            <Modal open={showResetModal} onClose={cancelReset}>
                <Fade in={showResetModal}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            bgcolor: "white",
                            p: 4,
                            borderRadius: 2,
                            width: 400,
                        }}
                    >
                        <Typography variant="h6" mb={2}>
                            Confirm Reset
                        </Typography>
                        <Typography mb={4}>
                            Are you sure you want to reset all schedules? This action cannot be undone.
                        </Typography>
                        <Box display="flex" justifyContent="end" gap={2}>
                            <Button variant="outlined" onClick={cancelReset}>
                                Cancel
                            </Button>
                            <Button variant="contained" color="error" onClick={confirmHardReset}>
                                Reset
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Typography variant="h4" gutterBottom>
                Academic Scheduler
            </Typography>

            {auth.role === "ADMIN" && (
                <Box sx={{ bgcolor: "white", p: 4, borderRadius: 2, mb: 4, boxShadow: 1 }}>
                    <Typography variant="h6" mb={2}>
                        Generate Timetable
                    </Typography>
                    <Box component="form" display="flex" gap={2} alignItems="flex-end">
                        <TextField
                            label="Semester"
                            type="number"
                            value={semester}
                            onChange={(e) => setSemester(parseInt(e.target.value))}
                            sx={{ width: 200 }}
                            disabled={loading}
                        />
                        <Button
                            variant="contained"
                            onClick={generateTimetable}
                            disabled={loading}
                            startIcon={<span>📅</span>}
                        >
                            Generate Timetable
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleHardReset}
                            disabled={resetLoading}
                            startIcon={<span>🔄</span>}
                        >
                            Reset Schedules
                        </Button>
                    </Box>
                </Box>
            )}

            <Box sx={{ bgcolor: "white", p: 4, borderRadius: 2, boxShadow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                        {auth.role === "ADMIN"
                            ? "All Timetables"
                            : auth.role === "INSTRUCTOR"
                                ? "Your Timetable"
                                : "Your Student Timetable"}
                    </Typography>
                    {timetables.length > 0 && (
                        <Box display="flex" gap={1}>
                            <Filter
                                columns={["ID", "Course Codes", "Time Slots", "Instructor Names", "Room Names"]}
                                onFilter={handleFilter}
                            />
                            <Button variant="outlined" onClick={handleReset}>
                                Reset Filters
                            </Button>
                        </Box>
                    )}
                </Box>
                {timetables.length === 0 ? (
                    <Box textAlign="center" py={8}>
                        <Typography variant="body1" color="text.secondary">
                            No timetables available. Generate one to get started.
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Tabs
                            value={activeTab}
                            onChange={(e, newValue) => setActiveTab(newValue)}
                            sx={{ mb: 2 }}
                        >
                            {timetables.map((item, index) => (
                                <Tab key={item.id || index} label={`Timetable ${item.id || index + 1}`} />
                            ))}
                        </Tabs>
                        {timetables[activeTab] && (
                            <TimetableDisplay timetable={timetables[activeTab]} timeslots={timeslots} />
                        )}
                    </>
                )}
            </Box>
        </Container>
    );
};

const TimetableDisplay = ({ timetable, timeslots }) => {
    const uniqueTimeslots = [...new Set(timeslots.map((timeSlot) => timeSlot.split(": ")[1]))];

    const formatTimetableData = (scheduleData, uniqueTimeslots) => {
        const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
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

        scheduleData.timeSlots.forEach((timeSlot, index) => {
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
                courseCode: scheduleData.courseCodes[index] || "Unknown",
                instructorName: scheduleData.instructorNames[index] || "Unknown",
                roomName: scheduleData.roomNames[index] || "Unknown",
            };
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
        <TableContainer component={Paper}>
            {timetable.message && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    {timetable.message}
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