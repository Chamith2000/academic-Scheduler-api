import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Edit, Trash2, Search, AlertCircle, CheckCircle } from 'lucide-react';
import DashboardLayout from '../Layout/DashboardLayout'; // Adjust path as needed
import useAuth from "../hooks/useAuth";

// Validation utility functions
const validateDepartmentCode = (code) => {
    // Department code should be alphanumeric and between 2-10 characters
    const codeRegex = /^[A-Z0-9]{2,10}$/;
    return {
        isValid: codeRegex.test(code),
        message: 'Department code must be 2-10 uppercase alphanumeric characters'
    };
};

const validateDepartmentName = (name) => {
    // Department name should be 3-100 characters, allow spaces and some special characters
    const nameRegex = /^[A-Za-z0-9\s&().-]{3,100}$/;
    return {
        isValid: nameRegex.test(name),
        message: 'Department name must be 3-100 characters, allowing letters, numbers, spaces, and some special characters'
    };
};

const validateFacultySelection = (facultyName, faculties) => {
    return {
        isValid: faculties.some(faculty => faculty.facultyName === facultyName),
        message: 'Please select a valid faculty'
    };
};

const Department = () => {
    const [departments, setDepartments] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [deptCode, setDeptCode] = useState('');
    const [deptName, setDeptName] = useState('');
    const [selectedFacultyName, setSelectedFacultyName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingDeptId, setEditingDeptId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState({
        deptCode: '',
        deptName: '',
        facultyName: ''
    });
    const { auth } = useAuth();

    // Fetch all departments
    const fetchDepartments = () => {
        setLoading(true);
        axios.get('http://localhost:8080/api/departments', {
            headers: {
                Authorization: `Bearer ${auth.accessToken}`,
            },
        })
            .then(response => {
                setDepartments(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error(`Error: ${error}`);
                setError('Failed to load departments');
                setLoading(false);
            });
    };

    // Fetch all faculties
    const fetchFaculties = () => {
        axios.get('http://localhost:8080/api/faculties', {
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
                setError('Failed to load faculties');
            });
    };

    // Validation form method
    const validateForm = () => {
        const errors = {
            deptCode: '',
            deptName: '',
            facultyName: ''
        };

        // Validate department code
        const codeValidation = validateDepartmentCode(deptCode);
        if (!codeValidation.isValid) {
            errors.deptCode = codeValidation.message;
        }

        // Validate department name
        const nameValidation = validateDepartmentName(deptName);
        if (!nameValidation.isValid) {
            errors.deptName = nameValidation.message;
        }

        // Validate faculty selection
        const facultyValidation = validateFacultySelection(selectedFacultyName, faculties);
        if (!facultyValidation.isValid) {
            errors.facultyName = facultyValidation.message;
        }

        setValidationErrors(errors);
        return Object.values(errors).every(error => error === '');
    };

    // Add a new department
    const addDepartment = (e) => {
        e.preventDefault();

        // Perform validation before submission
        if (!validateForm()) {
            showToast('Please correct the errors in the form', 'error');
            return;
        }

        const newDepartment = {
            deptCode: deptCode,
            deptName: deptName,
            facultyName: selectedFacultyName
        };

        axios.post('http://localhost:8080/api/departments', newDepartment, {
            headers: {
                Authorization: `Bearer ${auth.accessToken}`,
                'Content-Type': 'application/json'
            },
        })
            .then(response => {
                showToast('Department added successfully!', 'success');
                resetForm();
                toggleModal();
                fetchDepartments();
            })
            .catch(error => {
                console.error(`Error: ${error}`);
                showToast(error.response?.data?.message || 'Failed to add department', 'error');
            });
    };

    // Update an existing department
    const updateDepartment = (e) => {
        e.preventDefault();

        // Perform validation before submission
        if (!validateForm()) {
            showToast('Please correct the errors in the form', 'error');
            return;
        }

        const updatedDepartment = {
            id: editingDeptId,
            deptCode: deptCode,
            deptName: deptName,
            facultyName: selectedFacultyName
        };

        axios.put(`http://localhost:8080/api/departments/${editingDeptId}`, updatedDepartment, {
            headers: {
                Authorization: `Bearer ${auth.accessToken}`,
                'Content-Type': 'application/json'
            },
        })
            .then(response => {
                showToast('Department updated successfully!', 'success');
                resetForm();
                toggleModal();
                fetchDepartments();
            })
            .catch(error => {
                console.error(`Error: ${error}`);
                showToast(error.response?.data?.message || 'Failed to update department', 'error');
            });
    };

    // Delete a department
    const deleteDepartment = (id) => {
        axios.delete(`http://localhost:8080/api/departments/${id}`, {
            headers: {
                Authorization: `Bearer ${auth.accessToken}`,
            },
        })
            .then(response => {
                showToast('Department deleted successfully!', 'success');
                fetchDepartments();
            })
            .catch(error => {
                console.error(`Error: ${error}`);
                showToast('Failed to delete department', 'error');
            });
    };

    // Reset form fields
    const resetForm = () => {
        setDeptCode('');
        setDeptName('');
        setSelectedFacultyName(faculties.length > 0 ? faculties[0].facultyName : '');
        setEditingDeptId(null);
        setValidationErrors({
            deptCode: '',
            deptName: '',
            facultyName: ''
        });
    };

    // Toggle modal visibility
    const toggleModal = () => {
        setShowModal(!showModal);
        if (!showModal) {
            resetForm();
        }
    };

    // Handle edit button click
    const handleEdit = (dept) => {
        setEditingDeptId(dept.id);
        setDeptCode(dept.deptCode);
        setDeptName(dept.deptName);
        setSelectedFacultyName(dept.facultyName);
        setShowModal(true);
    };

    // Show toast notification
    const showToast = (message, type = 'info') => {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white flex items-center space-x-2`;
        const icon = document.createElement('span');
        icon.innerHTML = type === 'success'
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
        const textSpan = document.createElement('span');
        textSpan.textContent = message;
        toast.appendChild(icon);
        toast.appendChild(textSpan);
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 500);
        }, 3000);
    };

    // Filter departments based on search term
    const filteredDepartments = departments.filter(dept =>
        dept.deptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.deptCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.facultyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchDepartments();
        fetchFaculties();
    }, []);

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Department Management</h1>
                    <button
                        onClick={toggleModal}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                    >
                        <PlusCircle size={20} />
                        <span>Add Department</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Departments</p>
                                <h2 className="text-3xl font-bold text-gray-800">{departments.length}</h2>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Faculties</p>
                                <h2 className="text-3xl font-bold text-gray-800">{faculties.length}</h2>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Faculty Coverage</p>
                                <h2 className="text-3xl font-bold text-gray-800">
                                    {faculties.length > 0 ? Math.round((departments.length / faculties.length) * 10) / 10 : 0}
                                    <span className="text-base font-normal text-gray-500 ml-1">avg</span>
                                </h2>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Department List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Department List</h2>
                    </div>

                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="     Search departments..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading departments...</p>
                        </div>
                    ) : filteredDepartments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    {['Code', 'Department Name', 'Faculty', 'Actions'].map((header, i) => (
                                        <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDepartments.map((dept, index) => (
                                    <tr key={dept.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.deptCode}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{dept.deptName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{dept.facultyName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-2">
                                            <button
                                                onClick={() => handleEdit(dept)}
                                                className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-100 rounded-full transition-colors"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => document.getElementById(`delete-modal-${dept.id}`).showModal()}
                                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-100 rounded-full transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                            {/* Delete confirmation modal */}
                                            <dialog id={`delete-modal-${dept.id}`} className="modal bg-transparent p-0 rounded-lg shadow-lg backdrop:bg-gray-900 backdrop:bg-opacity-50">
                                                <div className="bg-white p-6 rounded-lg max-w-md w-full">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
                                                    <p className="text-gray-600 mb-6">
                                                        Are you sure you want to delete the department {dept.deptName}? This action cannot be undone.
                                                    </p>
                                                    <div className="flex justify-end space-x-4">
                                                        <button
                                                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                                            onClick={() => document.getElementById(`delete-modal-${dept.id}`).close()}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                            onClick={() => {
                                                                deleteDepartment(dept.id);
                                                                document.getElementById(`delete-modal-${dept.id}`).close();
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </dialog>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="rounded-full bg-gray-100 p-4 w-16 h-16 mx-auto flex items-center justify-center mb-4">
                                <AlertCircle size={24} className="text-gray-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">No departments found</h3>
                            <p className="text-gray-600">
                                Try adjusting your search or add a new department
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Department Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingDeptId ? 'Edit Department' : 'Add New Department'}
                            </h3>
                            <button
                                onClick={toggleModal}
                                className="text-gray-500 hover:text-gray-800"
                            >
                                <span className="text-2xl">✕</span>
                            </button>
                        </div>

                        <form onSubmit={editingDeptId ? updateDepartment : addDepartment} className="p-6">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Department Code
                                </label>
                                <input
                                    type="text"
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                        validationErrors.deptCode
                                            ? 'border-red-500 focus:ring-red-400'
                                            : 'border-gray-300 focus:ring-blue-600'
                                    }`}
                                    value={deptCode}
                                    onChange={(e) => {
                                        setDeptCode(e.target.value.toUpperCase());
                                        setValidationErrors(prev => ({...prev, deptCode: ''}));
                                    }}
                                    required
                                />
                                {validationErrors.deptCode && (
                                    <p className="text-red-500 text-xs mt-1">{validationErrors.deptCode}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Department Name
                                </label>
                                <input
                                    type="text"
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                        validationErrors.deptName
                                            ? 'border-red-500 focus:ring-red-400'
                                            : 'border-gray-300 focus:ring-blue-600'
                                    }`}
                                    value={deptName}
                                    onChange={(e) => {
                                        setDeptName(e.target.value);
                                        setValidationErrors(prev => ({...prev, deptName: ''}));
                                    }}
                                    required
                                />
                                {validationErrors.deptName && (
                                    <p className="text-red-500 text-xs mt-1">{validationErrors.deptName}</p>
                                )}
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Faculty
                                </label>
                                <select
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                        validationErrors.facultyName
                                            ? 'border-red-500 focus:ring-red-400'
                                            : 'border-gray-300 focus:ring-blue-600'
                                    }`}
                                    value={selectedFacultyName}
                                    onChange={(e) => {
                                        setSelectedFacultyName(e.target.value);
                                        setValidationErrors(prev => ({...prev, facultyName: ''}));
                                    }}
                                    required
                                >
                                    <option value="" disabled>Select Faculty</option>
                                    {faculties.map(faculty => (
                                        <option key={faculty.id} value={faculty.facultyName}>
                                            {faculty.facultyName}
                                        </option>
                                    ))}
                                </select>
                                {validationErrors.facultyName && (
                                    <p className="text-red-500 text-xs mt-1">{validationErrors.facultyName}</p>
                                )}
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
                                    {editingDeptId ? 'Update Department' : 'Add Department'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Department;