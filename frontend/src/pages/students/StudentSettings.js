import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { AnimatePresence } from "framer-motion";
import Layout from "./Layout";

const StudentSettings = () => {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [year, setYear] = useState(1);
    const [semester, setSemester] = useState(1);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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
            setSemester(response.data.semester || 1);
            setEmail(response.data.email || "");
            setSuccess("Student profile loaded successfully.");
        } catch (err) {
            if (err.response?.status === 404 || err.response?.data?.message?.includes("Student not found")) {
                setError("No student profile found. Please create your profile below.");
            } else {
                setError(err.response?.data?.message || "Failed to load profile. Please try again.");
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
        if (semester !== 1 && semester !== 2) {
            setError("Semester must be 1 or 2.");
            return;
        }
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            await axios.post(
                "http://localhost:8080/api/students/create",
                { year, semester },
                { headers: { Authorization: `Bearer ${auth.accessToken}` } }
            );
            const profileResponse = await axios.get("http://localhost:8080/api/students/me", {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            });
            const studentId = profileResponse.data.id;
            await axios.post(
                "http://localhost:8080/api/enrollments/auto-enroll",
                { studentId, year, semester },
                { headers: { Authorization: `Bearer ${auth.accessToken}` } }
            );
            setSuccess("Profile created and enrolled in courses successfully!");
            await fetchStudentProfile();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create profile or enroll in courses. Please try again.");
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
                { year, email, semester },
                { headers: { Authorization: `Bearer ${auth.accessToken}` } }
            );
            setSuccess("Profile updated successfully!");
            await fetchStudentProfile();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile. Please try again.");
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
                "http://localhost:8080/api/users/change-password",
                { newPassword: password },
                { headers: { Authorization: `Bearer ${auth.accessToken}` } }
            );
            setSuccess("Password changed successfully!");
            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to change password. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAccount = async () => {
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            await axios.delete("http://localhost:8080/api/students/me", {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            });
            setSuccess("Account deleted successfully. Redirecting to login...");
            setAuth(null);
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete account. Please try again.");
        } finally {
            setSubmitting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mt-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Settings</h1>
                <AnimatePresence>
                    {success && (
                        <div
                            className="mb-6 p-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-xl"
                        >
                            {success}
                        </div>
                    )}
                    {error && (
                        <div
                            className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-xl"
                        >
                            {error}
                        </div>
                    )}
                </AnimatePresence>
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Student Profile</h2>
                    {student ? (
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={student.username}
                                    disabled
                                    className="mt-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={submitting}
                                />
                            </div>
                            <div>
                                <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Year of Study
                                </label>
                                <input
                                    type="number"
                                    id="year"
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    className="mt-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                    max="4"
                                    required
                                    disabled={submitting}
                                />
                            </div>
                            <div>
                                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Semester
                                </label>
                                <select
                                    id="semester"
                                    value={semester}
                                    onChange={(e) => setSemester(Number(e.target.value))}
                                    className="mt-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={submitting}
                                >
                                    <option value={1}>Semester 1</option>
                                    <option value={2}>Semester 2</option>
                                </select>
                            </div>
                            {student.programName && (
                                <div>
                                    <label htmlFor="program" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Program
                                    </label>
                                    <input
                                        type="text"
                                        id="program"
                                        value={student.programName}
                                        disabled
                                        className="mt-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 cursor-not-allowed"
                                    />
                                </div>
                            )}
                            <button
                                onClick={handleUpdateProfile}
                                className={`w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                                    submitting ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                ) : (
                                    "Update Profile"
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Year of Study
                                </label>
                                <input
                                    type="number"
                                    id="year"
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    className="mt-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                    max="4"
                                    required
                                    disabled={submitting}
                                />
                            </div>
                            <div>
                                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Semester
                                </label>
                                <select
                                    id="semester"
                                    value={semester}
                                    onChange={(e) => setSemester(Number(e.target.value))}
                                    className="mt-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={submitting}
                                >
                                    <option value={1}>Semester 1</option>
                                    <option value={2}>Semester 2</option>
                                </select>
                            </div>
                            <button
                                onClick={handleCreateProfile}
                                className={`w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                                    submitting ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                ) : (
                                    "Create Profile"
                                )}
                            </button>
                        </div>
                    )}
                </section>
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Change Password</h2>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                New Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={submitting}
                            />
                        </div>
                        <button
                            onClick={handleChangePassword}
                            className={`w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                                submitting ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                            ) : (
                                "Change Password"
                            )}
                        </button>
                    </div>
                </section>
                <section>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Delete Account</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className={`w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 ${
                            submitting ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={submitting}
                    >
                        Delete My Account
                    </button>
                </section>
                <AnimatePresence>
                    {showDeleteModal && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        >
                            <div
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
                            >
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                    Confirm Account Deletion
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                                    Are you sure you want to delete your account? This action is permanent and cannot be undone.
                                </p>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-xl hover:bg-gray-400 dark:hover:bg-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className={`px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 ${
                                            submitting ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        ) : (
                                            "Delete"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
};

export default StudentSettings;