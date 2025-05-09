import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { motion } from "framer-motion";
import Layout from "./Layout";
import axios from "axios";

const StudentTimetable = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [timetable, setTimetable] = useState([]);
    const [studentProfile, setStudentProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!auth?.accessToken) {
            navigate("/login");
        } else {
            fetchStudentProfile();
        }
    }, [auth, navigate]);

    const fetchStudentProfile = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/students/me", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            });
            setStudentProfile(response.data);
            if (response.data.semester && response.data.year) {
                fetchTimetable(response.data.year, response.data.semester);
            } else {
                setError("Semester or year not set in your profile");
                setLoading(false);
            }
        } catch (err) {
            setError("Failed to fetch student profile: " + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    const fetchTimetable = async (year, semester) => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/schedule/myTimetable?semester=${semester}&year=${year}`,
                {
                    headers: {
                        Authorization: `Bearer ${auth.accessToken}`,
                    },
                }
            );
            setTimetable(response.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch timetable: " + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    const renderTimetable = () => {
        if (loading) {
            return <p className="text-gray-600 dark:text-gray-300">Loading timetable...</p>;
        }
        if (error) {
            return <p className="text-red-500">{error}</p>;
        }
        if (timetable.length === 0) {
            return (
                <p className="text-gray-600 dark:text-gray-300">
                    No classes scheduled for this semester.
                </p>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <thead>
                    <tr className="bg-gray-100 dark:bg-gray-900">
                        <th className="py-2 px-4 border-b dark:border-gray-700 text-left text-gray-800 dark:text-gray-200">
                            Course Code
                        </th>
                        <th className="py-2 px-4 border-b dark:border-gray-700 text-left text-gray-800 dark:text-gray-200">
                            Time Slot
                        </th>
                        <th className="py-2 px-4 border-b dark:border-gray-700 text-left text-gray-800 dark:text-gray-200">
                            Instructor
                        </th>
                        <th className="py-2 px-4 border-b dark:border-gray-700 text-left text-gray-800 dark:text-gray-200">
                            Room
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {timetable.map((schedule, index) => (
                        <tr
                            key={index}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <td className="py-2 px-4 border-b dark:border-gray-700 text-gray-800 dark:text-gray-200">
                                {schedule.courseCodes.join(", ")}
                            </td>
                            <td className="py-2 px-4 border-b dark:border-gray-700 text-gray-800 dark:text-gray-200">
                                {schedule.timeSlots.join(", ")}
                            </td>
                            <td className="py-2 px-4 border-b dark:border-gray-700 text-gray-800 dark:text-gray-200">
                                {schedule.instructorNames.join(", ")}
                            </td>
                            <td className="py-2 px-4 border-b dark:border-gray-700 text-gray-800 dark:text-gray-200">
                                {schedule.roomNames.join(", ")}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <Layout>
            <motion.div
                className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                    Timetable
                </h1>
                {studentProfile && (
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Academic Year: {studentProfile.year}, Semester: {studentProfile.semester || "Not set"}
                    </p>
                )}
                {renderTimetable()}
            </motion.div>
        </Layout>
    );
};

export default StudentTimetable;