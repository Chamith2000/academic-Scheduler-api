import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SectionTable = ({ sections, onSectionUpdated }) => {
    const [courses, setCourses] = useState([]);
    const [numberOfClasses, setNumberOfClasses] = useState("");
    const [selectedCourseName, setSelectedCourseName] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentSection, setCurrentSection] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { auth } = useAuth();
    const navigate = useNavigate();

    // Fetch all courses
    const fetchCourses = () => {
        axios
            .get("http://localhost:8080/api/courses/", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                setCourses(response.data);
                // If editing a section and no course is selected, set the first course
                if (response.data.length > 0 && !selectedCourseName && currentSection) {
                    setSelectedCourseName(response.data[0].courseName);
                }
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
                toast.error("Failed to fetch courses");
            });
    };

    useEffect(() => {
        fetchCourses();
    }, [isEditModalOpen]);

    const openEditModal = (section) => {
        setCurrentSection(section);
        setNumberOfClasses(section.numberOfClasses);
        setSelectedCourseName(section.courseName);
        setIsEditModalOpen(true);
    };

    const handleSectionUpdate = () => {
        if (!currentSection) return;

        if (!numberOfClasses) {
            toast.error("Please enter number of classes");
            return;
        }

        const updatedSection = {
            id: currentSection.section_id,
            numberOfClasses: numberOfClasses,
            courseName: selectedCourseName,
        };

        setIsLoading(true);
        axios
            .put(`http://localhost:8080/api/sections/${currentSection.section_id}`, updatedSection, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                toast.success("Section updated successfully");
                setIsEditModalOpen(false);
                if (onSectionUpdated) onSectionUpdated();
                setIsLoading(false);
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
                toast.error("Failed to update section");
                setIsLoading(false);
            });
    };

    const handleDeleteSection = (sectionId) => {
        if (window.confirm("Are you sure you want to delete this section?")) {
            setIsLoading(true);
            axios
                .delete(`http://localhost:8080/api/sections/${sectionId}`, {
                    headers: {
                        Authorization: `Bearer ${auth.accessToken}`,
                    },
                })
                .then((response) => {
                    toast.success("Section deleted successfully");
                    if (onSectionUpdated) onSectionUpdated();
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error(`Error: ${error}`);
                    toast.error("Failed to delete section");
                    setIsLoading(false);
                });
        }
    };

    return (
        <div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {sections.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-lg font-medium">No sections found</p>
                        <p className="mt-1">Add a new section to get started</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                Number of Classes
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                Course Name
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {sections.map((section) => (
                            <tr key={section.section_id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                                            {section.numberOfClasses}
                                        </div>
                                        <span>{section.numberOfClasses} classes</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md">
                      {section.courseName}
                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 flex space-x-2">
                                    <button
                                        onClick={() => openEditModal(section)}
                                        className="text-blue-600 hover:text-blue-800 transition duration-300 p-1 rounded-full hover:bg-blue-100"
                                        title="Edit Section"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-800 transition duration-300 p-1 rounded-full hover:bg-red-100"
                                        onClick={() => handleDeleteSection(section.section_id)}
                                        title="Delete Section"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                            <line x1="10" y1="11" x2="10" y2="17"/>
                                            <line x1="14" y1="11" x2="14" y2="17"/>
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Edit Section Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Edit Section</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleSectionUpdate(); }}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="editNumberOfClasses">
                                    Number of Classes
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="editNumberOfClasses"
                                    type="number"
                                    min={1}
                                    value={numberOfClasses}
                                    onChange={(e) => setNumberOfClasses(e.target.value)}
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="editCourseName">
                                    Course
                                </label>
                                <select
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="editCourseName"
                                    value={selectedCourseName}
                                    onChange={(e) => setSelectedCourseName(e.target.value)}
                                >
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
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Updating..." : "Update Section"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SectionTable;