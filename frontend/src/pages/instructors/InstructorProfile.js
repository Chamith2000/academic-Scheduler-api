import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import axios from "axios";
import { Button } from "react-bootstrap";
import * as XLSX from "xlsx";
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
import {
    CalendarDaysIcon,
    ClockIcon,
    BuildingOffice2Icon,
    DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

const InstructorProfile = () => {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // Added to get current pathname

    const [instructorDetails, setInstructorDetails] = useState(null);
    const [courses, setCourses] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [timeslots, setTimeslots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    const NavItems = [
        { icon: HiHome, label: "Dashboard", path: "/instructor-dashboard", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiCalendar, label: "Timetable", path: "/instructor-timetable", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiAcademicCap, label: "Courses", path: "/instructor-courses", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiDocumentText, label: "Reports", path: "/instructor-reports", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiAdjustments, label: "Preferences", path: "/instructor-preferences", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiCog, label: "Settings", path: "/instructor-settings", bgGradient: "from-blue-500 to-blue-700" },
    ];

    // Fetch instructor details
    const fetchInstructorDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/instructors/${auth.instructorId}`, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            });
            setInstructorDetails(response.data);
        } catch (error) {
            console.error(`Error fetching instructor details: ${error}`);
        }
    };

    // Fetch instructor courses
    const fetchInstructorCourses = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/instructors/courses", {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            });
            setCourses(response.data);
        } catch (error) {
            console.error(`Error fetching courses: ${error}`);
        }
    };

    // Fetch instructor timetable
    const fetchTimetable = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/schedule/instructor", {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            });
            setTimetable(response.data);
        } catch (error) {
            console.error(`Error fetching timetable: ${error}`);
        }
    };

    // Fetch timeslots
    const fetchTimeslots = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/timeslots", {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
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
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([
                fetchInstructorDetails(),
                fetchInstructorCourses(),
                fetchTimetable(),
                fetchTimeslots(),
            ]);
            setIsLoading(false);
        };
        loadData();
    }, [auth]);

    const handleLogout = () => {
        setAuth(null);
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <section className="min-h-screen flex bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-neutral-800">
            <aside className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out ${isExpanded ? "w-64" : "w-20"} bg-white dark:bg-gray-800 shadow-xl`}>
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
                {auth && (
                    <div className="px-4 py-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <img
                                    className="w-12 h-12 rounded-full object-cover"
                                    src={auth.profilePicture || "/default-avatar.png"}
                                    alt="Profile"
                                />
                            </div>
                            {isExpanded && (
                                <div className="ml-4">
                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {auth.name || "Instructor"}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {auth.department || "Department"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <nav className="mt-8 px-4">
                    <ul className="space-y-2">
                        {NavItems.map((item, index) => (
                            <li key={index}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center p-3 rounded-lg transition-all duration-300 ${location.pathname === item.path ? `bg-gradient-to-r ${item.bgGradient} text-white` : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"} ${isExpanded ? "justify-start" : "justify-center"}`}
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
                        className={`w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-gray-900 font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center ${isExpanded ? "justify-start" : "justify-center"}`}
                    >
                        <HiLogout className="w-5 h-5" />
                        {isExpanded && <span className="ml-3">Logout</span>}
                    </button>
                </div>
            </aside>
            <main className={`flex-grow p-6 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-20"}`}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                    <h1 className="font-bold text-3xl mb-6">Instructor Profile</h1>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <>
                            {/* Instructor Details */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Personal Information</h2>
                                <div className="flex items-center">
                                    <img
                                        className="w-24 h-24 rounded-full object-cover mr-4"
                                        src={auth.profilePicture || "/default-avatar.png"}
                                        alt="Profile"
                                    />
                                    <div>
                                        <p className="text-lg font-medium">Name: {instructorDetails?.firstName} {instructorDetails?.lastName}</p>
                                        <p className="text-gray-600">Department: {instructorDetails?.department?.name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Courses */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Assigned Courses</h2>
                                {courses.length === 0 ? (
                                    <p className="text-gray-500">No courses assigned</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                            <tr>
                                                <th className="px-6 py-3 rounded-l-lg">Course</th>
                                                <th className="px-6 py-3">Year</th>
                                                <th className="px-6 py-3">Semester</th>
                                                <th className="px-6 py-3">Programme</th>
                                                <th className="px-6 py-3 rounded-r-lg">Department</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {courses.map((course, index) => (
                                                <tr key={course.id || index} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                                                    <td className="px-6 py-4 font-medium">
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-900">{course.courseName}</span>
                                                            <span className="text-gray-500 text-xs">{course.courseCode}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">{course.year}</td>
                                                    <td className="px-6 py-4">{course.semester}</td>
                                                    <td className="px-6 py-4">
                                                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                                {course.programmeName}
                                                            </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                                {course.deptName}
                                                            </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Timetable */}
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Weekly Timetable</h2>
                                <Timetable data={timetable} timeslots={timeslots} />
                            </div>
                        </>
                    )}
                </div>
            </main>
        </section>
    );
};

// Reusable Timetable Component
const Timetable = ({ data, timeslots }) => {
    const uniqueTimeslots = [...new Set(timeslots.map((timeSlot) => timeSlot.split(": ")[1]))];
    const scheduleData = Array.isArray(data) ? data[0] : data;
    const timetable = formatTimetableData(scheduleData, uniqueTimeslots);

    const downloadTimetable = () => {
        const excelData = [
            ["Time Slot", ...timetable.days],
            ...timetable.timeslots.map((timeslot, index) => [
                timeslot,
                ...timetable.days.map((day) => {
                    const slot = timetable.schedule[day][index];
                    return slot ? `${slot.courseCode} (${slot.roomName})` : "-";
                }),
            ]),
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Timetable");
        XLSX.writeFile(workbook, "Instructor_Timetable.xlsx");
    };

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Weekly Schedule</h2>
                <Button
                    onClick={downloadTimetable}
                    className="flex items-center bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                >
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                    Download Timetable
                </Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 border">Time Slot</th>
                        {timetable.days.map((day) => (
                            <th key={day} className="p-2 border">{day}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {timetable.timeslots.map((timeslot, index) => (
                        <tr key={timeslot}>
                            <td className="p-2 border font-medium">{timeslot}</td>
                            {timetable.days.map((day) => (
                                <td key={day} className="p-2 border text-center">
                                    {timetable.schedule[day][index] ? (
                                        <div>
                                            <div className="font-semibold">
                                                {timetable.schedule[day][index].courseCode}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {timetable.schedule[day][index].roomName}
                                            </div>
                                        </div>
                                    ) : (
                                        "-"
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Timetable Formatting Function
const formatTimetableData = (scheduleData, uniqueTimeslots) => {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    let timetable = {
        days: daysOfWeek,
        timeslots: uniqueTimeslots,
        schedule: {},
    };
    daysOfWeek.forEach((day) => {
        timetable.schedule[day] = Array(uniqueTimeslots.length).fill(null);
    });
    if (scheduleData?.timeSlots) {
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
    return timetable;
};

export default InstructorProfile;