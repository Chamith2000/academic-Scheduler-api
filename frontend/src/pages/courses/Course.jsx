import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../../Layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { PlusCircle, Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

const Course = () => {
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [courseCode, setCourseCode] = useState("");
    const [courseName, setCourseName] = useState("");
    const [year, setYear] = useState("");
    const [semester, setSemester] = useState("");
    const [selectedProgrammeName, setSelectedProgrammeName] = useState("");
    const [selectedDeptName, setSelectedDeptName] = useState("");
    const [selectedInstructorName, setSelectedInstructorName] = useState("");
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const { auth } = useAuth();
    const navigate = useNavigate();

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

    // Filter courses based on search term
    const filteredCourses = courses.filter(course =>
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.programmeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.deptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentCourses = filteredCourses.slice(indexOfFirstRecord, indexOfLastRecord);
    const isFirstPage = currentPage === 1;
    const isLastPage = indexOfLastRecord >= filteredCourses.length;

    function handleNextPage() {
        setCurrentPage((prev) => prev + 1);
    }

    function handlePreviousPage() {
        if (!isFirstPage) {
            setCurrentPage((prev) => prev - 1);
        }
    }

    const fetchCourses = () => {
        setIsLoading(true);
        axios
            .get("http://localhost:8080/api/courses", {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            .then((response) => {
                setCourses(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
                setIsLoading(false);
            });
    };

    const fetchDepartments = () => {
        axios
            .get("http://localhost:8080/api/departments", {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            .then((response) => {
                setDepartments(response.data);
                if (response.data.length > 0) setSelectedDeptName(response.data[0].deptName);
            })
            .catch((error) => console.error(`Error: ${error}`));
    };

    const fetchProgrammes = () => {
        axios
            .get("http://localhost:8080/api/programs", {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            .then((response) => {
                setProgrammes(response.data);
                if (response.data.length > 0) setSelectedProgrammeName(response.data[0].programmeName);
            })
            .catch((error) => console.error(`Error: ${error}`));
    };

    const fetchInstructors = () => {
        axios
            .get("http://localhost:8080/api/instructors", {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            .then((response) => {
                setInstructors(response.data);
                if (response.data.length > 0) setSelectedInstructorName(response.data[0].firstName);
            })
            .catch((error) => console.error(`Error: ${error}`));
    };

    const resetForm = () => {
        setCourseCode("");
        setCourseName("");
        setYear("");
        setSemester("");
        setSelectedProgrammeName(programmes.length > 0 ? programmes[0].programmeName : "");
        setSelectedDeptName(departments.length > 0 ? departments[0].deptName : "");
        setSelectedInstructorName(instructors.length > 0 ? instructors[0].firstName : "");
    };

    const addCourse = (e) => {
        e.preventDefault();
        const newCourse = {
            courseCode,
            courseName,
            year: parseInt(year, 10),
            semester: parseInt(semester, 10),
            programmeName: selectedProgrammeName,
            deptName: selectedDeptName,
            instructorName: selectedInstructorName,
        };

        axios
            .post("http://localhost:8080/api/courses", newCourse, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            .then((response) => {
                setShowModal(false);
                showToast("Course added successfully!", "success");
                fetchCourses();
                resetForm();
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
                showToast("Failed to add course.", "error");
            });
    };

    const updateCourse = (e) => {
        e.preventDefault();
        const updatedCourse = {
            courseCode,
            courseName,
            year: parseInt(year, 10),
            semester: parseInt(semester, 10),
            programmeName: selectedProgrammeName,
            deptName: selectedDeptName,
            instructorName: selectedInstructorName,
        };

        axios
            .put(`http://localhost:8080/api/courses/${editingCourseId}`, updatedCourse, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            .then((response) => {
                setShowModal(false);
                showToast("Course updated successfully!", "success");
                fetchCourses();
                resetForm();
                setEditingCourseId(null);
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
                showToast("Failed to update course.", "error");
            });
    };

    const handleDelete = (id) => {
        axios
            .delete(`http://localhost:8080/api/courses/${id}`, {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            .then(() => {
                showToast("Course deleted successfully!", "success");
                fetchCourses();
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
                showToast("Failed to delete course.", "error");
            });
    };

    const handleEdit = (id) => {
        setEditingCourseId(id);
        setShowModal(true);
        const courseToEdit = courses.find(course => course.id === id);
        if (courseToEdit) {
            setCourseCode(courseToEdit.courseCode);
            setCourseName(courseToEdit.courseName);
            setYear(courseToEdit.year);
            setSemester(courseToEdit.semester);
            setSelectedProgrammeName(courseToEdit.programmeName);
            setSelectedDeptName(courseToEdit.deptName);
            setSelectedInstructorName(courseToEdit.instructorName);
        }
    };

    const showToast = (message, type = "info") => {
        const toast = document.createElement("div");
        toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"
        } text-white`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add("opacity-0", "transition-opacity", "duration-500");
            setTimeout(() => document.body.removeChild(toast), 500);
        }, 3000);
    };

    useEffect(() => {
        fetchCourses();
        fetchDepartments();
        fetchProgrammes();
        fetchInstructors();
    }, []);

    return (
        <DashboardLayout>
            <main className="p-6 bg-gray-50 min-h-screen">
                <h1 className="font-bold text-3xl mb-6">Course Management</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-gray-500 text-sm font-medium">Total Courses</h3>
                                <p className="text-3xl font-bold text-gray-800">{courses.length}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-gray-500 text-sm font-medium">Total Departments</h3>
                                <p className="text-3xl font-bold text-gray-800">{departments.length}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1结尾 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-gray-500 text-sm font-medium">Total Programmes</h3>
                                <p className="text-3xl font-bold text-gray-800">{programmes.length}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">Course List</h2>
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="     Search courses..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="absolute left-3 top-2.5">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowModal(true); setEditingCourseId(null); resetForm(); }}
                                className="btn gap-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 border-0"
                            >
                                <PlusCircle size={16} />
                                Add Course
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <>
                            {currentCourses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <p className="text-xl">No courses found</p>
                                    <p className="text-sm mt-2">Try adjusting your search or add a new course</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 rounded-l-lg">Course</th>
                                            <th scope="col" className="px-6 py-3">Year</th>
                                            <th scope="col" className="px-6 py-3">Semester</th>
                                            <th scope="col" className="px-6 py-3">Programme</th>
                                            <th scope="col" className="px-6 py-3">Department</th>
                                            <th scope="col" className="px-6 py-3">Instructor</th>
                                            <th scope="col" className="px-6 py-3 rounded-r-lg text-center">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {currentCourses.map((course, index) => (
                                            <tr key={course.id || index} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                <td className="px-6 py-4 font-medium">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-900">{course.courseName}</span>
                                                        <span className="text-gray-500 text-xs">{course.courseCode}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{course.year}</td>
                                                <td className="px-6 py-4">{course.semester}</td>
                                                <td className="px-6 py-4">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              {course.programmeName}
                            </span>
                                                </td>
                                                <td className="px-6 py-4">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              {course.deptName}
                            </span>
                                                </td>
                                                <td className="px-6 py-4">{course.instructorName}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(course.id)}
                                                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-100 rounded-full transition-colors"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <label
                                                            htmlFor={`delete-modal-${course.id}`}
                                                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-100 rounded-full transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 size={16} />
                                                        </label>
                                                        <input type="checkbox" id={`delete-modal-${course.id}`} className="modal-toggle" />
                                                        <div className="modal">
                                                            <div className="modal-box bg-white">
                                                                <h3 className="font-bold text-lg text-gray-900">Confirm Delete</h3>
                                                                <p className="py-4 text-gray-600">
                                                                    Are you sure you want to delete the course <strong>{course.courseName}</strong>? This action cannot be undone.
                                                                </p>
                                                                <div className="modal-action">
                                                                    <label htmlFor={`delete-modal-${course.id}`} className="btn btn-outline">Cancel</label>
                                                                    <label
                                                                        htmlFor={`delete-modal-${course.id}`}
                                                                        className="btn bg-red-600 hover:bg-red-700 text-white border-0"
                                                                        onClick={() => handleDelete(course.id)}
                                                                    >
                                                                        Delete
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <div className="flex justify-between items-center mt-6">
                                <div className="text-sm text-gray-500">
                                    Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredCourses.length)} of {filteredCourses.length} entries
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className={`flex items-center gap-1 px-3 py-1 rounded border ${
                                            isFirstPage ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50'
                                        }`}
                                        onClick={handlePreviousPage}
                                        disabled={isFirstPage}
                                    >
                                        <ChevronLeft size={16} />
                                        Previous
                                    </button>
                                    <button
                                        className={`flex items-center gap-1 px-3 py-1 rounded border ${
                                            isLastPage ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50'
                                        }`}
                                        onClick={handleNextPage}
                                        disabled={isLastPage}
                                    >
                                        Next
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </section>

                {/* Add/Edit Course Modal */}
                {showModal && (
                    <div className="modal modal-open">
                        <div className="modal-box max-w-3xl bg-white">
                            <div className="flex justify-between items-center border-b pb-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {editingCourseId ? "Edit Course" : "Add New Course"}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                        setEditingCourseId(null);
                                    }}
                                    className="btn btn-sm btn-circle btn-ghost"
                                >
                                    ✕
                                </button>
                            </div>
                            <form className="mt-4" onSubmit={editingCourseId ? updateCourse : addCourse}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-gray-700 font-medium">Course Code</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. CS101"
                                            className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={courseCode}
                                            onChange={(e) => setCourseCode(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-gray-700 font-medium">Course Name</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Introduction to Programming"
                                            className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={courseName}
                                            onChange={(e) => setCourseName(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-gray-700 font-medium">Year</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="6"
                                            placeholder="1-6"
                                            className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-gray-700 font-medium">Semester</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="2"
                                            placeholder="1-2"
                                            className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={semester}
                                            onChange={(e) => setSemester(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-gray-700 font-medium">Programme</span>
                                        </label>
                                        <select
                                            className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={selectedProgrammeName}
                                            onChange={(e) => setSelectedProgrammeName(e.target.value)}
                                        >
                                            {programmes.map((programme) => (
                                                <option key={programme.id} value={programme.programmeName}>
                                                    {programme.programmeName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-gray-700 font-medium">Department</span>
                                        </label>
                                        <select
                                            className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={selectedDeptName}
                                            onChange={(e) => setSelectedDeptName(e.target.value)}
                                        >
                                            {departments.map((department) => (
                                                <option key={department.id} value={department.deptName}>
                                                    {department.deptName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-gray-700 font-medium">Instructor</span>
                                        </label>
                                        <select
                                            className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={selectedInstructorName}
                                            onChange={(e) => setSelectedInstructorName(e.target.value)}
                                        >
                                            {instructors.map((instructor) => (
                                                <option key={instructor.id} value={instructor.firstName}>
                                                    {instructor.firstName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                            setEditingCourseId(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-md"
                                    >
                                        {editingCourseId ? "Update Course" : "Add Course"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </DashboardLayout>
    );
};

export default Course;