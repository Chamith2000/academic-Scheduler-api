import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
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
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "react-tooltip";
import { motion, AnimatePresence } from "framer-motion";

const InstructorSettingsPage = () => {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);

    // Profile state
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
    });
    const [profileErrors, setProfileErrors] = useState({});
    const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

    // Password state
    const [password, setPassword] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    const NavItems = [
        { icon: HiHome, label: "Dashboard", path: "/instructor-dashboard", bgGradient: "from-indigo-600 to-blue-600", tooltip: "View your dashboard" },
        { icon: HiCalendar, label: "Timetable", path: "/instructor-timetable", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Check your schedule" },
        { icon: HiAcademicCap, label: "Courses", path: "/instructor-courses", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Manage your courses" },
        { icon: HiDocumentText, label: "Reports", path: "/instructor-reports", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Download reports" },
        { icon: HiAdjustments, label: "Preferences", path: "/instructor-preferences", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Set availability" },
        { icon: HiCog, label: "Settings", path: "/settings", bgGradient: "from-indigo-600 to-blue-600", tooltip: "Account settings" },
    ];

    const handleLogout = () => {
        setAuth(null);
        localStorage.removeItem("user");
        navigate("/login");
    };

    // Fetch instructor profile
    const fetchInstructorProfile = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/api/instructors/me", {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            });
            setProfile({
                firstName: response.data.firstName || "",
                lastName: response.data.lastName || "",
                email: response.data.email || "",
                username: response.data.username || "",
            });
        } catch (error) {
            console.error(`Error fetching profile: ${error}`);
            toast.error("Failed to fetch profile");
        } finally {
            setIsLoading(false);
        }
    };

    // Validate profile fields in real-time
    const validateProfileField = (name, value) => {
        const errors = { ...profileErrors };
        if (name === "firstName" && !value) {
            errors.firstName = "First name is required";
        } else if (name === "firstName") {
            delete errors.firstName;
        }
        if (name === "lastName" && !value) {
            errors.lastName = "Last name is required";
        } else if (name === "lastName") {
            delete errors.lastName;
        }
        if (name === "email") {
            if (!value) {
                errors.email = "Email is required";
            } else if (!/^[A-Za-z0-9+_.-]+@(.+)$/.test(value)) {
                errors.email = "Invalid email format";
            } else {
                delete errors.email;
            }
        }
        setProfileErrors(errors);
    };

    // Validate password fields in real-time
    const validatePasswordField = (name, value) => {
        const errors = { ...passwordErrors };
        if (name === "currentPassword" && !value) {
            errors.currentPassword = "Current password is required";
        } else if (name === "currentPassword") {
            delete errors.currentPassword;
        }
        if (name === "newPassword" && !value) {
            errors.newPassword = "New password is required";
        } else if (name === "newPassword") {
            delete errors.newPassword;
        }
        if (name === "confirmPassword") {
            if (!value) {
                errors.confirmPassword = "Confirm password is required";
            } else if (value !== password.newPassword) {
                errors.confirmPassword = "Passwords do not match";
            } else {
                delete errors.confirmPassword;
            }
        }
        setPasswordErrors(errors);
    };

    // Handle profile form submission
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        const errors = {};
        if (!profile.firstName) errors.firstName = "First name is required";
        if (!profile.lastName) errors.lastName = "Last name is required";
        if (!profile.email) {
            errors.email = "Email is required";
        } else if (!/^[A-Za-z0-9+_.-]+@(.+)$/.test(profile.email)) {
            errors.email = "Invalid email format";
        }

        if (Object.keys(errors).length > 0) {
            setProfileErrors(errors);
            return;
        }

        setIsProfileSubmitting(true);
        try {
            const response = await axios.put(
                "http://localhost:8080/api/instructors/me",
                {
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    email: profile.email,
                },
                {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                }
            );
            setProfile({
                ...profile,
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                email: response.data.email,
            });
            setProfileErrors({});
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error(`Error updating profile: ${error}`);
            toast.error(error.response?.data || "Failed to update profile");
        } finally {
            setIsProfileSubmitting(false);
        }
    };

    // Handle password form submission
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        const errors = {};
        if (!password.currentPassword) errors.currentPassword = "Current password is required";
        if (!password.newPassword) errors.newPassword = "New password is required";
        if (!password.confirmPassword) errors.confirmPassword = "Confirm password is required";
        if (password.newPassword !== password.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }

        setIsPasswordSubmitting(true);
        try {
            await axios.put(
                "http://localhost:8080/api/instructors/me/password",
                {
                    currentPassword: password.currentPassword,
                    newPassword: password.newPassword,
                },
                {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                }
            );
            setPassword({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setPasswordErrors({});
            toast.success("Password changed successfully");
        } catch (error) {
            console.error(`Error changing password: ${error}`);
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setIsPasswordSubmitting(false);
        }
    };

    useEffect(() => {
        fetchInstructorProfile();
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

            {/* Main Content */}
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
                                        Settings
                                        {/* Sinhala: සැකසුම් */}
                                    </h1>
                                    <p className="mt-2 text-indigo-100">
                                        Manage your profile and password to keep your account secure.
                                        {/* Sinhala: ඔබේ ගිණුම ආරක්ෂිතව තබා ගැනීමට ඔබේ පැතිකඩ සහ මුරපදය කළමනාකරණය කරන්න */}
                                    </p>
                                </div>
                            </motion.section>

                            {isLoading ? (
                                <div className="grid md:grid-cols-2 md:gap-6">
                                    {[...Array(2)].map((_, index) => (
                                        <div key={index} className="space-y-4">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="animate-pulse flex space-x-4">
                                                    <div className="flex-1 space-y-6 py-1">
                                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col md:grid md:grid-cols-2 md:gap-6">
                                    {/* Profile Update Form */}
                                    <motion.div
                                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 md:border-r md:border-gray-200 dark:md:border-gray-700"
                                        whileHover={{ scale: 1.01 }}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.1 }}
                                    >
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 relative">
                                            Update Profile
                                            {/* Sinhala: පැතිකඩ යාවත්කාලීන කරන්න */}
                                            <motion.span
                                                className="absolute bottom-0 left-0 w-16 h-1 bg-gradient-to-r from-indigo-600 to-blue-600"
                                                initial={{ width: 0 }}
                                                animate={{ width: 64 }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </h2>
                                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    First Name
                                                    {/* Sinhala: මුල් නම */}
                                                </label>
                                                <div className="relative">
                                                    <motion.input
                                                        type="text"
                                                        value={profile.firstName}
                                                        onChange={(e) => {
                                                            setProfile({ ...profile, firstName: e.target.value });
                                                            validateProfileField("firstName", e.target.value);
                                                        }}
                                                        className={`block w-full py-3 px-4 border ${
                                                            profileErrors.firstName ? "border-red-500" : "border-gray-300"
                                                        } bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200`}
                                                        placeholder="Enter first name"
                                                        whileFocus={{ scale: 1.02 }}
                                                        disabled={isProfileSubmitting}
                                                        data-tooltip-id="firstName"
                                                        data-tooltip-content="Enter your first name"
                                                    />
                                                    {profileErrors.firstName ? (
                                                        <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-red-500" />
                                                    ) : (
                                                        profile.firstName && (
                                                            <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                                                        )
                                                    )}
                                                </div>
                                                {profileErrors.firstName && (
                                                    <p className="mt-1 text-sm text-red-600">{profileErrors.firstName}</p>
                                                )}
                                                <Tooltip id="firstName" place="top" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Last Name
                                                    {/* Sinhala: අවසන් නම */}
                                                </label>
                                                <div className="relative">
                                                    <motion.input
                                                        type="text"
                                                        value={profile.lastName}
                                                        onChange={(e) => {
                                                            setProfile({ ...profile, lastName: e.target.value });
                                                            validateProfileField("lastName", e.target.value);
                                                        }}
                                                        className={`block w-full py-3 px-4 border ${
                                                            profileErrors.lastName ? "border-red-500" : "border-gray-300"
                                                        } bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200`}
                                                        placeholder="Enter last name"
                                                        whileFocus={{ scale: 1.02 }}
                                                        disabled={isProfileSubmitting}
                                                        data-tooltip-id="lastName"
                                                        data-tooltip-content="Enter your last name"
                                                    />
                                                    {profileErrors.lastName ? (
                                                        <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-red-500" />
                                                    ) : (
                                                        profile.lastName && (
                                                            <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                                                        )
                                                    )}
                                                </div>
                                                {profileErrors.lastName && (
                                                    <p className="mt-1 text-sm text-red-600">{profileErrors.lastName}</p>
                                                )}
                                                <Tooltip id="lastName" place="top" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Email
                                                    {/* Sinhala: විද්‍යුත් තැපෑල */}
                                                </label>
                                                <div className="relative">
                                                    <motion.input
                                                        type="email"
                                                        value={profile.email}
                                                        onChange={(e) => {
                                                            setProfile({ ...profile, email: e.target.value });
                                                            validateProfileField("email", e.target.value);
                                                        }}
                                                        className={`block w-full py-3 px-4 border ${
                                                            profileErrors.email ? "border-red-500" : "border-gray-300"
                                                        } bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200`}
                                                        placeholder="Enter email"
                                                        whileFocus={{ scale: 1.02 }}
                                                        disabled={isProfileSubmitting}
                                                        data-tooltip-id="email"
                                                        data-tooltip-content="Enter your email address"
                                                    />
                                                    {profileErrors.email ? (
                                                        <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-red-500" />
                                                    ) : (
                                                        profile.email &&
                                                        /^[A-Za-z0-9+_.-]+@(.+)$/.test(profile.email) && (
                                                            <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                                                        )
                                                    )}
                                                </div>
                                                {profileErrors.email && (
                                                    <p className="mt-1 text-sm text-red-600">{profileErrors.email}</p>
                                                )}
                                                <Tooltip id="email" place="top" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Username (read-only)
                                                    {/* Sinhala: පරිශීලක නම (කියවීමට පමණි) */}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profile.username}
                                                    disabled
                                                    className="block w-full py-3 px-4 border border-gray-300 bg-gray-100 rounded-lg dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300 cursor-not-allowed"
                                                    data-tooltip-id="username"
                                                    data-tooltip-content="Username cannot be changed"
                                                />
                                                <Tooltip id="username" place="top" />
                                            </div>
                                            <div className="flex justify-end">
                                                <motion.button
                                                    type="submit"
                                                    className={`px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                                                        isProfileSubmitting ? "opacity-50 cursor-not-allowed" : "hover:from-indigo-700 hover:to-blue-700"
                                                    }`}
                                                    whileHover={isProfileSubmitting ? {} : { scale: 1.05 }}
                                                    whileTap={isProfileSubmitting ? {} : { scale: 0.95 }}
                                                    disabled={isProfileSubmitting}
                                                    data-tooltip-id="save-profile"
                                                    data-tooltip-content="Save profile changes"
                                                >
                                                    {isProfileSubmitting ? (
                                                        <div className="flex items-center">
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                            Saving...
                                                        </div>
                                                    ) : (
                                                        "Save Changes"
                                                    )}
                                                    {/* Sinhala: {isProfileSubmitting ? "සුරකිමින්..." : "වෙනස්කම් සුරකින්න"} */}
                                                </motion.button>
                                                <Tooltip id="save-profile" place="top" />
                                            </div>
                                        </form>
                                    </motion.div>

                                    {/* Password Change Form */}
                                    <motion.div
                                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 mt-6 md:mt-0"
                                        whileHover={{ scale: 1.01 }}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.2 }}
                                    >
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 relative">
                                            Change Password
                                            {/* Sinhala: මුරපදය වෙනස් කරන්න */}
                                            <motion.span
                                                className="absolute bottom-0 left-0 w-16 h-1 bg-gradient-to-r from-indigo-600 to-blue-600"
                                                initial={{ width: 0 }}
                                                animate={{ width: 64 }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </h2>
                                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Current Password
                                                    {/* Sinhala: වත්මන් මුරපදය */}
                                                </label>
                                                <div className="relative">
                                                    <motion.input
                                                        type="password"
                                                        value={password.currentPassword}
                                                        onChange={(e) => {
                                                            setPassword({ ...password, currentPassword: e.target.value });
                                                            validatePasswordField("currentPassword", e.target.value);
                                                        }}
                                                        className={`block w-full py-3 px-4 border ${
                                                            passwordErrors.currentPassword ? "border-red-500" : "border-gray-300"
                                                        } bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200`}
                                                        placeholder="Enter current password"
                                                        whileFocus={{ scale: 1.02 }}
                                                        disabled={isPasswordSubmitting}
                                                        data-tooltip-id="currentPassword"
                                                        data-tooltip-content="Enter your current password"
                                                    />
                                                    {passwordErrors.currentPassword && (
                                                        <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-red-500" />
                                                    )}
                                                </div>
                                                {passwordErrors.currentPassword && (
                                                    <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                                                )}
                                                <Tooltip id="currentPassword" place="top" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    New Password
                                                    {/* Sinhala: නව මුරපදය */}
                                                </label>
                                                <div className="relative">
                                                    <motion.input
                                                        type="password"
                                                        value={password.newPassword}
                                                        onChange={(e) => {
                                                            setPassword({ ...password, newPassword: e.target.value });
                                                            validatePasswordField("newPassword", e.target.value);
                                                        }}
                                                        className={`block w-full py-3 px-4 border ${
                                                            passwordErrors.newPassword ? "border-red-500" : "border-gray-300"
                                                        } bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200`}
                                                        placeholder="Enter new password"
                                                        whileFocus={{ scale: 1.02 }}


                                                        disabled={isPasswordSubmitting}
                                                        data-tooltip-id="newPassword"
                                                        data-tooltip-content="Enter your new password"
                                                    />
                                                    {passwordErrors.newPassword && (
                                                        <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-red-500" />
                                                    )}
                                                </div>
                                                {passwordErrors.newPassword && (
                                                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                                                )}
                                                <Tooltip id="newPassword" place="top" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Confirm New Password
                                                    {/* Sinhala: නව මුරපදය තහවුරු කරන්න */}
                                                </label>
                                                <div className="relative">
                                                    <motion.input
                                                        type="password"
                                                        value={password.confirmPassword}
                                                        onChange={(e) => {
                                                            setPassword({ ...password, confirmPassword: e.target.value });
                                                            validatePasswordField("confirmPassword", e.target.value);
                                                        }}
                                                        className={`block w-full py-3 px-4 border ${
                                                            passwordErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                                                        } bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200`}
                                                        placeholder="Confirm new password"
                                                        whileFocus={{ scale: 1.02 }}
                                                        disabled={isPasswordSubmitting}
                                                        data-tooltip-id="confirmPassword"
                                                        data-tooltip-content="Confirm your new password"
                                                    />
                                                    {passwordErrors.confirmPassword ? (
                                                        <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-red-500" />
                                                    ) : (
                                                        password.confirmPassword &&
                                                        password.newPassword === password.confirmPassword && (
                                                            <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                                                        )
                                                    )}
                                                </div>
                                                {passwordErrors.confirmPassword && (
                                                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                                                )}
                                                <Tooltip id="confirmPassword" place="top" />
                                            </div>
                                            <div className="flex justify-end">
                                                <motion.button
                                                    type="submit"
                                                    className={`px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                                                        isPasswordSubmitting ? "opacity-50 cursor-not-allowed" : "hover:from-indigo-700 hover:to-blue-700"
                                                    }`}
                                                    whileHover={isPasswordSubmitting ? {} : { scale: 1.05 }}
                                                    whileTap={isPasswordSubmitting ? {} : { scale: 0.95 }}
                                                    disabled={isPasswordSubmitting}
                                                    data-tooltip-id="change-password"
                                                    data-tooltip-content="Change your password"
                                                >
                                                    {isPasswordSubmitting ? (
                                                        <div className="flex items-center">
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                            Changing...
                                                        </div>
                                                    ) : (
                                                        "Change Password"
                                                    )}
                                                    {/* Sinhala: {isPasswordSubmitting ? "වෙනස් කරමින්..." : "මුරපදය වෙනස් කරන්න"} */}
                                                </motion.button>
                                                <Tooltip id="change-password" place="top" />
                                            </div>
                                        </form>
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>
        </section>
    );
};

export default InstructorSettingsPage