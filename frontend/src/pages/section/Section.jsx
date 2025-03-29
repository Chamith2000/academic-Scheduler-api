import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Layout/DashboardLayout";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SectionTable from "./SectionTable";
import { PlusIcon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

const Section = () => {
    const [sections, setSections] = useState([]);
    const [filteredSections, setFilteredSections] = useState([]);
    const [courses, setCourses] = useState([]);
    const [numberOfClasses, setNumberOfClasses] = useState("");
    const [selectedCourseName, setSelectedCourseName] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const { auth } = useAuth();
    const navigate = useNavigate();

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
                setFilteredSections(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error(`Error fetching sections: ${error}`);
                toast.error("Failed to fetch sections");
                setIsLoading(false);
            });
    };

    const fetchCourses = () => {
        axios
            .get("http://localhost:8080/api/courses", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                setCourses(response.data);
                if (response.data.length > 0 && !selectedCourseName) {
                    setSelectedCourseName(response.data[0].courseName);
                }
            })
            .catch((error) => {
                console.error(`Error fetching courses: ${error}`);
                toast.error("Failed to fetch courses");
            });
    };

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
                console.error(`Error adding section: ${error}`);
                toast.error("Failed to add section");
                setIsLoading(false);
            });
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        const filtered = sections.filter((section) =>
            section.courseName.toLowerCase().includes(query.toLowerCase()) ||
            section.numberOfClasses.toString().includes(query)
        );
        setFilteredSections(filtered);
    };

    useEffect(() => {
        fetchSections();
        fetchCourses();
    }, []);

    return (
        <Layout>
            <div className="container mx-auto px-4 sm:px-8 py-8">
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <span className="mr-3">Sections Management</span>
                            {isLoading && (
                                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            )}
                        </h2>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="       Search sections..."
                                    className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" // Increased padding-left and added width
                                />
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add New Section
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="text-sm text-gray-600 mb-4 bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                            <span className="font-semibold">Tip:</span> Sections allow you to organize your courses into different class groups.
                        </div>

                        <SectionTable
                            sections={filteredSections}
                            onSectionUpdated={fetchSections}
                        />
                    </div>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
                        <div className="relative w-full max-w-md mx-auto my-6">
                            <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
                                <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
                                    <h3 className="text-xl font-semibold text-gray-800">
                                        Add New Section
                                    </h3>
                                    <button
                                        className="float-right p-1 ml-auto bg-transparent border-0 text-gray-500 opacity-75 hover:opacity-100"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        addSection();
                                    }}
                                    className="relative flex-auto p-6"
                                >
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Number of Classes
                                        </label>
                                        <input
                                            type="number"
                                            value={numberOfClasses}
                                            onChange={(e) => setNumberOfClasses(e.target.value)}
                                            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 transition duration-300"
                                            placeholder="Enter number of classes"
                                            required
                                            min="1"
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Course
                                        </label>
                                        <select
                                            value={selectedCourseName}
                                            onChange={(e) => setSelectedCourseName(e.target.value)}
                                            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 transition duration-300"
                                            required
                                        >
                                            <option value="">-- Select Course --</option>
                                            {courses.map((course) => (
                                                <option key={course.id} value={course.courseName}>
                                                    {course.courseName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-300"
                                        >
                                            Add Section
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {isModalOpen && (
                    <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
                )}
            </div>
        </Layout>
    );
};

export default Section;