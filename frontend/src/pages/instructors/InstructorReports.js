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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

    // Password state
    const [password, setPassword] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordErrors, setPasswordErrors] = useState({});

    const [isLoading, setIsLoading] = useState(true);

    const NavItems = [
        { icon: HiHome, label: "Dashboard", path: "/dashboard", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiCalendar, label: "Timetable", path: "/instructor-timetable", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiAcademicCap, label: "Courses", path: "/instructor-courses", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiDocumentText, label: "Reports", path: "/instructor-reports", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiAdjustments, label: "Preferences", path: "/instructor-preferences", bgGradient: "from-blue-500 to-blue-700" },
        { icon: HiCog, label: "Settings", path: "/instructor-settings", bgGradient: "from-blue-500 to-blue-700" },
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
            console.log("Profile API response:", response.data);
            setProfile({
                firstName: response.data.firstName || "",
                lastName: response.data.lastName || "",
                email: response.data.email || "",
                username: response.data.username || "",
            });
            setIsLoading(false);
        } catch (error) {
            console.error(`Error fetching profile: ${error}`);
            toast.error("Failed to fetch profile");
            setIsLoading(false);
        }
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

        const payload = {
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
        };
        console.log("Profile update payload:", payload);

        try {
            const response = await axios.put(
                "http://localhost:8080/api/instructors/me",
                payload,
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
        }
    };

    useEffect(() => {
        fetchInstructorProfile();
    }, []);

    return (
        <section className="min-h-screen flex bg-white dark:bg-gray-900">
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out ${
                    isExpanded ? 'w-64' : 'w-20'
                } bg-white dark:bg-gray-800 shadow-2xl rounded-r-2xl`}
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
                                        ${
                                        location.pathname === item.path
                                            ? `bg-gradient-to-r ${item.bgGradient} text-white shadow-md`
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                    } 
                                        ${isExpanded ? 'justify-start' : 'justify-center'}
                                    `}
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
            <main
                className={`flex-grow p-8 transition-all duration-300 ${isExpanded ? 'ml-64' : 'ml-20'}`}
            >
                <div className="main-content p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
                    <div className="space-y-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                                    Settings
                                </h1>
                                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                                    Manage your profile and password
                                </p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : (
                            <>
                                {/* Profile Update Form */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 hover:shadow-xl transition-shadow duration-300">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                        Update Profile
                                    </h2>
                                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.firstName}
                                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                                className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200"
                                                placeholder="Enter first name"
                                            />
                                            {profileErrors.firstName && (
                                                <p className="mt-1 text-sm text-red-600">{profileErrors.firstName}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.lastName}
                                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                                className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200"
                                                placeholder="Enter last name"
                                            />
                                            {profileErrors.lastName && (
                                                <p className="mt-1 text-sm text-red-600">{profileErrors.lastName}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={profile.email}
                                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200"
                                                placeholder="Enter email"
                                            />
                                            {profileErrors.email && (
                                                <p className="mt-1 text-sm text-red-600">{profileErrors.email}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Username (read-only)
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.username}
                                                disabled
                                                className="block w-full py-3 px-4 border border-gray-300 bg-gray-100 rounded-lg dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300 cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Password Change Form */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                        Change Password
                                    </h2>
                                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Current Password
                                            </label>
                                            <input
                                                type="password"
                                                value={password.currentPassword}
                                                onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                                                className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200"
                                                placeholder="Enter current password"
                                            />
                                            {passwordErrors.currentPassword && (
                                                <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={password.newPassword}
                                                onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                                                className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200"
                                                placeholder="Enter new password"
                                            />
                                            {passwordErrors.newPassword && (
                                                <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={password.confirmPassword}
                                                onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                                                className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-all duration-200"
                                                placeholder="Confirm new password"
                                            />
                                            {passwordErrors.confirmPassword && (
                                                <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                                            )}
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
                                            >
                                                Change Password
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </section>
    );
};

export default InstructorSettingsPage;