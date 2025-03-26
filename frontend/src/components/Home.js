import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../Layout/DashboardLayout";
import { useContext } from "react";
import AuthContext from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "../styles/styles.css";

const Home = () => {
    const [semester, setSemester] = useState(1);
    const [timetables, setTimetables] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const { setAuth } = useContext(AuthContext);
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [timeslots, setTimeslots] = useState([]);
    const [resetLoading, setResetLoading] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [activeTab, setActiveTab] = useState(0); // Track active timetable tab

    const fetchTimeslots = () => {
        axios
            .get("http://localhost:8080/api/timeslots", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                setTimeslots(response.data.map(timeslot => {
                    const startHour = timeslot.startTime.slice(0, 5);
                    const endHour = timeslot.endTime.slice(0, 5);
                    return `${timeslot.day}: ${startHour} - ${endHour}`;
                }));
            })
            .catch((error) => console.error(`Error: ${error}`));
    };

    const generateTimetable = (event) => {
        event.preventDefault();
        setLoading(true);
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
            .then((response) => {
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
                            if (response.data === 'COMPLETED') {
                                clearInterval(intervalId);
                                setLoading(false);
                                setIsCompleted(true);
                                setTimeout(() => {
                                    fetchTimetables();
                                    setIsCompleted(false);
                                }, 1500);
                            }
                        })
                        .catch((error) => console.error(`Error: ${error}`));
                }, 5000);
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
                setLoading(false);
            });
    };

    const handleFilter = (filters) => {
        let filteredData = [...timetables];

        if (filters.ID) {
            filteredData = filteredData.filter(
                (item) => item.id === Number(filters.ID)
            );
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
            .then((response) => {
                setResetLoading(false);
                setIsCompleted(true);
                setTimeout(() => {
                    fetchTimetables();
                    setIsCompleted(false);
                }, 1500);
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
                setResetLoading(false);
            });
    };

    const cancelReset = () => {
        setShowResetModal(false);
    };

    const fetchTimetables = () => {
        axios
            .get("http://localhost:8080/api/schedule/timetables", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                setTimetables(response.data);
                setOriginalData(response.data);
            })
            .catch((error) => console.error(`Error: ${error}`));
    };

    useEffect(() => {
        fetchTimetables();
        fetchTimeslots();
    }, []);

    return (
        <Layout>
            <main className="px-6 py-8 max-w-7xl mx-auto">
                {(loading || isCompleted) && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
                            {isCompleted ? (
                                <div className="text-green-500 text-6xl mb-4">✓</div>
                            ) : (
                                <div className="loader-ring mb-4"></div>
                            )}
                            <p className="text-lg font-medium">
                                {isCompleted
                                    ? "Successfully generated timetables!"
                                    : "Generating timetables..."}
                            </p>
                        </div>
                    </div>
                )}

                {showResetModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                            <h2 className="text-xl font-bold mb-4">Confirm Reset</h2>
                            <p className="mb-6 text-gray-700">
                                Are you sure you want to reset all schedules? This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                    onClick={cancelReset}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                    onClick={confirmHardReset}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Academic Scheduler
                    </h1>

                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Generate Timetable</h2>
                    <form className="flex flex-wrap gap-6 items-end">
                        <div className="w-64">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={semester}
                                onChange={(e) => setSemester(parseInt(e.target.value))}
                            >
                                <option value={1}>Semester 1</option>
                                <option value={2}>Semester 2</option>
                            </select>
                        </div>
                        <button
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center"
                            onClick={generateTimetable}
                            disabled={loading}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1z" clipRule="evenodd" />
                            </svg>
                            Generate Timetable
                        </button>
                        <button
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center"
                            onClick={handleHardReset}
                            disabled={resetLoading}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 0 1 1 1v2.101a7.002 7.002 0 0 1 11.601 2.566 1 1 0 1 1-1.885.666A5.002 5.002 0 0 0 5.999 7H9a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm.008 9.057a1 1 0 0 1 1.276.61A5.002 5.002 0 0 0 14.001 13H11a1 1 0 1 1 0-2h5a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-2.101a7.002 7.002 0 0 1-11.601-2.566 1 1 0 0 1 .61-1.276z" clipRule="evenodd" />
                            </svg>
                            Reset Schedules
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Timetables</h2>
                        <div className="flex space-x-2">
                            <Filter
                                columns={[
                                    "ID",
                                    "Course Codes",
                                    "Time Slots",
                                    "Instructor Names",
                                    "Room Names",
                                ]}
                                onFilter={handleFilter}
                            />
                            <button
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors flex items-center"
                                onClick={handleReset}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 2a1 1 0 0 1 1 1v2.101a7.002 7.002 0 0 1 11.601 2.566 1 1 0 1 1-1.885.666A5.002 5.002 0 0 0 5.999 7H9a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm.008 9.057a1 1 0 0 1 1.276.61A5.002 5.002 0 0 0 14.001 13H11a1 1 0 1 1 0-2h5a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-2.101a7.002 7.002 0 0 1-11.601-2.566 1 1 0 0 1 .61-1.276z" clipRule="evenodd" />
                                </svg>
                                Reset Filters
                            </button>
                        </div>
                    </div>

                    {timetables.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-lg">No timetables available. Generate one to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden">
                            <div className="flex border-b border-gray-200 mb-4">
                                {timetables.map((item, index) => (
                                    <button
                                        key={item.id}
                                        className={`py-2 px-4 font-medium ${
                                            activeTab === index
                                                ? "border-b-2 border-blue-500 text-blue-600"
                                                : "text-gray-500 hover:text-gray-700"
                                        }`}
                                        onClick={() => setActiveTab(index)}
                                    >
                                        Timetable {item.id}
                                    </button>
                                ))}
                            </div>
                            {timetables.length > 0 && (
                                <TimetableDisplay
                                    timetable={timetables[activeTab]}
                                    timeslots={timeslots}
                                />
                            )}
                        </div>
                    )}
                </div>
            </main>
        </Layout>
    );
};

const TimetableDisplay = ({ timetable, timeslots }) => {
    // Extract unique timeslots from the timeslots prop
    const uniqueTimeslots = [...new Set(timeslots.map(timeSlot => timeSlot.split(': ')[1]))];

    const formatTimetableData = (scheduleData, uniqueTimeslots) => {
        const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

        // Initialize timetable
        let formattedTimetable = {
            days: daysOfWeek,
            timeslots: uniqueTimeslots,
            schedule: {}
        };

        // Initialize schedule with empty arrays
        daysOfWeek.forEach(day => {
            formattedTimetable.schedule[day] = Array(uniqueTimeslots.length).fill(null);
        });

        // Populate schedule with data
        scheduleData.timeSlots.forEach((timeSlot, index) => {
            const [day, timeslot] = timeSlot.split(': ');
            const timeslotStripped = timeslot.trim(); // remove leading and trailing spaces
            const timetableIndex = uniqueTimeslots.indexOf(timeslotStripped);

            if (timetableIndex !== -1) {
                formattedTimetable.schedule[day][timetableIndex] = {
                    courseCode: scheduleData.courseCodes[index],
                    instructorName: scheduleData.instructorNames[index],
                    roomName: scheduleData.roomNames[index]
                };
            }
        });

        return formattedTimetable;
    };

    const formattedData = formatTimetableData(timetable, uniqueTimeslots);

    // Helper function to get class colors
    const getCourseColor = (courseCode) => {
        const colors = [
            'bg-blue-100 border-blue-300',
            'bg-green-100 border-green-300',
            'bg-purple-100 border-purple-300',
            'bg-yellow-100 border-yellow-300',
            'bg-red-100 border-red-300',
            'bg-indigo-100 border-indigo-300',
            'bg-pink-100 border-pink-300',
            'bg-teal-100 border-teal-300'
        ];

        // Generate a deterministic color based on the course code
        const index = courseCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        return colors[index];
    };

    return (
        <div className="overflow-x-auto">
            <div className="mb-4 text-sm text-gray-500">
                {timetable.message && <p>{timetable.message}</p>}
            </div>
            <table className="w-full border-collapse">
                <thead>
                <tr>
                    <th className="px-4 py-2 border bg-gray-100 text-left font-semibold text-gray-700">Time Slot</th>
                    {formattedData.days.map(day => (
                        <th key={day} className="px-4 py-2 border bg-gray-100 text-left font-semibold text-gray-700">{day}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {formattedData.timeslots.map((timeslot, index) => (
                    <tr key={timeslot} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="border px-4 py-3 font-medium text-gray-800">{timeslot}</td>
                        {formattedData.days.map(day => {
                            const classData = formattedData.schedule[day][index];
                            return (
                                <td key={day} className="border px-2 py-1">
                                    {classData ? (
                                        <div className={`p-2 rounded-md border ${getCourseColor(classData.courseCode)}`}>
                                            <div className="font-bold">{classData.courseCode}</div>
                                            <div className="text-sm mt-1">{classData.instructorName}</div>
                                            <div className="text-xs text-gray-500 mt-1">Room: {classData.roomName}</div>
                                        </div>
                                    ) : (
                                        <div className="h-16"></div>
                                    )}
                                </td>
                            );
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

const Filter = ({ columns, onFilter }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({});

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleFilterSubmit = (event) => {
        event.preventDefault();
        onFilter(filters);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-.293.707L12 11.414V15a1 1 0 0 1-.293.707l-2 2A1 1 0 0 1 8 17v-5.586L3.293 6.707A1 1 0 0 1 3 6V3z" clipRule="evenodd" />
                </svg>
                Filter
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-2 right-0 w-72 bg-white rounded-md shadow-lg p-4 border border-gray-200">
                    <h3 className="text-lg font-medium mb-3">Filter Timetables</h3>
                    <form onSubmit={handleFilterSubmit}>
                        {columns.map((column) => (
                            <div key={column} className="mb-3">
                                <label htmlFor={column} className="block text-sm font-medium text-gray-700 mb-1">
                                    {column}
                                </label>
                                <input
                                    type="text"
                                    id={column}
                                    name={column}
                                    value={filters[column] || ''}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder={`Filter by ${column}`}
                                />
                            </div>
                        ))}
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Home;