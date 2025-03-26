import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Layout/DashboardLayout";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SectionTable from "./SectionTable"; // Import the SectionTable component

const Section = () => {
    const [sections, setSections] = useState([]);
    const [courses, setCourses] = useState([]);
    const [numberOfClasses, setNumberOfClasses] = useState("");
    const [selectedCourseName, setSelectedCourseName] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { auth } = useAuth();
    const navigate = useNavigate();

    // Fetch all sections
    const fetchSections = () => {
        setIsLoading(true);
        axios
            .get("http://localhost:8080/api/sections", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                setSections(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
                toast.error("Failed to fetch sections");
                setIsLoading(false);
            });
    };

    // Fetch courses without sections
    const fetchCourses = () => {
        axios
            .get("http://localhost:8080/api/courses/no-section", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                setCourses(response.data);
                // If no course is selected and courses exist, select the first course
                if (response.data.length > 0 && !selectedCourseName) {
                    setSelectedCourseName(response.data[0].courseName);
                }
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
                toast.error("Failed to fetch courses");
            });
    };

    // Add a new section
    const addSection = () => {
        if (!numberOfClasses) {
            toast.error("Please enter number of classes");
            return;
        }

        if (!selectedCourseName && (!courses || courses.length === 0)) {
            toast.error("No courses available");
            return;
        }

        const newSection = {
            numberOfClasses: numberOfClasses,
            courseName: selectedCourseName || (courses.length > 0 ? courses[0].courseName : ""),
        };

        setIsLoading(true);
        axios
            .post("http://localhost:8080/api/sections", newSection, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                toast.success("Section added successfully");
                fetchSections();
                setIsModalOpen(false);
                setNumberOfClasses("");
                setSelectedCourseName("");
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
                toast.error("Failed to add section");
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchSections();
        fetchCourses();
    }, []);

    return (
        <Layout>
            <main className="bg-gray-50 min-h-screen p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-800">Sections Management</h1>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 flex items-center"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add New Section
                            </button>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-md mb-6 border-l-4 border-blue-500">
                            <p className="text-blue-700">
                                <span className="font-semibold">Tip:</span> Sections allow you to organize your courses into different class groups.
                            </p>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16 mb-4"></div>
                            </div>
                        ) : (
                            <SectionTable sections={sections} onSectionUpdated={fetchSections} />
                        )}
                    </div>
                </div>

                {/* Add Section Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 w-full max-w-md">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Add New Section</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); addSection(); }}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="numberOfClasses">
                                        Number of Classes
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="numberOfClasses"
                                        type="number"
                                        min={1}
                                        value={numberOfClasses}
                                        onChange={(e) => setNumberOfClasses(e.target.value)}
                                        placeholder="Enter number of classes"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="courseName">
                                        Course
                                    </label>
                                    <select
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="courseName"
                                        value={selectedCourseName}
                                        onChange={(e) => setSelectedCourseName(e.target.value)}
                                    >
                                        <option value="">-- Select Course --</option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.courseName}>
                                                {course.courseName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded mr-2"
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                                        type="submit"
                                    >
                                        Add Section
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </Layout>
    );
};

export default Section;