import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { motion } from "framer-motion";
import Layout from "./Layout";

const StudentTimetable = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth?.accessToken) {
            navigate("/login");
        }
    }, [auth, navigate]);

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
                    {/* Sinhala: වේලාපටය */}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Your class schedule will be displayed here.
                    {/* Sinhala: ඔබගේ පන්ති වේලාපටය මෙහි පෙන්වනු ඇත. */}
                </p>
                {/* TODO: Implement timetable fetching and rendering */}
            </motion.div>
        </Layout>
    );
};

export default StudentTimetable;