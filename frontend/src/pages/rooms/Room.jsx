import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import DashboardLayout from "../../Layout/DashboardLayout";
import { PlusCircle, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";

const Room = () => {
    const [rooms, setRooms] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roomName, setRoomName] = useState("");
    const [roomCapacity, setRoomCapacity] = useState("");
    const [roomType, setRoomType] = useState("LT");
    const [isAvailable, setIsAvailable] = useState(true);
    const [selectedDeptName, setSelectedDeptName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const { auth } = useAuth();
    const navigate = useNavigate();

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
            .catch((error) => console.error(`Error: ${error}`));
    };

    const addRoom = () => {
        if (!roomName || !roomCapacity || !roomType || !selectedDeptName) {
            alert("Please fill all required fields");
            return;
        }

        const newRoom = {
            roomName: roomName,
            roomCapacity: roomCapacity,
            roomType: roomType,
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
                alert("Room added successfully!");
                resetForm();
                setIsAddModalOpen(false);
                fetchRooms();
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
                alert("Failed to add room. Please try again.");
            });
    };

    const resetForm = () => {
        setRoomName("");
        setRoomCapacity("");
        setRoomType("LT");
        setIsAvailable(true);
        if (departments.length > 0) {
            setSelectedDeptName(departments[0].deptName);
        } else {
            setSelectedDeptName("");
        }
    };

    useEffect(() => {
        fetchRooms();
        fetchDepartments();
    }, []);

    const filteredRooms = rooms.filter(room =>
        room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.roomType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.deptName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const roomTypeOptions = [
        { value: "LT", label: "Lecture Theatre" },
        { value: "SLT", label: "Small Lecture Theatre" },
        { value: "LAB", label: "Laboratory" },
        { value: "HALL", label: "Hall" }
    ];

    return (
        <DashboardLayout>
            <div className="px-6 py-8 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Room Management</h1>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                            <PlusCircle size={18} />
                            <span>Add New Room</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-700">All Rooms</h2>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search rooms..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center p-12">
                                <div className="loader"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredRooms.length > 0 ? (
                                        filteredRooms.map((room) => (
                                            <RoomRow
                                                key={room.id}
                                                room={room}
                                                departments={departments}
                                                auth={auth}
                                                onUpdate={fetchRooms}
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                {searchQuery ? "No rooms found matching your search." : "No rooms available. Add your first room!"}
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Room Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-modal">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Add New Room</h3>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); addRoom(); }}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                                        <input
                                            type="text"
                                            value={roomName}
                                            onChange={(e) => setRoomName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Enter room name"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                        <input
                                            type="number"
                                            value={roomCapacity}
                                            onChange={(e) => setRoomCapacity(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Enter capacity"
                                            min="1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                                        <select
                                            value={roomType}
                                            onChange={(e) => setRoomType(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        >
                                            {roomTypeOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label} ({option.value})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                        <select
                                            value={selectedDeptName}
                                            onChange={(e) => setSelectedDeptName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        >
                                            <option value="" disabled>Select department</option>
                                            {departments.map((department) => (
                                                <option key={department.id} value={department.deptName}>
                                                    {department.deptName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isAvailable}
                                                onChange={(e) => setIsAvailable(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                            <span className="ml-3 text-sm font-medium text-gray-700">Available</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Add Room
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

const RoomRow = ({ room, departments, auth, onUpdate }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [roomName, setRoomName] = useState(room.roomName);
    const [roomCapacity, setRoomCapacity] = useState(room.roomCapacity);
    const [roomType, setRoomType] = useState(room.roomType);
    const [isAvailable, setIsAvailable] = useState(room.available);
    const [selectedDeptName, setSelectedDeptName] = useState(room.deptName);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

    const handleRoomUpdate = () => {
        const updatedRoom = {
            id: room.id,
            roomName: roomName,
            roomCapacity: roomCapacity,
            roomType: roomType,
            available: isAvailable,
            deptName: selectedDeptName,
        };

        axios
            .put(`http://localhost:8080/api/rooms/${room.id}`, updatedRoom, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                alert("Room updated successfully!");
                setIsEditModalOpen(false);
                onUpdate();
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
                alert("Failed to update room. Please try again.");
            });
    };

    const deleteRoom = () => {
        axios
            .delete(`http://localhost:8080/api/rooms/${room.id}`, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then(() => {
                alert("Room deleted successfully!");
                setIsConfirmDeleteOpen(false);
                onUpdate();
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
                alert("Failed to delete room. Please try again.");
            });
    };

    const roomTypeOptions = [
        { value: "LT", label: "Lecture Theatre" },
        { value: "SLT", label: "Small Lecture Theatre" },
        { value: "LAB", label: "Laboratory" },
        { value: "HALL", label: "Hall" }
    ];

    const getRoomTypeLabel = (value) => {
        const option = roomTypeOptions.find(opt => opt.value === value);
        return option ? option.label : value;
    };

    return (
        <>
            <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {room.roomName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {room.roomCapacity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {getRoomTypeLabel(room.roomType)}
          </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {room.deptName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {room.available ? (
                        <span className="inline-flex items-center text-green-600">
              <CheckCircle size={16} className="mr-1" /> Available
            </span>
                    ) : (
                        <span className="inline-flex items-center text-red-600">
              <XCircle size={16} className="mr-1" /> Unavailable
            </span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                        <Pencil size={18} />
                    </button>
                    <button
                        onClick={() => setIsConfirmDeleteOpen(true)}
                        className="text-red-600 hover:text-red-900"
                    >
                        <Trash2 size={18} />
                    </button>
                </td>
            </tr>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-modal">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Edit Room</h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleRoomUpdate(); }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                                    <input
                                        type="text"
                                        value={roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                    <input
                                        type="number"
                                        value={roomCapacity}
                                        onChange={(e) => setRoomCapacity(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                                    <select
                                        value={roomType}
                                        onChange={(e) => setRoomType(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    >
                                        {roomTypeOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label} ({option.value})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <select
                                        value={selectedDeptName}
                                        onChange={(e) => setSelectedDeptName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    >
                                        {departments.map((department) => (
                                            <option key={department.id} value={department.deptName}>
                                                {department.deptName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isAvailable}
                                            onChange={(e) => setIsAvailable(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-700">Available</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Update Room
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            {isConfirmDeleteOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-modal">
                        <div className="text-center mb-4">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Delete Room</h3>
                            <p className="text-sm text-gray-500 mt-2">
                                Are you sure you want to delete the room "{room.roomName}"? This action cannot be undone.
                            </p>
                        </div>
                        <div className="mt-5 flex justify-center space-x-3">
                            <button
                                type="button"
                                onClick={() => setIsConfirmDeleteOpen(false)}
                                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={deleteRoom}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Add to your global CSS
const globalStyles = `
@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-modal {
  animation: modalIn 0.3s ease-out;
}

.loader {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

export default Room;