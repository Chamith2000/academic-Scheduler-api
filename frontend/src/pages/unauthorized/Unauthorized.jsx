import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function Unauthorized() {
    const navigate = useNavigate();
    const location = useLocation();

    const goBack = () => {
        // Check if there's a previous route in location.state
        if (location.state?.from) {
            navigate(location.state.from);
        } else if (window.history.length > 2) {
            // If history exists, go back one step
            navigate(-1);
        } else {
            // Fallback to landing page
            navigate("/landingpage");
        }
    };

    const goToHome = () => {
        navigate("/landingpage");
    };

    const goToLogin = () => {
        navigate("/login");
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-neutral-800 p-4">
            <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                    Unauthorized Access
                    {/* Sinhala: අනවසර ප්‍රවේශය */}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    You don’t have permission to view this page. Please check your credentials or return to the home page.
                    {/* Sinhala: ඔබට මෙම පිටුව බැලීමට අවසර නැත. කරුණාකර ඔබේ අක්තපත්‍ර පරීක්ෂා කරන්න හෝ මුල් පිටුවට ආපසු යන්න. */}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <motion.button
                        onClick={goBack}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Go Back
                        {/* Sinhala: ආපසු යන්න */}
                    </motion.button>
                    <motion.button
                        onClick={goToHome}
                        className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg shadow-md hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Go to Home
                        {/* Sinhala: මුල් පිටුවට යන්න */}
                    </motion.button>
                </div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Not signed in?{" "}
                    <button
                        onClick={goToLogin}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        Log in here
                        {/* Sinhala: පිවිසී නැතිද? මෙතැනින් ලොග් වන්න */}
                    </button>
                </p>
            </motion.div>
        </main>
    );
}