import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import Layout from "./Layout";

const StudentSettings = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [year, setYear] = useState(1);
    const [semester, setSemester] = useState(1); // Added semester state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (!auth?.accessToken) {
            navigate("/login");
            return;
        }
        fetchStudentProfile();
    }, [auth, navigate]);

    const fetchStudentProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/api/students/me", {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            });
            setStudent(response.data);
            setYear(response.data.year || 1);
            setSemester(response.data.semester || 1); // Set semester from response
            setEmail(response.data.email || "");
            setSuccess("Student profile loaded successfully.");
        } catch (err) {
            console.error("Fetch profile error:", err);
            if (
                err.response?.status === 404 ||
                err.response?.data?.message?.includes("Student not found")
            ) {
                setError("No student profile found. Please create your profile below.");
            } else {
                setError(
                    err.response?.data?.message || "Failed to load profile. Please try again."
                );
            }
            setStudent(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProfile = async (e) => {
        e.preventDefault();
        if (year < 1 || year > 4) {
            setError("Year must be between 1 and 4.");
            return;
        }
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            await axios.post(
                "http://localhost:8080/api/students/create",
                { year },
                { headers: { Authorization: `Bearer ${auth.accessToken}` } }
            );
            setSuccess("Student profile created successfully!");
            await fetchStudentProfile();
        } catch (err) {
            console.error("Create profile error:", err);
            setError(
                err.response?.data?.message || "Failed to create profile. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (year < 1 || year > 4) {
            setError("Year must be between 1 and 4.");
            return;
        }
        if (semester < 1 || semester > 2) {
            // Added semester validation
            setError("Semester must be 1 or 2.");
            return;
        }
        if (!email) {
            setError("Email is required.");
            return;
        }
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            await axios.put(
                "http://localhost:8080/api/students/me",
                { year, semester, email }, // Added semester to payload
                { headers: { Authorization: `Bearer ${auth.accessToken}` } }
            );
            setSuccess("Profile updated successfully!");
            await fetchStudentProfile();
        } catch (err) {
            console.error("Update profile error:", err);
            setError(
                err.response?.data?.message || "Failed to update profile. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            await axios.post(
                "http://localhost:8080/api/students/change-password",
                { newPassword: password },
                { headers: { Authorization: `Bearer ${auth.accessToken}` } }
            );
            setSuccess("Password changed successfully!");
            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error("Change password error:", err);
            setError(
                err.response?.data?.message || "Failed to change password. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <motion.div
                className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                    Settings {/* Sinhala: සැකසුම් */}
                </h1>
                <AnimatePresence>
                    {success && (
                        <motion.div
                            className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {success}
                        </motion.div>
                    )}
                    {error && (
                        <motion.div
                            className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                        Student Profile {/* Sinhala: ශිෂ්‍ය පැතිකඩ */}
                    </h2>
                    {student ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Username {/* Sinhala: පරිශීලක නම */}
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={student.username}
                                    disabled
                                    className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Email {/* Sinhala: විද්‍යුත් තැපෑල */}
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={submitting}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="year"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Year of Study {/* Sinhala: අධ්‍යයන වර්ෂය */}
                                </label>
                                <input
                                    type="number"
                                    id="year"
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                    max="4"
                                    required
                                    disabled={submitting}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="semester"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Semester {/* Sinhala: අර්ධ වාර්ෂික */}
                                </label>
                                <input
                                    type="number"
                                    id="semester"
                                    value={semester}
                                    onChange={(e) => setSemester(Number(e.target.value))}
                                    className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                    max="2"
                                    required
                                    disabled={submitting}
                                />
                            </div>
                            {student.programName && (
                                <div>
                                    <label
                                        htmlFor="program"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Program {/* Sinhala: වැඩසටහන */}
                                    </label>
                                    <input
                                        type="text"
                                        id="program"
                                        value={student.programName}
                                        disabled
                                        className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 cursor-not-allowed"
                                    />
                                </div>
                            )}
                            <motion.button
                                type="submit"
                                className={`w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                                    submitting ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                ) : (
                                    "Update Profile" // Sinhala: පැතිකඩ යාවත්කාලීන කරන්න
                                )}
                            </motion.button>
                        </form>
                    ) : (
                        <form onSubmit={handleCreateProfile} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="year"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Year of Study {/* Sinhala: අධ්‍යයන වර්ෂය */}
                                </label>
                                <input
                                    type="number"
                                    id="year"
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                    max="4"
                                    required
                                    disabled={submitting}
                                />
                            </div>
                            <motion.button
                                type="submit"
                                className={`w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                                    submitting ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                ) : (
                                    "Create Profile" // Sinhala: පැතිකඩ සාදන්න
                                )}
                            </motion.button>
                        </form>
                    )}
                </section>
                <section>
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                        Change Password {/* Sinhala: මුරපදය වෙනස් කරන්න */}
                    </h2>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                New Password {/* Sinhala: නව මුරපදය */}
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Confirm Password {/* Sinhala: මුරපදය තහවුරු කරන්න */}
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={submitting}
                            />
                        </div>
                        <motion.button
                            type="submit"
                            className={`w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                                submitting ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                            ) : (
                                "Change Password" // Sinhala: මුරපදය වෙනස් කරන්න
                            )}
                        </motion.button>
                    </form>
                </section>
            </motion.div>
        </Layout>
    );
};

export default StudentSettings;