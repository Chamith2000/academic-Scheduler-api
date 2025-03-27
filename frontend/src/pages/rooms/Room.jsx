import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../../Layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { PlusCircle, Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

const Room = () => {
    const [rooms, setRooms] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roomName, setRoomName] = useState("");
    const [roomCapacity, setRoomCapacity] = useState("");
    const [roomType, setRoomType] = useState("LT");
    const [isAvailable, setIsAvailable] = useState(true);
    const [selectedDeptName, setSelectedDeptName] = useState("");

    // New state for editing and search
    const [isEditing, setIsEditing] = useState(false);
    const [editingRoomId, setEditingRoomId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Validation states
    const [validations, setValidations] = useState({
        roomName: { isValid: true, message: "" },
        roomCapacity: { isValid: true, message: "" }
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

    // Filter rooms based on search term
    const filteredRooms = rooms.filter(room =>
        room.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.roomType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.deptName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const currentRooms = filteredRooms.slice(indexOfFirstRecord, indexOfLastRecord);
    const isFirstPage = currentPage === 1;
    const isLastPage = indexOfLastRecord >= filteredRooms.length;

    const { auth } = useAuth();
    const navigate = useNavigate();

    // Validation functions
    const validateRoomName = (name) => {
        if (!name) {
            return { isValid: false, message: "Room name is required" };
        }
        if (name.length < 3) {
            return { isValid: false, message: "Room name must be at least 3 characters" };
        }
        if (!/^[a-zA-Z0-9\s-]+$/.test(name)) {
            return { isValid: false, message: "Room name can only contain letters, numbers, spaces, and hyphens" };
        }
        return { isValid: true, message: "" };
    };

    const validateRoomCapacity = (capacity) => {
        if (!capacity) {
            return { isValid: false, message: "Room capacity is required" };
        }
        const capacityNum = parseInt(capacity);
        if (isNaN(capacityNum)) {
            return { isValid: false, message: "Capacity must be a number" };
        }
        if (capacityNum < 20) {
            return { isValid: false, message: "Capacity must be at least 20" };
        }
        if (capacityNum > 1000) {
            return { isValid: false, message: "Capacity cannot exceed 1000" };
        }
        return { isValid: true, message: "" };
    };

    // Validation handlers
    const handleRoomNameChange = (e) => {
        const value = e.target.value;
        setRoomName(value);
        setValidations(prev => ({
            ...prev,
            roomName: validateRoomName(value)
        }));
    };

    const handleRoomCapacityChange = (e) => {
        const value = e.target.value;
        setRoomCapacity(value);
        setValidations(prev => ({
            ...prev,
            roomCapacity: validateRoomCapacity(value)
        }));
    };

    // Form validation before submission
    const validateForm = () => {
        const roomNameValidation = validateRoomName(roomName);
        const roomCapacityValidation = validateRoomCapacity(roomCapacity);

        setValidations({
            roomName: roomNameValidation,
            roomCapacity: roomCapacityValidation
        });

        return roomNameValidation.isValid && roomCapacityValidation.isValid;
    };

    function handleNextPage() {
        setCurrentPage((prev) => prev + 1);
    }

    function handlePreviousPage() {
        if (!isFirstPage) {
            setCurrentPage((prev) => prev - 1);
        }
    }

    const fetchRooms = () => {
        setIsLoading(true);
        axios
            .get("http://localhost:8080/api/rooms", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                setRooms(response.data);
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
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                setDepartments(response.data);
                if (response.data.length > 0) {
                    setSelectedDeptName(response.data[0].deptName);
                }
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
            });
    };

    const resetForm = () => {
        setRoomName("");
        setRoomCapacity("");
        setRoomType("LT");
        setIsAvailable(true);
        setSelectedDeptName(departments.length > 0 ? departments[0].deptName : "");
        setIsEditing(false);
        setEditingRoomId(null);
        // Reset validations
        setValidations({
            roomName: { isValid: true, message: "" },
            roomCapacity: { isValid: true, message: "" }
        });
    };

    const addRoom = (e) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        const newRoom = {
            roomName,
            roomCapacity,
            roomType,
            available: isAvailable,
            deptName: selectedDeptName,
        };

        axios
            .post("http://localhost:8080/api/rooms", newRoom, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                showToast("Room added successfully!", "success");
                fetchRooms();
                resetForm();
                setShowModal(false);
            })
            .catch((error) => {
                showToast("Failed to add room", "error");
                console.error(`Error: ${error}`);
            });
    };

    const updateRoom = (e) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        const updatedRoom = {
            id: editingRoomId,
            roomName,
            roomCapacity,
            roomType,
            available: isAvailable,
            deptName: selectedDeptName,
        };

        axios
            .put(`http://localhost:8080/api/rooms/${editingRoomId}`, updatedRoom, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                showToast("Room updated successfully!", "success");
                fetchRooms();
                resetForm();
                setShowModal(false);
            })
            .catch((error) => {
                showToast("Failed to update room", "error");
                console.error(`Error: ${error}`);
            });
    };

    const handleDelete = (id) => {
        axios
            .delete(`http://localhost:8080/api/rooms/${id}`, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then(() => {
                showToast("Room deleted successfully!", "success");
                fetchRooms();
            })
            .catch((error) => {
                showToast("Failed to delete room", "error");
                console.error(`Error: ${error}`);
            });
    };

    const handleEdit = (room) => {
        setIsEditing(true);
        setEditingRoomId(room.id);
        setRoomName(room.roomName);
        setRoomCapacity(room.roomCapacity);
        setRoomType(room.roomType);
        setIsAvailable(room.available);
        setSelectedDeptName(room.deptName);
        setShowModal(true);

        // Reset validations when editing
        setValidations({
            roomName: validateRoomName(room.roomName),
            roomCapacity: validateRoomCapacity(room.roomCapacity)
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
            setTimeout(() => document.body.removeChild(toast), 500);
        }, 3000);
    };

    useEffect(() => {
        fetchRooms();
        fetchDepartments();
    }, []);

    return (
        <DashboardLayout>
            <main className="p-6 bg-gray-50 min-h-screen">
                <h1 className="font-bold text-3xl mb-6">Room Management</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-gray-500 text-sm font-medium">Total Rooms</h3>
                                <p className="text-3xl font-bold text-gray-800">{rooms.length}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-gray-500 text-sm font-medium">Total Room Types</h3>
                                <p className="text-3xl font-bold text-gray-800">
                                    {new Set(rooms.map(room => room.roomType)).size}
                                </p>
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
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">Room List</h2>
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="      Search rooms..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="absolute left-3 top-2.5">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowModal(true); setIsEditing(false); resetForm(); }}
                                className="btn gap-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 border-0"
                            >
                                <PlusCircle size={16} />
                                Add Room
                            </button>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <>
                            {currentRooms.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <p className="text-xl">No rooms found</p>
                                    <p className="text-sm mt-2">Try adjusting your search or add a new room</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 rounded-l-lg">Room</th>
                                            <th scope="col" className="px-6 py-3">Capacity</th>
                                            <th scope="col" className="px-6 py-3">Type</th>
                                            <th scope="col" className="px-6 py-3">Department</th>
                                            <th scope="col" className="px-6 py-3">Availability</th>
                                            <th scope="col" className="px-6 py-3 rounded-r-lg text-center">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {currentRooms.map((room, index) => (
                                            <tr key={room.id || index} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                <td className="px-6 py-4 font-medium">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-900">{room.roomName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{room.roomCapacity}</td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                        {room.roomType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                        {room.deptName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                                                        room.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {room.available ? 'Available' : 'Unavailable'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(room)}
                                                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-100 rounded-full transition-colors"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <label
                                                            htmlFor={`delete-modal-${room.id}`}
                                                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-100 rounded-full transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 size={16} />
                                                        </label>
                                                        <input type="checkbox" id={`delete-modal-${room.id}`} className="modal-toggle" />
                                                        <div className="modal">
                                                            <div className="modal-box bg-white">
                                                                <h3 className="font-bold text-lg text-gray-900">Confirm Delete</h3>
                                                                <p className="py-4 text-gray-600">
                                                                    Are you sure you want to delete the room <strong>{room.roomName}</strong>? This action cannot be undone.
                                                                </p>
                                                                <div className="modal-action">
                                                                    <label htmlFor={`delete-modal-${room.id}`} className="btn btn-outline">Cancel</label>
                                                                    <label
                                                                        htmlFor={`delete-modal-${room.id}`}
                                                                        className="btn bg-red-600 hover:bg-red-700 text-white border-0"
                                                                        onClick={() => handleDelete(room.id)}
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
                                    Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredRooms.length)} of {filteredRooms.length} entries
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

                {/* Add/Edit Room Modal */}
                {showModal && (
                    <div className="modal modal-open">
                        <div className="modal-box max-w-3xl bg-white">
                            <div className="flex justify-between items-center border-b pb-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {isEditing ? "Edit Room" : "Add New Room"}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="btn btn-sm btn-circle btn-ghost"
                                >
                                    ✕
                                </button>
                            </div>
                            <form className="mt-4" onSubmit={isEditing ? updateRoom : addRoom}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-gray-700 font-medium">Room Name</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Room 101"
                                            className={`input input-bordered w-full focus:outline-none focus:ring-2 ${
                                                validations.roomName.isValid
                                                    ? 'focus:ring-blue-500'
                                                    : 'border-red-500 focus:ring-red-500'
                                            }`}
                                            value={roomName}
                                            onChange={handleRoomNameChange}
                                            required
                                        />
                                        {!validations.roomName.isValid && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {validations.roomName.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-gray-700 font-medium">Room Capacity</span>
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Capacity"
                                            className={`input input-bordered w-full focus:outline-none focus:ring-2 ${
                                                validations.roomCapacity.isValid
                                                    ? 'focus:ring-blue-500'
                                                    : 'border-red-500 focus:ring-red-500'
                                            }`}
                                            value={roomCapacity}
                                            onChange={handleRoomCapacityChange}
                                            required
                                        />
                                        {!validations.roomCapacity.isValid && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {validations.roomCapacity.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-gray-700 font-medium">Room Type</span>
                                        </label>
                                        <select
                                            className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={roomType}
                                            onChange={(e) => setRoomType(e.target.value)}
                                        >
                                            <option value="LT">LT</option>
                                            <option value="SLT">SLT</option>
                                            <option value="LAB">LAB</option>
                                            <option value="HALL">HALL</option>
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
                                    <div className="form-control col-span-1 md:col-span-2 flex items-center justify-between">
                                        <label className="label">
                                            <span className="label-text text-gray-700 font-medium">Room Availability</span>
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            <span>Available</span>
                                            <input
                                                type="checkbox"
                                                checked={isAvailable}
                                                onChange={(e) => setIsAvailable(e.target.checked)}
                                                className="toggle toggle-success"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-md"
                                    >
                                        {isEditing ? "Update Room" : "Add Room"}
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

export default Room;