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
    HiUserGroup,
} from "react-icons/hi";
import { FaCalendarAlt } from "react-icons/fa";
import useAuth from "../hooks/useAuth";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InstructorDashboardPage = () => {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [instructors, setInstructors] = useState([]);
    const [timeslots, setTimeslots] = useState([]);
    const [selectedInstructor, setSelectedInstructor] = useState("");
    const [selectedTimeslot, setSelectedTimeslot] = useState("");
    const [showPreferenceModal, setShowPreferenceModal] = useState(false);

    // Form validation errors
    const [formErrors, setFormErrors] = useState({
        instructorSelect: "",
        timeslotSelect: ""
    });

    const handleLogout = () => {
        setAuth(null);
        localStorage.removeItem("user");
        navigate("/login");
    };

    const NavItems = [
        {
            icon: HiHome,
            label: "Dashboard",
            path: "/instructor-dashboard",
            bgGradient: "from-blue-500 to-blue-700"
        },
        {
            icon: HiCalendar,
            label: "Timetable",
            path: "/instructor-timetable",
            bgGradient: "from-blue-500 to-blue-700"
        },
        {
            icon: HiAcademicCap,
            label: "Courses",
            path: "/instructor-courses",
            bgGradient: "from-blue-500 to-blue-700"
        },
        {
            icon: HiDocumentText,
            label: "Reports",
            path: "/instructor-reports",
            bgGradient: "from-blue-500 to-blue-700"
        },
        {
            icon: HiAdjustments,
            label: "Preferences",
            path: "/instructor-preferences",
            bgGradient: "from-blue-500 to-blue-700"
        },
        {
            icon: HiCog,
            label: "Settings",
            path: "/instructor-settings",
            bgGradient: "from-blue-500 to-blue-700"
        }
    ];

    const QuickStatCard = ({ icon: Icon, title, value, change, positive }) => (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg">
                    <Icon className="w-6 h-6" />
                </div>
                <span className={`font-semibold ${positive ? 'text-green-600' : 'text-red-600'}`}>
                    {change > 0 ? '+' : ''}{change}%
                </span>
            </div>
            <div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm mb-1">{title}</h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
            </div>
        </div>
    );

    const RecentActivityItem = ({ course, action, time }) => (
        <div className="flex items-center justify-between py-3 border-b last:border-b-0 dark:border-gray-700">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <HiAcademicCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{course}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{action}</p>
                </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{time}</span>
        </div>
    );

    const [stats, setStats] = useState({
        totalCourses: 0,
        activeStudents: 0,
        assignmentsPending: 0,
        upcomingClasses: 0
    });

    useEffect(() => {
        // Simulated data fetch
        setStats({
            totalCourses: 5,
            activeStudents: 124,
            assignmentsPending: 32,
            upcomingClasses: 3
        });
        fetchInstructors();
        fetchTimeSlots();
    }, []);

    const recentActivities = [
        { course: 'Data Structures', action: 'Graded Assignment', time: '2 hours ago' },
        { course: 'Machine Learning', action: 'Posted New Lecture', time: 'Yesterday' },
        { course: 'Web Development', action: 'Created Quiz', time: '3 days ago' },
        { course: 'Database Systems', action: 'Updated Syllabus', time: 'Last week' }
    ];

    // Validation functions
    const validateInstructorSelect = (value) => {
        if (!value) return "Please select an instructor";
        return "";
    };

    const validateTimeslotSelect = (value) => {
        if (!value) return "Please select a time slot";
        return "";
    };

    // Real-time validation handlers
    const handleInstructorSelectChange = (e) => {
        const value = e.target.value;
        setSelectedInstructor(value);
        setFormErrors(prev => ({ ...prev, instructorSelect: validateInstructorSelect(value) }));
    };

    const handleTimeslotSelectChange = (e) => {
        const value = e.target.value;
        setSelectedTimeslot(value);
        setFormErrors(prev => ({ ...prev, timeslotSelect: validateTimeslotSelect(value) }));
    };

    // Form submission validation
    const validatePreferenceForm = () => {
        const errors = {
            instructorSelect: validateInstructorSelect(selectedInstructor),
            timeslotSelect: validateTimeslotSelect(selectedTimeslot)
        };
        setFormErrors(prev => ({ ...prev, ...errors }));
        return Object.values(errors).every(error => !error);
    };

    const fetchInstructors = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/instructors", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            });
            setInstructors(response.data);
        } catch (error) {
            console.error(`Error fetching instructors: ${error}`);
            toast.error("Failed to fetch instructors");
        }
    };

    const fetchTimeSlots = async () => {
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

    const handleAddPreference = async () => {
        if (!validatePreferenceForm()) {
            toast.error("Please fix all validation errors before submitting.");
            return;
        }

        const instructorId = selectedInstructor;
        const timeslotObj = JSON.parse(selectedTimeslot);
        const preferenceId = timeslotObj.id;
        const postData = {
            timeslot: timeslotObj,
            instructorId: instructorId,
        };
        try {
            const response = await fetch(
                `http://localhost:8080/api/instructors/${instructorId}/preferences/${preferenceId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${auth.accessToken}`,
                    },
                    body: JSON.stringify(postData),
                }
            );
            if (response.ok) {
                setShowPreferenceModal(false);
                setSelectedInstructor("");
                setSelectedTimeslot("");
                toast.success("Preference added successfully!");
            } else {
                const errorData = await response.json();
                console.error("Failed to add preference", errorData);
                toast.error(errorData.message || "Failed to add preference");
            }
        } catch (error) {
            console.error(`Error adding preference: ${error}`);
            toast.error("Error adding preference");
        }
    };

    const renderAddPreferenceModal = () => {
        return (
            showPreferenceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Time Preference</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleAddPreference();
                            }}
                        >
                            <div className="mb-4">
                                <label htmlFor="instructorSelect" className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Instructor
                                </label>
                                <select
                                    id="instructorSelect"
                                    value={selectedInstructor}
                                    onChange={handleInstructorSelectChange}
                                    className={`w-full px-4 py-2 border ${
                                        formErrors.instructorSelect
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } rounded-md focus:outline-none focus:ring-2`}
                                    required
                                >
                                    <option value="">Select an instructor</option>
                                    {instructors.map((instructor) => (
                                        <option key={instructor.id} value={instructor.id}>
                                            {instructor.firstName} {instructor.lastName} - {instructor.deptName}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.instructorSelect && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.instructorSelect}</p>
                                )}
                            </div>
                            <div className="mb-6">
                                <label htmlFor="timeslotSelect" className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Time Slot
                                </label>
                                <select
                                    id="timeslotSelect"
                                    value={selectedTimeslot}
                                    onChange={handleTimeslotSelectChange}
                                    className={`w-full px-4 py-2 border ${
                                        formErrors.timeslotSelect
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } rounded-md focus:outline-none focus:ring-2`}
                                    required
                                >
                                    <option value="">Select a time slot</option>
                                    {timeslots.map((timeslot) => (
                                        <option key={timeslot.id} value={JSON.stringify(timeslot)}>
                                            {timeslot.day} ({timeslot.startTime} - {timeslot.endTime})
                                        </option>
                                    ))}
                                </select>
                                {formErrors.timeslotSelect && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.timeslotSelect}</p>
                                )}
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPreferenceModal(false);
                                        setSelectedInstructor("");
                                        setSelectedTimeslot("");
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    disabled={!selectedInstructor || !selectedTimeslot}
                                >
                                    Add Preference
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
        );
    };

    return (
        <section className="min-h-screen flex bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-neutral-800">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out 
                    ${isExpanded ? 'w-64' : 'w-20'} 
                    bg-white dark:bg-gray-800 shadow-xl`}
            >
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="absolute top-4 right-4 z-50 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                    <HiOutlineMenuAlt1 className="w-6 h-6" />
                </button>

                <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-700">
                    <Link to="/landingpage" className="flex items-center">
                        <img
                            className="w-10 h-10 mr-3"
                            src="logoAS.svg"
                            alt="logo"
                        />
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
                                        {auth.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {auth.department}
                                    </p>
                                </div>
                            )}
                        </div>
                        {isExpanded && (
                            <Link
                                to="/instructor-profile"
                                className="mt-3 block text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                View Profile
                            </Link>
                        )}
                    </div>
                )}

                <nav className="mt-8 px-4">
                    <ul className="space-y-2">
                        {NavItems.map((item, index) => (
                            <li key={index}>
                                <Link
                                    to={item.path}
                                    className={`
                                        flex items-center p-3 rounded-lg transition-all duration-300 
                                        ${location.pathname === item.path
                                        ? `bg-gradient-to-r ${item.bgGradient} text-white`
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
                    flex-grow p-6 transition-all duration-300 
                    ${isExpanded ? 'ml-64' : 'ml-20'}
                `}
            >
                <div className="main-content p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                                    Instructor Dashboard
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Welcome back, {auth?.username || 'Instructor'}!
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowPreferenceModal(true)}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                                >
                                    <FaCalendarAlt className="mr-2" /> Add Preference
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <QuickStatCard
                                icon={HiAcademicCap}
                                title="Total Courses"
                                value={stats.totalCourses}
                                change={20}
                                positive={true}
                            />
                            <QuickStatCard
                                icon={HiUserGroup}
                                title="Active Students"
                                value={stats.activeStudents}
                                change={15}
                                positive={true}
                            />
                            <QuickStatCard
                                icon={HiDocumentText}
                                title="Pending Assignments"
                                value={stats.assignmentsPending}
                                change={-5}
                                positive={false}
                            />
                            <QuickStatCard
                                icon={HiCalendar}
                                title="Upcoming Classes"
                                value={stats.upcomingClasses}
                                change={0}
                                positive={true}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                        Recent Activity
                                    </h2>
                                    <button className="text-blue-500 text-sm hover:underline">
                                        View All
                                    </button>
                                </div>
                                {recentActivities.map((activity, index) => (
                                    <RecentActivityItem
                                        key={index}
                                        course={activity.course}
                                        action={activity.action}
                                        time={activity.time}
                                    />
                                ))}
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                                    Upcoming Events
                                </h2>
                                <div className="space-y-4">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                                        <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                                            Machine Learning Lecture
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Today, 2:00 PM - Room 305
                                        </p>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                                        <h3 className="font-semibold text-green-800 dark:text-green-300">
                                            Web Development Workshop
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Tomorrow, 10:00 AM - Online
                                        </p>
                                    </div>
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-500">
                                        <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
                                            Database Systems Quiz
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Next Week, 3:00 PM - Lab 202
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {renderAddPreferenceModal()}
        </section>
    );
};

export default InstructorDashboardPage;