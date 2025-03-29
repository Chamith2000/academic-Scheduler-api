import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Edit, Trash2, Search, AlertCircle } from 'lucide-react';
import useAuth from "../hooks/useAuth";
import DashboardLayout from "../Layout/DashboardLayout";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Programme = () => {
    const [programmes, setProgrammes] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [programmeCode, setProgrammeCode] = useState('');
    const [programmeName, setProgrammeName] = useState('');
    const [selectedFacultyName, setSelectedFacultyName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [currentProgrammeId, setCurrentProgrammeId] = useState(null);
    const [filterQuery, setFilterQuery] = useState('');
    const [showModal, setShowModal] = useState(false);

    const { auth } = useAuth();

    // Fetch all programmes
    const fetchProgrammes = () => {
        setLoading(true);
        axios
            .get('http://localhost:8080/api/programs', {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then(response => {
                setProgrammes(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error(`Error: ${error}`);
                toast.error('Failed to load programmes');
                setLoading(false);
            });
    };

    // Fetch all faculties
    const fetchFaculties = () => {
        axios
            .get('http://localhost:8080/api/faculties', {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then(response => {
                setFaculties(response.data);
                if (response.data.length > 0) {
                    setSelectedFacultyName(response.data[0].facultyName);
                }
            })
            .catch(error => {
                console.error(`Error: ${error}`);
                toast.error('Failed to load faculties');
            });
    };

    // Add or update a programme
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!programmeCode || !programmeName || !selectedFacultyName) {
            toast.error('Please fill in all fields');
            return;
        }

        const programmeData = {
            programmeCode,
            programmeName,
            facultyName: selectedFacultyName,
        };

        setLoading(true);

        if (editMode && currentProgrammeId) {
            // Update existing programme
            axios
                .put(`http://localhost:8080/api/programs/${currentProgrammeId}`, programmeData, {
                    headers: {
                        Authorization: `Bearer ${auth.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                .then(() => {
                    toast.success('Programme updated successfully');
                    resetForm();
                    fetchProgrammes();
                    toggleModal();
                })
                .catch(error => {
                    console.error(`Error: ${error}`);
                    toast.error('Failed to update programme');
                    setLoading(false);
                });
        } else {
            // Add new programme
            axios
                .post('http://localhost:8080/api/programs', programmeData, {
                    headers: {
                        Authorization: `Bearer ${auth.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                .then(() => {
                    toast.success('Programme added successfully');
                    resetForm();
                    fetchProgrammes();
                    toggleModal();
                })
                .catch(error => {
                    console.error(`Error: ${error}`);
                    toast.error('Failed to add programme');
                    setLoading(false);
                });
        }
    };

    // Reset form fields
    const resetForm = () => {
        setProgrammeCode('');
        setProgrammeName('');
        setSelectedFacultyName(faculties.length > 0 ? faculties[0].facultyName : '');
        setEditMode(false);
        setCurrentProgrammeId(null);
    };

    // Toggle modal visibility
    const toggleModal = () => {
        setShowModal(!showModal);
        if (!showModal) {
            resetForm();
        }
    };

    // Handle edit programme
    const handleEdit = (programme) => {
        setProgrammeCode(programme.programmeCode);
        setProgrammeName(programme.programmeName);
        setSelectedFacultyName(programme.facultyName);
        setEditMode(true);
        setCurrentProgrammeId(programme.id);
        setShowModal(true);
    };

    // Handle delete programme
    const handleDelete = (programmeId) => {
        axios
            .delete(`http://localhost:8080/api/programs/${programmeId}`, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then(() => {
                toast.success('Programme deleted successfully');
                fetchProgrammes();
            })
            .catch(error => {
                console.error(`Error: ${error}`);
                toast.error('Failed to delete programme');
            });
    };

    // Filter programmes based on search query
    const filteredProgrammes = programmes.filter(programme => {
        return (
            programme.programmeCode.toLowerCase().includes(filterQuery.toLowerCase()) ||
            programme.programmeName.toLowerCase().includes(filterQuery.toLowerCase()) ||
            programme.facultyName.toLowerCase().includes(filterQuery.toLowerCase())
        );
    });

    useEffect(() => {
        fetchProgrammes();
        fetchFaculties();
    }, []);

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Programme Management</h1>

                    <button
                        onClick={toggleModal}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                    >
                        <PlusCircle size={20}/>
                        <span>Add Programme</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-gray-500 text-sm font-medium">Total Programmes</h3>
                                <p className="text-3xl font-bold text-gray-800">{programmes.length}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-gray-500 text-sm font-medium">Total Faculties</h3>
                                <p className="text-3xl font-bold text-gray-800">{faculties.length}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-gray-500 text-sm font-medium">Faculty Coverage</h3>
                                <p className="text-3xl font-bold text-gray-800">
                                    {faculties.length > 0 ? Math.round((programmes.length / faculties.length) * 10) / 10 : 0}
                                    <span className="text-sm ml-1">avg</span>
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Programme List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Programme List</h2>
                            <div className="flex space-x-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="     Search programmes..."
                                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={filterQuery}
                                        onChange={(e) => setFilterQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={toggleModal}
                                    className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    <PlusCircle size={18} />
                                    <span>Add Programme</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div
                                className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading programmes...</p>
                        </div>
                    ) : filteredProgrammes.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    {['Code', 'Programme Name', 'Faculty', 'Actions'].map((header, i) => (
                                        <th key={i}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProgrammes.map((programme, index) => (
                                    <tr key={programme.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{programme.programmeCode}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{programme.programmeName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{programme.facultyName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-2">
                                            <button
                                                onClick={() => handleEdit(programme)}
                                                className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-100 rounded-full transition-colors"
                                            >
                                                <Edit size={18}/>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to delete the programme ${programme.programmeName}? This action cannot be undone.`)) {
                                                        handleDelete(programme.id);
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-100 rounded-full transition-colors"
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div
                                className="rounded-full bg-gray-100 p-4 w-16 h-16 mx-auto flex items-center justify-center mb-4">
                                <AlertCircle size={24} className="text-gray-500"/>
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">No programmes found</h3>
                            <p className="text-gray-600">
                                Try adjusting your search or add a new programme
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Programme Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editMode ? 'Edit Programme' : 'Add New Programme'}
                            </h3>
                            <button
                                onClick={toggleModal}
                                className="text-gray-500 hover:text-gray-800"
                            >
                                <span className="text-2xl">✕</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Programme Code
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    value={programmeCode}
                                    onChange={(e) => setProgrammeCode(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Programme Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    value={programmeName}
                                    onChange={(e) => setProgrammeName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Faculty
                                </label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    value={selectedFacultyName}
                                    onChange={(e) => setSelectedFacultyName(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select Faculty</option>
                                    {faculties.map(faculty => (
                                        <option key={faculty.id} value={faculty.facultyName}>
                                            {faculty.facultyName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={toggleModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {editMode ? 'Update Programme' : 'Add Programme'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast Container */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </DashboardLayout>
    );
};

export default Programme;