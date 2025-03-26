import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../Layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { PlusCircle, Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

const Faculty = () => {
    const [faculties, setFaculties] = useState([]);
    const [facultyName, setFacultyName] = useState("");
    const [facultyCode, setFacultyCode] = useState("");
    const [editingFacultyId, setEditingFacultyId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { auth } = useAuth();
    const navigate = useNavigate();

    // pagination for the table
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

    // Filter faculties based on search term
    const filteredFaculties = faculties.filter(faculty =>
        faculty.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.facultyCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentFaculties = filteredFaculties.slice(indexOfFirstRecord, indexOfLastRecord);
    const isFirstPage = currentPage === 1;
    const isLastPage = indexOfLastRecord >= filteredFaculties.length;

    function handleNextPage() {
        setCurrentPage((prev) => prev + 1);
    }

    function handlePreviousPage() {
        if (!isFirstPage) {
            setCurrentPage((prev) => prev - 1);
        }
    }

    function handleEdit(id) {
        setEditingFacultyId(id);
        setShowModal(true);
        // Find the faculty being edited
        const facultyToEdit = faculties.find(faculty => faculty.id === id);
        if (facultyToEdit) {
            setFacultyCode(facultyToEdit.facultyCode);
            setFacultyName(facultyToEdit.facultyName);
        }
    }

    const toggleModal = () => {
        setShowModal(!showModal);
        if (!showModal) {
            // Reset form when opening modal for a new entry
            resetForm();
        }
    };

    // Fetch all faculties
    const fetchFaculties = () => {
        setIsLoading(true);
        axios
            .get("http://localhost:8080/api/faculties", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                setFaculties(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
                setIsLoading(false);
                showToast("Failed to fetch faculties", "error");
            });
    };

    // Reset form fields
    const resetForm = () => {
        setFacultyCode("");
        setFacultyName("");
        setEditingFacultyId(null);
    };

    // Add a new faculty
    const addFaculty = (e) => {
        e.preventDefault();
        const newFaculty = {
            facultyCode: facultyCode,
            facultyName: facultyName,
        };

        axios
            .post("http://localhost:8080/api/faculties", newFaculty, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                showToast("Faculty added successfully!", "success");
                toggleModal();
                fetchFaculties();
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
                showToast("Failed to add faculty.", "error");
            });
    };

    // Update an existing faculty
    const updateFaculty = (e) => {
        e.preventDefault();
        const updatedFaculty = {
            facultyCode: facultyCode,
            facultyName: facultyName,
        };

        axios
            .put(`http://localhost:8080/api/faculties/${editingFacultyId}`, updatedFaculty, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then(() => {
                showToast("Faculty updated successfully!", "success");
                toggleModal();
                fetchFaculties();
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
                showToast("Failed to update faculty.", "error");
            });
    };

    const handleDelete = (id) => {
        // Optional: Add a confirmation before API call if not using modal
        const confirmDelete = window.confirm("Are you sure you want to delete this faculty?");

        if (!confirmDelete) return;

        axios
            .delete(`http://localhost:8080/api/faculties/${id}`, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                // Optional: Check response status
                if (response.status === 200) {
                    showToast("Faculty deleted successfully!", "success");
                    // Immediately remove the faculty from local state to improve UX
                    setFaculties(prevFaculties =>
                        prevFaculties.filter(faculty => faculty.id !== id)
                    );
                    // Optional: Recalculate pagination if needed
                    if (currentFaculties.length === 1 && currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                    }
                }
            })
            .catch((error) => {
                console.error(`Error deleting faculty: ${error}`);
                showToast(
                    error.response?.data?.message || "Failed to delete faculty.",
                    "error"
                );
            });
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
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 500);
        }, 3000);
    };

    useEffect(() => {
        fetchFaculties();
    }, []);

    return (
        <DashboardLayout>
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-6">Faculty Management</h1>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold mb-2">Total Faculties</h2>
                        <p className="text-3xl font-bold text-blue-600">{faculties.length}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Faculty List</h2>
                        <div className="flex space-x-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="     Search faculties..."
                                    className="pl-10 pr-4 py-2 border rounded-lg"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={toggleModal}
                                className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                <PlusCircle size={18} />
                                <span>Add Faculty</span>
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <>
                            {currentFaculties.length === 0 ? (
                                <div className="text-center py-8">
                                    <h3 className="text-lg font-medium text-gray-500 mb-2">No faculties found</h3>
                                    <p className="text-gray-400">Try adjusting your search or add a new faculty</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Faculty Code</th>
                                            <th className="px-4 py-2 text-left">Faculty Name</th>
                                            <th className="px-4 py-2 text-center">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                        {currentFaculties.map((faculty, index) => (
                                            <tr key={faculty.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                <td className="px-4 py-3">{faculty.facultyCode}</td>
                                                <td className="px-4 py-3">{faculty.facultyName}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex justify-center space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(faculty.id)}
                                                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-100 rounded-full transition-colors"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const modal = document.getElementById(`delete-modal-${faculty.id}`);
                                                                if (modal) modal.showModal();
                                                            }}
                                                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-100 rounded-full transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>

                                                    {/* Delete confirmation modal */}
                                                    <dialog id={`delete-modal-${faculty.id}`} className="modal">
                                                        <div className="modal-box">
                                                            <h3 className="font-bold text-lg">Confirm Delete</h3>
                                                            <p className="py-4">
                                                                Are you sure you want to delete the faculty {faculty.facultyName}? This action cannot be undone.
                                                            </p>
                                                            <div className="modal-action">
                                                                <form method="dialog">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline mr-2"
                                                                        onClick={() => {
                                                                            const modal = document.getElementById(`delete-modal-${faculty.id}`);
                                                                            if (modal) modal.close();
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-error"
                                                                        onClick={() => {
                                                                            handleDelete(faculty.id);
                                                                            const modal = document.getElementById(`delete-modal-${faculty.id}`);
                                                                            if (modal) modal.close();
                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </form>
                                                            </div>
                                                        </div>
                                                    </dialog>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-4">
                                <div className="text-sm text-gray-500">
                                    Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredFaculties.length)} of {filteredFaculties.length} entries
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handlePreviousPage}
                                        disabled={isFirstPage}
                                        className={`flex items-center space-x-1 px-3 py-1 rounded ${
                                            isFirstPage ? "bg-gray-100 text-gray-400" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                        }`}
                                    >
                                        <ChevronLeft size={16} />
                                        <span>Previous</span>
                                    </button>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={isLastPage}
                                        className={`flex items-center space-x-1 px-3 py-1 rounded ${
                                            isLastPage ? "bg-gray-100 text-gray-400" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                        }`}
                                    >
                                        <span>Next</span>
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Fixed Faculty Modal - Used for both Add and Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="font-bold text-lg">{editingFacultyId ? "Edit Faculty" : "Add New Faculty"}</h3>
                            <button onClick={toggleModal} className="text-gray-500 hover:text-gray-700">
                                ✕
                            </button>
                        </div>
                        <form onSubmit={editingFacultyId ? updateFaculty : addFaculty} className="p-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Code</label>
                                    <input
                                        type="text"
                                        placeholder="Enter faculty code"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={facultyCode}
                                        onChange={(e) => setFacultyCode(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter faculty name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={facultyName}
                                        onChange={(e) => setFacultyName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={toggleModal}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {editingFacultyId ? "Update Faculty" : "Add Faculty"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Original dialog element kept for compatibility */}
            <dialog id="faculty-modal" className={`modal ${showModal ? "modal-open" : ""}`} style={{ display: "none" }}>
                {/* This is hidden but kept for compatibility */}
            </dialog>
        </DashboardLayout>
    );
};

export default Faculty;