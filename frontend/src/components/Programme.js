import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Container, Card, Table, Alert, Badge, Spinner } from 'react-bootstrap';
import useAuth from "../hooks/useAuth";
import DashboardLayout from "../Layout/DashboardLayout";

const Programme = () => {
    const [programmes, setProgrammes] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [programmeCode, setProgrammeCode] = useState('');
    const [programmeName, setProgrammeName] = useState('');
    const [selectedFacultyName, setSelectedFacultyName] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [currentProgrammeId, setCurrentProgrammeId] = useState(null);
    const [filterQuery, setFilterQuery] = useState('');
    const [showForm, setShowForm] = useState(false);

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
                setError('Failed to load programmes');
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
                setError('Failed to load faculties');
            });
    };

    // Add or update a programme
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!programmeCode || !programmeName || !selectedFacultyName) {
            setError('Please fill in all fields');
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
                    setSuccess(true);
                    setError(null);
                    resetForm();
                    fetchProgrammes();
                    setTimeout(() => setSuccess(false), 3000);
                })
                .catch(error => {
                    console.error(`Error: ${error}`);
                    setError('Failed to update programme');
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
                    setSuccess(true);
                    setError(null);
                    resetForm();
                    fetchProgrammes();
                    setTimeout(() => setSuccess(false), 3000);
                    setShowForm(false); // Hide form after successful submission
                })
                .catch(error => {
                    console.error(`Error: ${error}`);
                    setError('Failed to add programme');
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

    // Handle edit programme
    const handleEdit = (programme) => {
        setProgrammeCode(programme.programmeCode);
        setProgrammeName(programme.programmeName);
        setSelectedFacultyName(programme.facultyName);
        setEditMode(true);
        setCurrentProgrammeId(programme.id);
        setShowForm(true); // Show form when editing

        // Scroll to form
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Handle cancel - reset form and hide it
    const handleCancel = () => {
        resetForm();
        setShowForm(false);
    };

    // Handle showing the add program form
    const handleShowAddForm = () => {
        resetForm();
        setShowForm(true);
    };

    // Handle delete programme
    const handleDelete = (programmeId) => {
        if (window.confirm('Are you sure you want to delete this programme?')) {
            setLoading(true);
            axios
                .delete(`http://localhost:8080/api/programs/${programmeId}`, {
                    headers: {
                        Authorization: `Bearer ${auth.accessToken}`,
                    },
                })
                .then(() => {
                    setSuccess(true);
                    setError(null);
                    fetchProgrammes();
                    setTimeout(() => setSuccess(false), 3000);
                })
                .catch(error => {
                    console.error(`Error: ${error}`);
                    setError('Failed to delete programme');
                    setLoading(false);
                });
        }
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

    // Custom Styles with a more minimalist and modern approach
    const styles = {
        pageContainer: {
            padding: '30px 20px',
            maxWidth: '1200px',
            margin: '0 auto',
        },
        pageTitle: {
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '24px',
            color: '#212529',
            paddingBottom: '12px',
            borderBottom: '2px solid #f0f0f0',
        },
        formCard: {
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
            marginBottom: '24px',
            border: 'none',
        },
        formCardHeader: {
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #eaeaea',
            padding: '16px 20px',
            fontWeight: '600',
            color: '#495057',
        },
        formCardBody: {
            padding: '24px 20px',
        },
        tableCard: {
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
            border: 'none',
        },
        tableCardHeader: {
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #eaeaea',
            padding: '16px 20px',
            fontWeight: '600',
            color: '#495057',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        filterInput: {
            maxWidth: '300px',
            borderRadius: '4px',
            fontSize: '14px',
        },
        formLabel: {
            fontWeight: '500',
            fontSize: '14px',
            marginBottom: '8px',
            color: '#495057',
        },
        formInput: {
            backgroundColor: '#f9fafb',
            borderColor: '#e2e8f0',
            borderRadius: '6px',
            padding: '10px 12px',
            fontSize: '14px',
        },
        formButtons: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
        },
        primaryButton: {
            backgroundColor: '#0d6efd',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 16px',
            fontWeight: '500',
            fontSize: '14px',
        },
        secondaryButton: {
            backgroundColor: '#6c757d',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 16px',
            fontWeight: '500',
            fontSize: '14px',
        },
        addButton: {
            backgroundColor: '#28a745',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 16px',
            fontWeight: '500',
            fontSize: '14px',
            marginBottom: '24px',
        },
        tableWrapper: {
            overflowX: 'auto',
        },
        table: {
            fontSize: '14px',
            marginBottom: '0',
        },
        tableHeader: {
            backgroundColor: '#f8f9fa',
            color: '#495057',
            fontSize: '13px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        tableRow: {
            borderTop: '1px solid #f0f0f0',
        },
        tableActions: {
            display: 'flex',
            gap: '8px',
        },
        editButton: {
            backgroundColor: '#3498db',
            borderColor: '#3498db',
            color: 'white',
            fontSize: '13px',
            padding: '4px 10px',
        },
        deleteButton: {
            backgroundColor: '#e74c3c',
            borderColor: '#e74c3c',
            color: 'white',
            fontSize: '13px',
            padding: '4px 10px',
        },
        badge: {
            backgroundColor: '#f0f0f0',
            color: '#495057',
            fontWeight: '500',
            fontSize: '12px',
            padding: '4px 8px',
            borderRadius: '4px',
        },
        noData: {
            padding: '40px 20px',
            textAlign: 'center',
            color: '#6c757d',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            margin: '20px 0',
        },
        loader: {
            display: 'flex',
            justifyContent: 'center',
            padding: '40px 0',
        },
        countBadge: {
            backgroundColor: '#e9ecef',
            color: '#495057',
            fontWeight: '500',
            fontSize: '14px',
            padding: '4px 10px',
            borderRadius: '20px',
        },
        alert: {
            borderRadius: '6px',
            marginBottom: '20px',
        },
        headerSection: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
        }
    };

    return (
        <DashboardLayout>
            <div style={styles.pageContainer}>
                <div style={styles.headerSection}>
                    <h2 style={styles.pageTitle}>Programme Management</h2>
                    {!showForm && (
                        <Button
                            variant="success"
                            style={styles.addButton}
                            onClick={handleShowAddForm}
                        >
                            Add Programme
                        </Button>
                    )}
                </div>

                {/* Alerts */}
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError(null)} style={styles.alert}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert variant="success" dismissible onClose={() => setSuccess(false)} style={styles.alert}>
                        {editMode ? 'Programme updated successfully!' : 'Programme added successfully!'}
                    </Alert>
                )}

                {/* Form Card - Only shown when showForm is true */}
                {showForm && (
                    <Card style={styles.formCard}>
                        <Card.Header style={styles.formCardHeader}>
                            {editMode ? 'Edit Programme' : 'Add New Programme'}
                        </Card.Header>
                        <Card.Body style={styles.formCardBody}>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={styles.formLabel}>Programme Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={programmeCode}
                                        onChange={(e) => setProgrammeCode(e.target.value)}
                                        placeholder="Enter programme code"
                                        required
                                        style={styles.formInput}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label style={styles.formLabel}>Programme Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={programmeName}
                                        onChange={(e) => setProgrammeName(e.target.value)}
                                        placeholder="Enter programme name"
                                        required
                                        style={styles.formInput}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label style={styles.formLabel}>Faculty</Form.Label>
                                    <Form.Select
                                        value={selectedFacultyName}
                                        onChange={(e) => setSelectedFacultyName(e.target.value)}
                                        required
                                        style={styles.formInput}
                                    >
                                        <option value="">Select Faculty</option>
                                        {faculties.map(faculty => (
                                            <option key={faculty.id} value={faculty.facultyName}>
                                                {faculty.facultyName}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <div style={styles.formButtons}>
                                    <Button
                                        variant="secondary"
                                        onClick={handleCancel}
                                        style={styles.secondaryButton}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        style={styles.primaryButton}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                <span className="ms-2">Processing...</span>
                                            </>
                                        ) : (
                                            editMode ? 'Update Programme' : 'Add Programme'
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                )}

                {/* Table Card */}
                <Card style={styles.tableCard}>
                    <Card.Header style={styles.tableCardHeader}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span>Existing Programmes</span>
                            <span style={{ ...styles.countBadge, marginLeft: '12px' }}>
                {filteredProgrammes.length} of {programmes.length}
              </span>
                        </div>
                        <Form.Control
                            type="text"
                            placeholder="Search programmes..."
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                            style={styles.filterInput}
                        />
                    </Card.Header>
                    <Card.Body style={{ padding: '0' }}>
                        {loading ? (
                            <div style={styles.loader}>
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>
                        ) : programmes.length > 0 ? (
                            <div style={styles.tableWrapper}>
                                <Table hover style={styles.table}>
                                    <thead>
                                    <tr style={styles.tableHeader}>
                                        <th style={{ padding: '12px 16px' }}>Code</th>
                                        <th style={{ padding: '12px 16px' }}>Programme Name</th>
                                        <th style={{ padding: '12px 16px' }}>Faculty</th>
                                        <th style={{ padding: '12px 16px', width: '150px', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredProgrammes.map((programme, index) => (
                                        <tr key={index} style={styles.tableRow}>
                                            <td style={{ padding: '12px 16px', fontWeight: '500' }}>{programme.programmeCode}</td>
                                            <td style={{ padding: '12px 16px' }}>{programme.programmeName}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={styles.badge}>{programme.facultyName}</span>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={styles.tableActions}>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        style={styles.editButton}
                                                        onClick={() => handleEdit(programme)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        style={styles.deleteButton}
                                                        onClick={() => handleDelete(programme.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            </div>
                        ) : (
                            <div style={styles.noData}>
                                <p style={{ marginBottom: '0' }}>No programmes found. Click "Add Programme" to create your first programme.</p>
                            </div>
                        )}
                        {programmes.length > 0 && filteredProgrammes.length === 0 && (
                            <div style={styles.noData}>
                                <p style={{ marginBottom: '0' }}>No programmes match your search criteria.</p>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Programme;