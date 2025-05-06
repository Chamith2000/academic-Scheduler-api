import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { AnimatePresence } from "framer-motion";
import Layout from "./Layout";

const StudentCourses = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [selectedProgramId, setSelectedProgramId] = useState("");
    const [student, setStudent] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!auth?.accessToken) {
            navigate("/login");
            return;
        }
        fetchData();
    }, [auth, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const programsResponse = await axios.get("http://localhost:8080/api/programs", {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            });
            setPrograms(Array.isArray(programsResponse.data) ? programsResponse.data : []);

            const studentResponse = await axios.get("http://localhost:8080/api/students/me", {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            });
            if (!studentResponse.data || !studentResponse.data.id) {
                setError("No student profile found. Please contact support.");
                setStudent(null);
                return;
            }
            setStudent(studentResponse.data);

            if (studentResponse.data.programId) {
                const coursesResponse = await axios.get(
                    `http://localhost:8080/api/programs/${studentResponse.data.programId}/courses`,
                    { headers: { Authorization: `Bearer ${auth.accessToken}` } }
                );
                setCourses(coursesResponse.data || []);
            }
        } catch (err) {
            const errorMessage =
                err.response?.status === 404
                    ? "No student profile found. Please contact support."
                    : err.response?.data?.message || err.message || "Failed to load data. Please try again.";
            setError(errorMessage);
            setStudent(null);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!selectedProgramId || isNaN(Number(selectedProgramId))) {
            setError("Please select a valid program.");
            return;
        }
        if (!student || !student.id) {
            setError("Student data not loaded. Please try refreshing the page.");
            return;
        }
        setEnrollLoading(true);
        setMessage(null);
        setError(null);
        try {
            const enrollmentData = {
                programId: Number(selectedProgramId),
                enrollmentYear: new Date().getFullYear(),
                enrolledNumber: 1,
            };
            await axios.post(
                "http://localhost:8080/api/students/enroll",
                enrollmentData,
                { headers: { Authorization: `Bearer ${auth.accessToken}` } }
            );
            setMessage("Successfully enrolled in the program!");
            await fetchData();
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to enroll. Please try again.";
            setError(errorMessage);
        } finally {
            setEnrollLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <Layout>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">My Courses</h1>

                <AnimatePresence>
                    {message && (
                        <div
                            className="mb-6 p-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-xl"
                        >
                            {message}
                        </div>
                    )}
                    {error && (
                        <div
                            className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-xl"
                        >
                            {error}
                            <button
                                onClick={fetchData}
                                className="ml-4 px-4 py-1 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                </AnimatePresence>

                {!student?.programId && (
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Enroll in a Program</h2>
                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <select
                                    value={selectedProgramId}
                                    onChange={(e) => setSelectedProgramId(e.target.value)}
                                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={enrollLoading}
                                >
                                    <option value="">Select a program</option>
                                    {Array.isArray(programs) && programs.length > 0 ? (
                                        programs.map((program) => (
                                            <option key={program.id} value={program.id}>
                                                {program.programmeName} ({program.programmeCode})
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">No programs available</option>
                                    )}
                                </select>
                                <button
                                    onClick={handleEnroll}
                                    className={`px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                                        enrollLoading || !student || !student.id ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                    disabled={enrollLoading || !student || !student.id}
                                >
                                    {enrollLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        "Enroll"
                                    )}
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                <section>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Enrolled Courses</h2>
                    {student?.programId ? (
                        courses.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                    <tr className="bg-gray-100 dark:bg-gray-700">
                                        <th className="p-4 text-gray-700 dark:text-gray-200 font-semibold">Code</th>
                                        <th className="p-4 text-gray-700 dark:text-gray-200 font-semibold">Name</th>
                                        <th className="p-4 text-gray-700 dark:text-gray-200 font-semibold">Year</th>
                                        <th className="p-4 text-gray-700 dark:text-gray-200 font-semibold">Semester</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {courses.map((course, index) => (
                                        <tr
                                            key={course.id}
                                            className={`border-b border-gray-200 dark:border-gray-700 ${
                                                index % 2 ? "bg-gray-50 dark:bg-gray-750" : "bg-white dark:bg-gray-800"
                                            } hover:bg-blue-50 dark:hover:bg-blue-900`}
                                        >
                                            <td className="p-4 text-gray-800 dark:text-gray-200">{course.courseCode}</td>
                                            <td className="p-4 text-gray-800 dark:text-gray-200">{course.courseName}</td>
                                            <td className="p-4 text-gray-800 dark:text-gray-200">{course.year}</td>
                                            <td className="p-4 text-gray-800 dark:text-gray-200">{course.semester}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-300">No courses available for this program.</p>
                        )
                    ) : (
                        <p className="text-gray-600 dark:text-gray-300">Please enroll in a program to view courses.</p>
                    )}
                </section>
            </div>
        </Layout>
    );
};

export default StudentCourses;