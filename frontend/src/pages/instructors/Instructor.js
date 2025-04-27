import React, { useState, useEffect, useCallback } from "react";
import "./instructor.css";
import axios from "axios";
import DashboardLayout from "../../Layout/DashboardLayout";
import { BiTrash, BiEdit, BiPlus, BiBuilding, BiTimeFive, BiSearch } from "react-icons/bi";
import { FaChalkboardTeacher } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Instructor = () => {
    const [instructors, setInstructors] = useState([]);
    const [filteredInstructors, setFilteredInstructors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [selectedDeptName, setSelectedDeptName] = useState("");
    const [allPreferences, setAllPreferences] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [instructorToDelete, setInstructorToDelete] = useState(null);
    const [instructorToEdit, setInstructorToEdit] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { auth } = useAuth();

    // Form validation errors
    const [formErrors, setFormErrors] = useState({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        email: "",
        department: "",
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredInstructors.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredInstructors.length / recordsPerPage);
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    // Validation functions
    const validateFirstName = (value) => {
        if (value == null || value === "") return "First Name is required";
        const trimmedValue = value.trim();
        if (trimmedValue.length < 2) return "First Name must be at least 2 characters long";
        if (!/^[A-Za-z\s'-]+$/.test(trimmedValue)) return "First Name can only contain letters, spaces, hyphens, and apostrophes";
        return "";
    };

    const validateLastName = (value) => {
        if (value == null || value === "") return "Last Name is required";
        const trimmedValue = value.trim();
        if (trimmedValue.length < 2) return "Last Name must be at least 2 characters long";
        if (!/^[A-Za-z\s'-]+$/.test(trimmedValue)) return "Last Name can only contain letters, spaces, hyphens, and apostrophes";
        return "";
    };

    const validateUsername = (value) => {
        if (value == null || value === "") return "Username is required";
        const trimmedValue = value.trim();
        if (!trimmedValue) return "Username is required";
        if (trimmedValue.length < 4) return "Username must be at least 4 characters long";
        return "";
    };

    const validatePassword = (value, isEdit = false) => {
        if (!isEdit && (value == null || value === "")) return "Password is required";
        if (value && value.length < 6) return "Password must be at least 6 characters long";
        return "";
    };

    const validateEmail = (value) => {
        if (value == null || value === "") return "Email is required";
        const trimmedValue = value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) return "Invalid email format";
        return "";
    };

    const validateDepartment = (value) => {
        if (value == null || value === "") return "Department is required";
        return "";
    };

    // Change handlers
    const handleFirstNameChange = (e) => {
        const value = e.target.value;
        setFirstName(value);
        setFormErrors((prev) => ({ ...prev, firstName: validateFirstName(value) }));
    };

    const handleLastNameChange = (e) => {
        const value = e.target.value;
        setLastName(value);
        setFormErrors((prev) => ({ ...prev, lastName: validateLastName(value) }));
    };

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        setUsername(value);
        setFormErrors((prev) => ({ ...prev, username: validateUsername(value) }));
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setFormErrors((prev) => ({ ...prev, password: validatePassword(value, showEditModal) }));
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setFormErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    };

    const handleDeptChange = (e) => {
        const value = e.target.value;
        setSelectedDeptName(value);
        setFormErrors((prev) => ({ ...prev, department: validateDepartment(value) }));
    };

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        setCurrentPage(1);
        const filtered = instructors.filter(
            (instructor) =>
                (instructor.firstName?.toLowerCase().includes(query) || "") ||
                (instructor.lastName?.toLowerCase().includes(query) || "") ||
                (instructor.deptName?.toLowerCase().includes(query) || "") ||
                (instructor.username?.toLowerCase().includes(query) || "") ||
                (instructor.email?.toLowerCase().includes(query) || "")
        );
        setFilteredInstructors(filtered);
    };

    const validateInstructorForm = (isEdit = false) => {
        const errors = {
            firstName: validateFirstName(firstName),
            lastName: validateLastName(lastName),
            username: validateUsername(username),
            password: validatePassword(password, isEdit),
            email: validateEmail(email),
            department: validateDepartment(selectedDeptName),
        };
        setFormErrors((prev) => ({ ...prev, ...errors }));
        return Object.values(errors).every((error) => !error);
    };

    const handleNextPage = () => {
        if (!isLastPage) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePreviousPage = () => {
        if (!isFirstPage) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const fetchInstructors = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/api/instructors", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            });
            console.log("Instructors data:", response.data); // Debug the response
            setInstructors(response.data);
            setFilteredInstructors(response.data);
        } catch (error) {
            console.error("Error fetching instructors:", error);
            toast.error(error.response?.data?.message || "Failed to fetch instructors");
        } finally {
            setIsLoading(false);
        }
    }, [auth.accessToken]);

    const fetchAllPreferences = useCallback(async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/instructors/preferences", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            });
            setAllPreferences(response.data);
        } catch (error) {
            console.error("Error fetching preferences:", error);
            toast.error(error.response?.data?.message || "Failed to fetch preferences");
        }
    }, [auth.accessToken]);

    const fetchDepartments = useCallback(async () => {
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
            console.error("Error fetching departments:", error);
            toast.error(error.response?.data?.message || "Failed to fetch departments");
        }
    }, [auth.accessToken, selectedDeptName]);

    const addInstructor = async () => {
        if (!validateInstructorForm()) {
            toast.error("Please fix all validation errors before submitting.");
            return;
        }

        const newInstructor = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            deptName: selectedDeptName,
            username: username.trim(),
            password: password.trim(),
            email: email.trim(),
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
            console.error("Error adding instructor:", error);
            toast.error(error.response?.data?.message || "Failed to add instructor");
        }
    };

    const editInstructor = async () => {
        if (!validateInstructorForm(true)) {
            toast.error("Please fix all validation errors before submitting.");
            return;
        }

        if (!instructorToEdit) return;

        const updatedInstructor = {
            id: instructorToEdit.id,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            deptName: selectedDeptName,
            username: username.trim(),
            password: password.trim() || undefined,
            email: email.trim(),
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
            toast.success("Instructor updated successfully!"); // Fixed typo and added semicolon
        } catch (error) {
            console.error("Error updating instructor:", error);
            toast.error(error.response?.data?.message || "Failed to update instructor");
        }
    };

    const resetForm = () => {
        setFirstName("");
        setLastName("");
        setUsername("");
        setPassword("");
        setEmail("");
        setSelectedDeptName(departments.length > 0 ? departments[0].deptName : "");
        setFormErrors({
            firstName: "",
            lastName: "",
            username: "",
            password: "",
            email: "",
            department: "",
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([fetchInstructors(), fetchDepartments(), fetchAllPreferences()]);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [fetchInstructors, fetchDepartments, fetchAllPreferences]);

    useEffect(() => {
        if (instructorToEdit) {
            const safeInstructor = {
                firstName: instructorToEdit.firstName || "",
                lastName: instructorToEdit.lastName || "",
                username: instructorToEdit.username || "",
                email: instructorToEdit.email || "",
                deptName: instructorToEdit.deptName || "",
            };

            setFirstName(safeInstructor.firstName);
            setLastName(safeInstructor.lastName);
            setUsername(safeInstructor.username);
            setEmail(safeInstructor.email);
            setPassword("");
            setSelectedDeptName(safeInstructor.deptName);
            setFormErrors({
                firstName: validateFirstName(safeInstructor.firstName),
                lastName: validateLastName(safeInstructor.lastName),
                username: validateUsername(safeInstructor.username),
                password: "",
                email: validateEmail(safeInstructor.email),
                department: validateDepartment(safeInstructor.deptName),
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
            console.error("Error deleting instructor:", error);
            toast.error(error.response?.data?.message || "Error deleting instructor. Please try again.");
        }
    };

    const getInstructorPreferences = (instructor) => {
        const instructorName = `${instructor.firstName} ${instructor.lastName}`;
        const instructorPrefs = allPreferences.find(
            (pref) => pref.instructorName === instructorName
        );
        return instructorPrefs ? instructorPrefs.preferences : [];
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
                            <div className="mb-4">
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={handleUsernameChange}
                                    className={`w-full px-4 py-2 border ${
                                        formErrors.username
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } rounded-md focus:outline-none focus:ring-2`}
                                    required
                                />
                                {formErrors.username && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className={`w-full px-4 py-2 border ${
                                        formErrors.password
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } rounded-md focus:outline-none focus:ring-2`}
                                    required
                                />
                                {formErrors.password && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    className={`w-full px-4 py-2 border ${
                                        formErrors.email
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } rounded-md focus:outline-none focus:ring-2`}
                                    required
                                />
                                {formErrors.email && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
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
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
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
                                <label
                                    htmlFor="editFirstName"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
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
                                <label
                                    htmlFor="editLastName"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
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
                            <div className="mb-4">
                                <label
                                    htmlFor="editUsername"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="editUsername"
                                    value={username}
                                    onChange={handleUsernameChange}
                                    className={`w-full px-4 py-2 border ${
                                        formErrors.username
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } rounded-md focus:outline-none focus:ring-2`}
                                    required
                                />
                                {formErrors.username && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="editPassword"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Password (Leave blank to keep unchanged)
                                </label>
                                <input
                                    type="password"
                                    id="editPassword"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className={`w-full px-4 py-2 border ${
                                        formErrors.password
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } rounded-md focus:outline-none focus:ring-2`}
                                />
                                {formErrors.password && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="editEmail"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="editEmail"
                                    value={email}
                                    onChange={handleEmailChange}
                                    className={`w-full px-4 py-2 border ${
                                        formErrors.email
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    } rounded-md focus:outline-none focus:ring-2`}
                                    required
                                />
                                {formErrors.email && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                                )}
                            </div>
                            <div className="mb-6">
                                <label
                                    htmlFor="editDepartment"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
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
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Save Changes
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
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    closeOnClick
                    pauseOnHover
                />
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Instructors Management</h1>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                        >
                            <BiPlus className="mr-2" /> Add Instructor
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

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">Existing Instructors</h2>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="    Search instructors..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                            <div className="text-sm text-gray-500">
                                Showing {indexOfFirstRecord + 1} to{" "}
                                {Math.min(indexOfLastRecord, filteredInstructors.length)} of{" "}
                                {filteredInstructors.length} entries
                            </div>
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
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            First Name
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Last Name
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Username
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Email
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Department
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Preferences
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {currentRecords.length > 0 ? (
                                        currentRecords.map((instructor, index) => {
                                            const preferences = getInstructorPreferences(instructor);
                                            return (
                                                <tr
                                                    key={instructor.id}
                                                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {instructor.firstName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {instructor.lastName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {instructor.username}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {instructor.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {instructor.deptName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex flex-wrap gap-1 max-w-md">
                                                            {preferences && preferences.length > 0 ? (
                                                                preferences.map((pref) => (
                                                                    <span
                                                                        key={pref.id}
                                                                        className={`px-2 py-1 rounded-full text-xs ${getTimeSlotColor(
                                                                            pref.day
                                                                        )}`}
                                                                        title={`${pref.day} ${pref.startTime}`}
                                                                    >
                                      {pref.day.slice(0, 3)} {pref.startTime}
                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-gray-400 italic">
                                    No preferences
                                  </span>
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
                                            <td
                                                colSpan="7"
                                                className="px-6 py-4 text-center text-sm text-gray-500"
                                            >
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
                                            isFirstPage
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={isLastPage}
                                        className={`px-4 py-2 rounded ${
                                            isLastPage
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {renderAddInstructorModal()}
                {renderEditInstructorModal()}

                {showDeleteModal && instructorToDelete && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                            <div className="flex items-center justify-center bg-red-100 h-12 w-12 rounded-full mx-auto mb-4">
                                <BiTrash className="text-red-600 text-xl" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                                Delete Instructor
                            </h3>
                            <p className="text-sm text-gray-600 text-center mb-6">
                                Warning: This will remove the instructor and set their courses to have no instructor.
                                Are you sure you want to delete {instructorToDelete.firstName}{" "}
                                {instructorToDelete.lastName}?
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
            </div>
        </DashboardLayout>
    );
};

export default Instructor;