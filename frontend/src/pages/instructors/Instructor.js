import React, { useState, useEffect } from "react";
import "./instructor.css";
import axios from "axios";
import DashboardLayout from "../../Layout/DashboardLayout";
import { BiTimeFive, BiTrash, BiEdit, BiPlus, BiUser, BiBuilding, BiX } from "react-icons/bi";
import { FaChalkboardTeacher, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Instructor = () => {
    const [instructors, setInstructors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [selectedDeptName, setSelectedDeptName] = useState("");
    const [allPreferences, setAllPreferences] = useState([]);
    const [timeslots, setTimeslots] = useState([]);
    const [selectedTimeslot, setSelectedTimeslot] = useState("");
    const [selectedInstructor, setSelectedInstructor] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPreferenceModal, setShowPreferenceModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRemovePreferenceModal, setShowRemovePreferenceModal] = useState(false);
    const [instructorToDelete, setInstructorToDelete] = useState(null);
    const [instructorToEdit, setInstructorToEdit] = useState(null);
    const [preferenceToRemove, setPreferenceToRemove] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { auth } = useAuth();
    const navigate = useNavigate();

    // Form validation errors
    const [formErrors, setFormErrors] = useState({
        firstName: "",
        lastName: "",
        department: "",
        instructorSelect: "",
        timeslotSelect: ""
    });

    // Pagination for the table
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = instructors.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(instructors.length / recordsPerPage);
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    // Real-time validation functions
    const validateFirstName = (value) => {
        if (!value.trim()) return "First Name is required";
        if (value.trim().length < 2) return "First Name must be at least 2 characters long";
        if (!/^[A-Za-z\s'-]+$/.test(value.trim())) return "First Name can only contain letters, spaces, hyphens, and apostrophes";
        return "";
    };

    const validateLastName = (value) => {
        if (!value.trim()) return "Last Name is required";
        if (value.trim().length < 2) return "Last Name must be at least 2 characters long";
        if (!/^[A-Za-z\s'-]+$/.test(value.trim())) return "Last Name can only contain letters, spaces, hyphens, and apostrophes";
        return "";
    };

    const validateDepartment = (value) => {
        if (!value) return "Department is required";
        return "";
    };

    const validateInstructorSelect = (value) => {
        if (!value) return "Please select an instructor";
        return "";
    };

    const validateTimeslotSelect = (value) => {
        if (!value) return "Please select a time slot";
        return "";
    };

    // Real-time validation handlers
    const handleFirstNameChange = (e) => {
        const value = e.target.value;
        setFirstName(value);
        setFormErrors(prev => ({ ...prev, firstName: validateFirstName(value) }));
    };

    const handleLastNameChange = (e) => {
        const value = e.target.value;
        setLastName(value);
        setFormErrors(prev => ({ ...prev, lastName: validateLastName(value) }));
    };

    const handleDeptChange = (e) => {
        const value = e.target.value;
        setSelectedDeptName(value);
        setFormErrors(prev => ({ ...prev, department: validateDepartment(value) }));
    };

    const handleInstructorSelectChange = (e) => {
        const value = e.target.value;
        setSelectedInstructor(value);
        setFormErrors(prev => ({ ...prev, instructorSelect: validateInstructorSelect(value) }));
    };

    const handleTimeslotSelectChange = (e) => {
        const value = e.target.value;
        setSelectedTimeslot(value);
        setFormErrors(prev => ({ ...prev, timeslotSelect: validateTimeslotSelect(value) }));
    };

    // Form submission validation
    const validateInstructorForm = () => {
        const errors = {
            firstName: validateFirstName(firstName),
            lastName: validateLastName(lastName),
            department: validateDepartment(selectedDeptName)
        };
        setFormErrors(prev => ({ ...prev, ...errors }));
        return Object.values(errors).every(error => !error);
    };

    const validatePreferenceForm = () => {
        const errors = {
            instructorSelect: validateInstructorSelect(selectedInstructor),
            timeslotSelect: validateTimeslotSelect(selectedTimeslot)
        };
        setFormErrors(prev => ({ ...prev, ...errors }));
        return Object.values(errors).every(error => !error);
    };

    function handleNextPage() {
        if (!isLastPage) {
            setCurrentPage((prev) => prev + 1);
        }
    }

    function handlePreviousPage() {
        if (!isFirstPage) {
            setCurrentPage((prev) => prev - 1);
        }
    }

    const fetchInstructors = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/api/instructors", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            });
            setInstructors(response.data);
        } catch (error) {
            console.error(`Error fetching instructors: ${error}`);
            toast.error("Failed to fetch instructors");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTimeSlots = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/timeslots", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            });
            setTimeslots(response.data);
        } catch (error) {
            console.error(`Error fetching timeslots: ${error}`);
            toast.error("Failed to fetch timeslots");
        }
    };

    const fetchAllPreferences = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/instructors/preferences", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            });
            setAllPreferences(response.data);
        } catch (error) {
            console.error(`Error fetching preferences: ${error}`);
            toast.error("Failed to fetch preferences");
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/departments", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            });
            setDepartments(response.data);
            if (response.data.length > 0 && !selectedDeptName) {
                setSelectedDeptName(response.data[0].deptName);
            }
        } catch (error) {
            console.error(`Error fetching departments: ${error}`);
            toast.error("Failed to fetch departments");
        }
    };

    const addInstructor = async () => {
        if (!validateInstructorForm()) {
            toast.error("Please fix all validation errors before submitting.");
            return;
        }

        let newDeptName = selectedDeptName;
        if (selectedDeptName === "") {
            newDeptName = departments.length > 0 ? departments[0].deptName : "";
        }
        const newInstructor = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            deptName: newDeptName,
        };
        try {
            await axios.post("http://localhost:8080/api/instructors", newInstructor, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            });
            await fetchInstructors();
            await fetchAllPreferences();
            setShowAddModal(false);
            resetForm();
            toast.success("Instructor added successfully!");
        } catch (error) {
            console.error(`Error adding instructor: ${error}`);
            toast.error(error.response?.data?.message || "Failed to add instructor");
        }
    };

    const editInstructor = async () => {
        if (!validateInstructorForm()) {
            toast.error("Please fix all validation errors before submitting.");
            return;
        }

        if (!instructorToEdit) return;

        const updatedInstructor = {
            id: instructorToEdit.id,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            deptName: selectedDeptName,
        };

        try {
            await axios.put(`http://localhost:8080/api/instructors/${instructorToEdit.id}`, updatedInstructor, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            });
            await fetchInstructors();
            await fetchAllPreferences();
            setShowEditModal(false);
            setInstructorToEdit(null);
            resetForm();
            toast.success("Instructor updated successfully!");
        } catch (error) {
            console.error(`Error updating instructor: ${error}`);
            toast.error(error.response?.data?.message || "Failed to update instructor");
        }
    };

    const resetForm = () => {
        setFirstName("");
        setLastName("");
        setSelectedDeptName(departments.length > 0 ? departments[0].deptName : "");
        setSelectedInstructor("");
        setSelectedTimeslot("");
        setFormErrors({
            firstName: "",
            lastName: "",
            department: "",
            instructorSelect: "",
            timeslotSelect: ""
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchInstructors();
            await fetchDepartments();
            await fetchTimeSlots();
            await fetchAllPreferences();
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (instructorToEdit) {
            setFirstName(instructorToEdit.firstName);
            setLastName(instructorToEdit.lastName);
            setSelectedDeptName(instructorToEdit.deptName);
            setFormErrors({
                firstName: validateFirstName(instructorToEdit.firstName),
                lastName: validateLastName(instructorToEdit.lastName),
                department: validateDepartment(instructorToEdit.deptName),
                instructorSelect: "",
                timeslotSelect: ""
            });
        }
    }, [instructorToEdit]);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/instructors/${id}`, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            });
            await fetchInstructors();
            await fetchAllPreferences();
            setShowDeleteModal(false);
            setInstructorToDelete(null);
            toast.success("Instructor deleted successfully!");
        } catch (error) {
            console.error(`Error deleting instructor: ${error}`);
            toast.error("Error deleting instructor. Please try again.");
        }
    };

    const handleRemovePreference = async () => {
        if (!preferenceToRemove) return;
        const { instructorId, preferenceId } = preferenceToRemove;

        try {
            const response = await axios.delete(
                `http://localhost:8080/api/instructors/${instructorId}/preferences/${preferenceId}`,
                {
                    headers: {
                        Authorization: `Bearer ${auth.accessToken}`,
                    },
                }
            );

            if (response.status === 204 || response.status === 200) {
                await Promise.all([fetchAllPreferences(), fetchInstructors()]);
                setShowRemovePreferenceModal(false);
                setPreferenceToRemove(null);
                toast.success("Preference removed successfully!");
            } else {
                console.error("Unexpected status:", response.status);
                toast.error("Failed to remove preference");
            }
        } catch (error) {
            console.error("Error removing preference:", error.response?.data || error.message);
            toast.error("Error: " + (error.response?.data?.message || error.message));
        }
    };

    const handleAddPreference = async () => {
        if (!validatePreferenceForm()) {
            toast.error("Please fix all validation errors before submitting.");
            return;
        }

        const instructorId = selectedInstructor;
        const timeslotObj = JSON.parse(selectedTimeslot);
        const preferenceId = timeslotObj.id;
        const postData = {
            timeslot: timeslotObj,
            instructorId: instructorId,
        };
        try {
            const response = await fetch(
                `http://localhost:8080/api/instructors/${instructorId}/preferences/${preferenceId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${auth.accessToken}`,
                    },
                    body: JSON.stringify(postData),
                }
            );
            if (response.ok) {
                await fetchAllPreferences();
                await fetchInstructors();
                setShowPreferenceModal(false);
                setSelectedInstructor("");
                setSelectedTimeslot("");
                toast.success("Preference added successfully!");
            } else {
                const errorData = await response.json();
                console.error("Failed to add preference", errorData);
                toast.error(errorData.message || "Failed to add preference");
            }
        } catch (error) {
            console.error(`Error adding preference: ${error}`);
            toast.error("Error adding preference");
        }
    };

    const getInstructorPreferences = (instructorId) => {
        const instructorIdStr = String(instructorId);
        const instructorPrefs = allPreferences.find(
            (pref) => String(pref.instructorName) === instructorIdStr
        );
        return instructorPrefs ? instructorPrefs.preferences : [];
    };

    const groupPreferencesByDay = (preferences) => {
        const grouped = {};
        preferences.forEach((pref) => {
            if (!grouped[pref.day]) {
                grouped[pref.day] = [];
            }
            grouped[pref.day].push(pref);
        });
        return grouped;
    };

    const getInstructorName = (instructorId) => {
        const idStr = String(instructorId);
        const instructor = instructors.find((inst) => String(inst.id) === idStr);
        return instructor ? `${instructor.firstName} ${instructor.lastName}` : idStr;
    };

    const getTimeSlotColor = (day) => {
        const colors = {
            Monday: "bg-blue-50 border-blue-200 text-blue-700",
            Tuesday: "bg-green-50 border-green-200 text-green-700",
            Wednesday: "bg-purple-50 border-purple-200 text-purple-700",
            Thursday: "bg-yellow-50 border-yellow-200 text-yellow-700",
            Friday: "bg-red-50 border-red-200 text-red-700",
            Saturday: "bg-indigo-50 border-indigo-200 text-indigo-700",
            Sunday: "bg-pink-50 border-pink-200 text-pink-700",
        };
        return colors[day] || "bg-gray-50 border-gray-200 text-gray-700";
    };

    const renderAddInstructorModal = () => {
        return (
            showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Instructor</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                addInstructor();
                            }}
                        >
                            <div className="mb-4">
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    value={firstName}
                                    onChange={handleFirstNameChange}
                                    className={`w-full px-4 py-2 border ${
                                        formErrors.firstName
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } rounded-md focus:outline-none focus:ring-2`}
                                    required
                                />
                                {formErrors.firstName && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    value={lastName}
                                    onChange={handleLastNameChange}
                                    className={`w-full px-4 py-2 border ${
                                        formErrors.lastName
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } rounded-md focus:outline-none focus:ring-2`}
                                    required
                                />
                                {formErrors.lastName && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                                )}
                            </div>
                            <div className="mb-6">
                                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                                    Department
                                </label>
                                <select
                                    id="department"
                                    value={selectedDeptName}
                                    onChange={handleDeptChange}
                                    className={`w-full px-4 py-2 border ${
                                        formErrors.department
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } rounded-md focus:outline-none focus:ring-2`}
                                >
                                    {departments.map((department) => (
                                        <option key={department.id} value={department.deptName}>
                                            {department.deptName}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.department && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.department}</p>
                                )}
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                    Add Instructor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
        );
    };

    const renderEditInstructorModal = () => {
        return (
            showEditModal && instructorToEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Instructor</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                editInstructor();
                            }}
                        >
                            <div className="mb-4">
                                <label htmlFor="editFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="editFirstName"
                                    value={firstName}
                                    onChange={handleFirstNameChange}
                                    className={`w-full px-4 py-2 border ${
                                        formErrors.firstName
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } rounded-md focus:outline-none focus:ring-2`}
                                    required
                                />
                                {formErrors.firstName && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="editLastName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="editLastName"
                                    value={lastName}
                                    onChange={handleLastNameChange}
                                    className={`w-full px-4 py-2 border ${
                                        formErrors.lastName
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } rounded-md focus:outline-none focus:ring-2`}
                                    required
                                />
                                {formErrors.lastName && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                                )}
                            </div>
                            <div className="mb-6">
                                <label htmlFor="editDepartment" className="block text-sm font-medium text-gray-700 mb-1">
                                    Department
                                </label>
                                <select
                                    id="editDepartment"
                                    value={selectedDeptName}
                                    onChange={handleDeptChange}
                                    className={`w-full px-4 py-2 border ${
                                        formErrors.department
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } rounded-md focus:outline-none focus:ring-2`}
                                >
                                    {departments.map((department) => (
                                        <option key={department.id} value={department.deptName}>
                                            {department.deptName}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.department && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.department}</p>
                                )}
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setInstructorToEdit(null);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
        );
    };

    const renderAddPreferenceModal = () => {
        return (
            showPreferenceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Time Preference</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleAddPreference();
                            }}
                        >
                            <div className="mb-4">
                                <label htmlFor="instructorSelect" className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Instructor
                                </label>
                                <select
                                    id="instructorSelect"
                                    value={selectedInstructor}
                                    onChange={handleInstructorSelectChange}
                                    className={`w-full px-4 py-2 border ${
                                        formErrors.instructorSelect
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } rounded-md focus:outline-none focus:ring-2`}
                                    required
                                >
                                    <option value="">Select an instructor</option>
                                    {instructors.map((instructor) => (
                                        <option key={instructor.id} value={instructor.id}>
                                            {instructor.firstName} {instructor.lastName} - {instructor.deptName}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.instructorSelect && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.instructorSelect}</p>
                                )}
                            </div>
                            <div className="mb-6">
                                <label htmlFor="timeslotSelect" className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Time Slot
                                </label>
                                <select
                                    id="timeslotSelect"
                                    value={selectedTimeslot}
                                    onChange={handleTimeslotSelectChange}
                                    className={`w-full px-4 py-2 border ${
                                        formErrors.timeslotSelect
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } rounded-md focus:outline-none focus:ring-2`}
                                    required
                                >
                                    <option value="">Select a time slot</option>
                                    {timeslots.map((timeslot) => (
                                        <option key={timeslot.id} value={JSON.stringify(timeslot)}>
                                            {timeslot.day} ({timeslot.startTime} - {timeslot.endTime})
                                        </option>
                                    ))}
                                </select>
                                {formErrors.timeslotSelect && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.timeslotSelect}</p>
                                )}
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPreferenceModal(false);
                                        setSelectedInstructor("");
                                        setSelectedTimeslot("");
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    disabled={!selectedInstructor || !selectedTimeslot}
                                >
                                    Add Preference
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
        );
    };

    return (
        <DashboardLayout>
            <div className="instructor-container p-6 bg-gray-50 min-h-screen">
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Instructors Management</h1>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                        >
                            <BiPlus className="mr-2" /> Add Instructor
                        </button>
                        <button
                            onClick={() => setShowPreferenceModal(true)}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
                        >
                            <FaCalendarAlt className="mr-2" /> Add Preference
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FaChalkboardTeacher className="text-blue-500 text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-sm font-medium text-gray-500">Total Instructors</h2>
                                <p className="text-2xl font-semibold text-gray-800">{instructors.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <BiBuilding className="text-green-500 text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-sm font-medium text-gray-500">Total Departments</h2>
                                <p className="text-2xl font-semibold text-gray-800">{departments.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-full">
                                <BiTimeFive className="text-purple-500 text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-sm font-medium text-gray-500">Total Preferences</h2>
                                <p className="text-2xl font-semibold text-gray-800">
                                    {allPreferences.reduce((sum, instructor) => sum + instructor.preferences.length, 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                            <FaCalendarAlt className="mr-2 text-blue-600" />
                            Instructor Preferences
                        </h2>
                    </div>
                    {allPreferences.length > 0 ? (
                        <div className="p-4">
                            {allPreferences.map((instructor) => {
                                const instructorFullName = getInstructorName(instructor.instructorName);
                                const groupedPreferences = groupPreferencesByDay(instructor.preferences);
                                const instIdStr = String(instructor.instructorName);
                                const deptName = instructors.find((inst) => String(inst.id) === instIdStr)?.deptName || "";

                                return (
                                    <div key={instructor.instructorName} className="mb-6 last:mb-0">
                                        <div className="flex items-center mb-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                                                <BiUser className="text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-800">{instructorFullName}</h3>
                                                <p className="text-sm text-gray-500">{deptName}</p>
                                            </div>
                                        </div>
                                        {instructor.preferences.length > 0 ? (
                                            <div className="ml-11">
                                                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                                                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                                                        <div key={day} className="flex flex-col">
                                                            <h4 className="text-sm font-medium text-gray-600 mb-2">{day}</h4>
                                                            {groupedPreferences[day] ? (
                                                                <div className="space-y-2">
                                                                    {groupedPreferences[day].map((pref) => (
                                                                        <div
                                                                            key={pref.id}
                                                                            className={`p-2 rounded border ${getTimeSlotColor(day)} text-sm relative group`}
                                                                        >
                                                                            <div className="font-medium">
                                                                                {pref.startTime} - {pref.endTime}
                                                                            </div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    const instructorId = instructors.find(inst =>
                                                                                        `${inst.firstName} ${inst.lastName}` === getInstructorName(instructor.instructorName)
                                                                                    )?.id;
                                                                                    setPreferenceToRemove({
                                                                                        instructorId: instructorId,
                                                                                        preferenceId: pref.id,
                                                                                        day: pref.day,
                                                                                        time: `${pref.startTime} - ${pref.endTime}`,
                                                                                    });
                                                                                    setShowRemovePreferenceModal(true);
                                                                                }}
                                                                                className="absolute -right-1 -top-1 bg-white rounded-full p-1 shadow-sm border border-gray-200 hidden group-hover:block hover:bg-red-50 hover:text-red-500 transition-colors"
                                                                            >
                                                                                <BiX className="text-sm" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs text-gray-400 italic p-2 border border-dashed border-gray-200 rounded h-10 flex items-center justify-center">
                                                                    No slots
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="ml-11 p-3 bg-gray-50 rounded border border-gray-200 text-gray-500 italic">
                                                No preferences set for this instructor
                                            </div>
                                        )}
                                        <div className="mt-4 ml-11 border-b border-gray-100 pb-2"></div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                            <FaCalendarAlt className="text-4xl text-gray-300 mb-3" />
                            <p className="text-center italic">No instructor preferences available</p>
                            <button
                                onClick={() => setShowPreferenceModal(true)}
                                className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                            >
                                <BiPlus className="mr-1" /> Add First Preference
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">Existing Instructors</h2>
                        <div className="text-sm text-gray-500">
                            Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, instructors.length)} of {instructors.length}{" "}
                            entries
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading instructors...</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            First Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Department
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Preferences
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {currentRecords.length > 0 ? (
                                        currentRecords.map((instructor, index) => {
                                            const preferences = getInstructorPreferences(instructor.id);
                                            return (
                                                <tr key={instructor.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {instructor.firstName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{instructor.lastName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{instructor.deptName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex flex-wrap gap-1">
                                                            {preferences && preferences.length > 0 ? (
                                                                preferences.map((pref) => (
                                                                    <span key={pref.id} className={`px-2 py-1 rounded-full text-xs ${getTimeSlotColor(pref.day)}`}>
                                                                        {pref.day} {pref.startTime}-{pref.endTime}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-gray-400 italic">No preferences</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => {
                                                                    setInstructorToDelete(instructor);
                                                                    setShowDeleteModal(true);
                                                                }}
                                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                                                                title="Delete Instructor"
                                                            >
                                                                <BiTrash className="text-lg" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setInstructorToEdit(instructor);
                                                                    setShowEditModal(true);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                                                                title="Edit Instructor"
                                                            >
                                                                <BiEdit className="text-lg" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No instructors found
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                <div className="text-gray-500 text-sm">
                                    Page {currentPage} of {totalPages || 1}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handlePreviousPage}
                                        disabled={isFirstPage}
                                        className={`px-4 py-2 rounded ${
                                            isFirstPage ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={isLastPage}
                                        className={`px-4 py-2 rounded ${
                                            isLastPage ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {renderAddInstructorModal()}
            {renderEditInstructorModal()}
            {renderAddPreferenceModal()}

            {showDeleteModal && instructorToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-center bg-red-100 h-12 w-12 rounded-full mx-auto mb-4">
                            <BiTrash className="text-red-600 text-xl" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Delete Instructor</h3>
                        <p className="text-sm text-gray-600 text-center mb-6">
                            Warning: This will remove the instructor and set their courses to have no instructor.
                            Are you sure you want to delete {instructorToDelete.firstName} {instructorToDelete.lastName}?
                        </p>
                        <div className="flex justify-center space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setInstructorToDelete(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(instructorToDelete.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Delete Instructor
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRemovePreferenceModal && preferenceToRemove && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-center bg-red-100 h-12 w-12 rounded-full mx-auto mb-4">
                            <BiX className="text-red-600 text-xl" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Remove Time Preference</h3>
                        <p className="text-sm text-gray-600 text-center mb-6">
                            Are you sure you want to remove the {preferenceToRemove.day} {preferenceToRemove.time} preference for{" "}
                            {getInstructorName(preferenceToRemove.instructorId)}?
                        </p>
                        <div className="flex justify-center space-x-3">
                            <button
                                onClick={() => {
                                    setShowRemovePreferenceModal(false);
                                    setPreferenceToRemove(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRemovePreference}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Instructor;