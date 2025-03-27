import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../../hooks/useAuth"; // Assuming you have this hook

export default function EditModal({ courseId, toggleModal, fetchCourses }) {
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
    const [isLoading, setIsLoading] = useState(false);

    const { auth } = useAuth(); // Get authentication token

    // Fetch initial course data and dropdown options
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                // Fetch course data
                const courseResponse = await axios.get(
                    `http://localhost:8080/api/courses/${courseId}`,
                    {
                        headers: { Authorization: `Bearer ${auth.accessToken}` },
                    }
                );
                const course = courseResponse.data;
                setCourseCode(course.courseCode);
                setCourseName(course.courseName);
                setYear(course.year.toString());
                setSemester(course.semester.toString());
                setSelectedProgrammeName(course.programmeName);
                setSelectedDeptName(course.deptName);
                setSelectedInstructorName(course.instructorName);

                // Fetch departments
                const deptResponse = await axios.get("http://localhost:8080/api/departments", {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                });
                setDepartments(deptResponse.data);

                // Fetch programmes
                const progResponse = await axios.get("http://localhost:8080/api/programs", {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                });
                setProgrammes(progResponse.data);

                // Fetch instructors
                const instResponse = await axios.get("http://localhost:8080/api/instructors", {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                });
                setInstructors(instResponse.data);
            } catch (error) {
                console.error("Error fetching initial data:", error);
                alert("Failed to load course data: " + (error.response?.data?.message || error.message));
            } finally {
                setIsLoading(false);
            }
        };

        if (courseId) {
            fetchInitialData();
        }
    }, [courseId, auth.accessToken]);

    const handleUpdate = async (e) => {
        e.preventDefault();

        const updatedCourse = {
            courseCode,
            courseName,
            year: parseInt(year, 10),
            semester: parseInt(semester, 10),
            programmeName: selectedProgrammeName,
            deptName: selectedDeptName,
            instructorName: selectedInstructorName
        };

        try {
            setIsLoading(true);
            await axios.put(
                `http://localhost:8080/api/courses/${courseId}`,
                updatedCourse,
                { headers: { Authorization: `Bearer ${auth.accessToken}` } }
            );
            fetchCourses();
            toggleModal();
        } catch (error) {
            console.error("Error updating course:", error);
            alert("Failed to update course: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
            return;
        }

        try {
            setIsLoading(true);
            await axios.delete(
                `http://localhost:8080/api/courses/${courseId}`,
                { headers: { Authorization: `Bearer ${auth.accessToken}` } }
            );
            fetchCourses(); // Refresh the course list
            toggleModal();  // Close the modal
            alert("Course deleted successfully"); // Since backend returns 204, we add our own success message
        } catch (error) {
            console.error("Error deleting course:", error);
            let errorMessage = "Failed to delete course";
            if (error.response) {
                if (error.response.status === 404) {
                    errorMessage = "Course not found";
                } else if (error.response.status === 500) {
                    errorMessage = error.response.data.message || "Server error occurred";
                } else {
                    errorMessage = error.response.data.message || error.message;
                }
            }
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="text-lg font-bold">Edit Course</h3>
                    <button
                        className="btn btn-sm btn-circle"
                        onClick={toggleModal}
                        disabled={isLoading}
                    >
                        ✕
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdate} className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label htmlFor="course_code" className="label">
                                    <span className="label-text">Course Code</span>
                                </label>
                                <input
                                    className="input input-bordered"
                                    type="text"
                                    id="course_code"
                                    value={courseCode}
                                    onChange={(e) => setCourseCode(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label htmlFor="course_name" className="label">
                                    <span className="label-text">Course Name</span>
                                </label>
                                <input
                                    className="input input-bordered"
                                    type="text"
                                    id="course_name"
                                    value={courseName}
                                    onChange={(e) => setCourseName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label htmlFor="year" className="label">
                                    <span className="label-text">Year</span>
                                </label>
                                <input
                                    className="input input-bordered"
                                    type="number"
                                    id="year"
                                    min="1"
                                    max="6"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label htmlFor="semester" className="label">
                                    <span className="label-text">Semester</span>
                                </label>
                                <input
                                    className="input input-bordered"
                                    type="number"
                                    id="semester"
                                    min="1"
                                    max="2"
                                    value={semester}
                                    onChange={(e) => setSemester(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label htmlFor="programme" className="label">
                                    <span className="label-text">Programme</span>
                                </label>
                                <select
                                    className="select select-bordered"
                                    id="programme"
                                    value={selectedProgrammeName}
                                    onChange={(e) => setSelectedProgrammeName(e.target.value)}
                                    required
                                >
                                    <option value="">Select Programme</option>
                                    {programmes.map((programme) => (
                                        <option key={programme.id} value={programme.programmeName}>
                                            {programme.programmeName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-control">
                                <label htmlFor="department" className="label">
                                    <span className="label-text">Department</span>
                                </label>
                                <select
                                    className="select select-bordered"
                                    id="department"
                                    value={selectedDeptName}
                                    onChange={(e) => setSelectedDeptName(e.target.value)}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((department) => (
                                        <option key={department.id} value={department.deptName}>
                                            {department.deptName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-control">
                                <label htmlFor="instructor" className="label">
                                    <span className="label-text">Instructor</span>
                                </label>
                                <select
                                    className="select select-bordered"
                                    id="instructor"
                                    value={selectedInstructorName}
                                    onChange={(e) => setSelectedInstructorName(e.target.value)}
                                    required
                                >
                                    <option value="">Select Instructor</option>
                                    {instructors.map((instructor) => (
                                        <option
                                            key={instructor.id}
                                            value={`${instructor.firstName} ${instructor.lastName}`}
                                        >
                                            {instructor.firstName} {instructor.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="modal-action mt-6">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={toggleModal}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-error"
                                onClick={handleDelete}
                                disabled={isLoading}
                            >
                                {isLoading ? "Deleting..." : "Delete"}
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? "Updating..." : "Update Course"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}