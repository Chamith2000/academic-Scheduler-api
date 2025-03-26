import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Container, Row, Col, Card, Table, Badge, Spinner } from 'react-bootstrap';
import useAuth from "../hooks/useAuth"; // Adjust the path as per your project structure
import DashboardLayout from "../Layout/DashboardLayout"; // Assuming you want to use the same layout

const TimeSlot = () => {
    const [timeSlots, setTimeSlots] = useState([]);
    const [day, setDay] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const { auth } = useAuth();

    // Days of the week for dropdown
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Fetch all time slots
    const fetchTimeSlots = () => {
        setIsLoading(true);
        setError(null);

        axios
            .get('http://localhost:8080/api/timeslots', {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then(response => {
                setTimeSlots(response.data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error(`Error: ${error}`);
                setError('Failed to load time slots. Please try again later.');
                setIsLoading(false);
            });
    };

    // Add a new time slot
    const addTimeSlot = (e) => {
        e.preventDefault();
        if (!day || !startTime || !endTime) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setError(null);

        const newTimeSlot = {
            day,
            startTime,
            endTime,
        };

        axios
            .post('http://localhost:8080/api/timeslots', newTimeSlot, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                    'Content-Type': 'application/json',
                },
            })
            .then(() => {
                setSuccess(true);
                setError(null);
                setDay('');
                setStartTime('');
                setEndTime('');
                fetchTimeSlots();
                setIsLoading(false);
                setTimeout(() => setSuccess(false), 3000);
            })
            .catch(error => {
                console.error(`Error: ${error}`);
                setError('Failed to add time slot. Please try again.');
                setIsLoading(false);
            });
    };

    // Delete a time slot
    const deleteTimeSlot = (id) => {
        if (window.confirm('Are you sure you want to delete this time slot?')) {
            setIsLoading(true);

            axios
                .delete(`http://localhost:8080/api/timeslots/${id}`, {
                    headers: {
                        Authorization: `Bearer ${auth.accessToken}`,
                    },
                })
                .then(() => {
                    fetchTimeSlots();
                })
                .catch(error => {
                    console.error(`Error: ${error}`);
                    setError('Failed to delete time slot');
                    setIsLoading(false);
                });
        }
    };

    useEffect(() => {
        fetchTimeSlots();
    }, []);

    // Styles (unchanged from original, but wrapped in DashboardLayout)
    const styles = {
        pageContainer: {
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            paddingTop: '40px',
            paddingBottom: '40px',
        },
        container: {
            margin: '0 auto',
            maxWidth: '1140px',
            width: '100%',
        },
        heading: {
            color: '#2c3e50',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '2rem',
        },
        row: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            margin: '0 -15px',
        },
        column: {
            flex: '0 0 100%',
            maxWidth: '100%',
            padding: '0 15px',
            marginBottom: '30px',
            display: 'flex',
        },
        columnMd6: {
            flex: '0 0 100%',
            maxWidth: '100%',
            padding: '0 15px',
            marginBottom: '30px',
            display: 'flex',
        },
        card: {
            borderRadius: '10px',
            overflow: 'hidden',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
        },
        cardHeader: {
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        cardTitle: {
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 600,
        },
        cardBody: {
            padding: '20px',
            flex: '1 1 auto',
        },
        formGroup: {
            marginBottom: '20px',
        },
        formLabel: {
            fontWeight: 600,
            marginBottom: '8px',
            display: 'block',
        },
        formControl: {
            borderRadius: '8px',
            padding: '12px 15px',
            border: '1px solid #d1d9e6',
            width: '100%',
            fontSize: '1rem',
        },
        formRow: {
            display: 'flex',
            flexWrap: 'wrap',
            margin: '0 -10px',
        },
        formCol: {
            flex: '0 0 100%',
            maxWidth: '100%',
            padding: '0 10px',
        },
        button: {
            borderRadius: '8px',
            padding: '12px 20px',
            fontWeight: 600,
            marginTop: '1rem',
            width: '100%',
            transition: 'all 0.3s',
            cursor: 'pointer',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        tableContainer: {
            overflowX: 'auto',
            width: '100%',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
        },
        tableHeader: {
            fontWeight: 600,
            backgroundColor: '#f8f9fc',
            borderTop: 'none',
            padding: '15px',
            textAlign: 'left',
        },
        tableCell: {
            verticalAlign: 'middle',
            padding: '15px',
            borderTop: '1px solid #e3e6f0',
        },
        dayBadge: {
            padding: '8px 12px',
            fontWeight: 600,
            borderRadius: '6px',
            display: 'inline-block',
        },
        actionButton: {
            borderRadius: '6px',
            padding: '8px 12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            border: '1px solid #dc3545',
            color: '#dc3545',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.3s',
        },
        loadingSpinner: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '50px 0',
            width: '100%',
        },
        emptyMessage: {
            textAlign: 'center',
            padding: '50px 0',
            color: '#6c757d',
            width: '100%',
        },
        errorMessage: {
            padding: '12px 15px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '5px',
            marginBottom: '20px',
        },
        successMessage: {
            padding: '12px 15px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '5px',
            marginBottom: '20px',
        },
    };

    // Media query handling for responsive design
    useEffect(() => {
        const handleResize = () => {
            const isMediumScreen = window.innerWidth >= 768;
            const columnElements = document.querySelectorAll('.column-md-6');

            columnElements.forEach(element => {
                if (isMediumScreen) {
                    element.style.flex = '0 0 50%';
                    element.style.maxWidth = '50%';
                } else {
                    element.style.flex = '0 0 100%';
                    element.style.maxWidth = '100%';
                }
            });
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Format time for display
    const formatTime = (timeString) => {
        try {
            const [hours, minutes] = timeString.split(':');
            const time = new Date();
            time.setHours(parseInt(hours));
            time.setMinutes(parseInt(minutes));
            return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return timeString;
        }
    };

    // Get day badge color
    const getDayColor = (day) => {
        const colors = {
            'Monday': 'primary',
            'Tuesday': 'info',
            'Wednesday': 'success',
            'Thursday': 'warning',
            'Friday': 'danger',
            'Saturday': 'secondary',
            'Sunday': 'dark',
        };
        return colors[day] || 'primary';
    };

    // Get badge background color
    const getBadgeBackground = (variant) => {
        const colors = {
            'primary': '#0d6efd',
            'info': '#0dcaf0',
            'success': '#198754',
            'warning': '#ffc107',
            'danger': '#dc3545',
            'secondary': '#6c757d',
            'dark': '#212529',
        };
        return colors[variant] || '#0d6efd';
    };

    // Get badge text color
    const getBadgeTextColor = (variant) => {
        return ['warning'].includes(variant) ? '#212529' : '#fff';
    };

    return (
        <DashboardLayout>
            <div style={styles.pageContainer}>
                <div style={styles.container}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h1 className="font-bold text-3xl mb-6">TimeSlot Management</h1>
                    </div>

                    {/* Success/Error Messages */}
                    {success && (
                        <div style={styles.successMessage}>
                            Time slot added successfully!
                        </div>
                    )}
                    {error && (
                        <div style={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <div style={styles.row}>
                        <div className="column-md-6" style={styles.columnMd6}>
                            <div style={styles.card}>
                                <div style={{ ...styles.cardHeader, backgroundColor: '#4e73df', color: 'white' }}>
                                    <h3 style={styles.cardTitle}>Add New Time Slot</h3>
                                </div>
                                <div style={styles.cardBody}>
                                    <form onSubmit={addTimeSlot}>
                                        <div style={styles.formGroup}>
                                            <label htmlFor="day" style={styles.formLabel}>Day</label>
                                            <select
                                                id="day"
                                                value={day}
                                                onChange={(e) => setDay(e.target.value)}
                                                style={styles.formControl}
                                                disabled={isLoading}
                                            >
                                                <option value="">Select a day</option>
                                                {daysOfWeek.map(day => (
                                                    <option key={day} value={day}>{day}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={styles.formRow}>
                                            <div className="column-md-6" style={{ ...styles.formCol, flex: '0 0 50%', maxWidth: '50%' }}>
                                                <div style={styles.formGroup}>
                                                    <label htmlFor="startTime" style={styles.formLabel}>Start Time</label>
                                                    <input
                                                        type="time"
                                                        id="startTime"
                                                        value={startTime}
                                                        onChange={(e) => setStartTime(e.target.value)}
                                                        style={styles.formControl}
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                            </div>
                                            <div className="column-md-6" style={{ ...styles.formCol, flex: '0 0 50%', maxWidth: '50%' }}>
                                                <div style={styles.formGroup}>
                                                    <label htmlFor="endTime" style={styles.formLabel}>End Time</label>
                                                    <input
                                                        type="time"
                                                        id="endTime"
                                                        value={endTime}
                                                        onChange={(e) => setEndTime(e.target.value)}
                                                        style={styles.formControl}
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            style={{
                                                ...styles.button,
                                                backgroundColor: '#4e73df',
                                                color: 'white',
                                                border: 'none',
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = '#375bcd';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 5px 15px rgba(78, 115, 223, 0.4)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = '#4e73df';
                                                e.currentTarget.style.transform = 'none';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            {isLoading ? 'Adding...' : 'Add Time Slot'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="column-md-6" style={styles.columnMd6}>
                            <div style={styles.card}>
                                <div style={{ ...styles.cardHeader, backgroundColor: '#6c757d', color: 'white' }}>
                                    <h3 style={styles.cardTitle}>Your Schedule</h3>
                                </div>
                                <div style={styles.cardBody}>
                                    {isLoading && !timeSlots.length ? (
                                        <div style={styles.loadingSpinner}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                border: '4px solid #f3f3f3',
                                                borderTop: '4px solid #3498db',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite',
                                            }}></div>
                                            <style>
                                                {`
                          @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                          }
                        `}
                                            </style>
                                        </div>
                                    ) : timeSlots.length === 0 ? (
                                        <div style={styles.emptyMessage}>
                                            <p style={{ margin: 0 }}>No time slots added yet.</p>
                                        </div>
                                    ) : (
                                        <div style={styles.tableContainer}>
                                            <table style={styles.table}>
                                                <thead>
                                                <tr>
                                                    <th style={styles.tableHeader}>Day</th>
                                                    <th style={styles.tableHeader}>Start Time</th>
                                                    <th style={styles.tableHeader}>End Time</th>
                                                    <th style={styles.tableHeader}>Actions</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {timeSlots.map((timeSlot, index) => {
                                                    const badgeColor = getDayColor(timeSlot.day);
                                                    return (
                                                        <tr
                                                            key={index}
                                                            style={{
                                                                backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fc',
                                                                transition: 'background-color 0.3s',
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#f1f3fa';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f8f9fc';
                                                            }}
                                                        >
                                                            <td style={styles.tableCell}>
                                  <span style={{
                                      ...styles.dayBadge,
                                      backgroundColor: getBadgeBackground(badgeColor),
                                      color: getBadgeTextColor(badgeColor),
                                  }}>
                                    {timeSlot.day}
                                  </span>
                                                            </td>
                                                            <td style={styles.tableCell}>{formatTime(timeSlot.startTime)}</td>
                                                            <td style={styles.tableCell}>{formatTime(timeSlot.endTime)}</td>
                                                            <td style={styles.tableCell}>
                                                                <button
                                                                    onClick={() => deleteTimeSlot(timeSlot.id)}
                                                                    style={styles.actionButton}
                                                                    disabled={isLoading}
                                                                    onMouseOver={(e) => {
                                                                        e.currentTarget.style.backgroundColor = '#dc3545';
                                                                        e.currentTarget.style.color = 'white';
                                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                                    }}
                                                                    onMouseOut={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                                        e.currentTarget.style.color = '#dc3545';
                                                                        e.currentTarget.style.transform = 'none';
                                                                    }}
                                                                >
                                                                    <span style={{ marginRight: '5px' }}>✕</span> Remove
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TimeSlot;