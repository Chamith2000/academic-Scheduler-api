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

    // Validation state
    const [validations, setValidations] = useState({
        day: { isValid: true, message: '' },
        startTime: { isValid: true, message: '' },
        endTime: { isValid: true, message: '' }
    });

    const { auth } = useAuth();

    // Days of the week for dropdown
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Validation functions
    const validateDay = (value) => {
        if (!value) {
            return { isValid: false, message: 'Please select a day' };
        }
        return { isValid: true, message: '' };
    };

    const validateTime = (startTime, endTime) => {
        // Check if both start and end times are provided
        if (!startTime || !endTime) {
            return {
                startTime: {
                    isValid: !!startTime,
                    message: !startTime ? 'Start time is required' : ''
                },
                endTime: {
                    isValid: !!endTime,
                    message: !endTime ? 'End time is required' : ''
                }
            };
        }

        // Convert times to minutes for comparison
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        const startTimeInMinutes = startHours * 60 + startMinutes;
        const endTimeInMinutes = endHours * 60 + endMinutes;

        // Validate that end time is after start time
        if (endTimeInMinutes <= startTimeInMinutes) {
            return {
                startTime: { isValid: false, message: 'Start time must be before end time' },
                endTime: { isValid: false, message: 'End time must be after start time' }
            };
        }

        return {
            startTime: { isValid: true, message: '' },
            endTime: { isValid: true, message: '' }
        };
    };

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

    // Modify addTimeSlot to include validation
    const addTimeSlot = (e) => {
        e.preventDefault();

        // Validate day
        const dayValidation = validateDay(day);

        // Validate times
        const timeValidations = validateTime(startTime, endTime);

        // Update validations state
        setValidations({
            day: dayValidation,
            startTime: timeValidations.startTime,
            endTime: timeValidations.endTime
        });

        // Check if all validations pass
        if (!dayValidation.isValid ||
            !timeValidations.startTime.isValid ||
            !timeValidations.endTime.isValid) {
            return;
        }

        // Check for existing time slot conflicts
        const hasConflict = timeSlots.some(slot =>
            slot.day === day &&
            isTimeOverlapping(slot.startTime, slot.endTime, startTime, endTime)
        );

        if (hasConflict) {
            setError('A time slot already exists for this day and time');
            setValidations(prev => ({
                ...prev,
                startTime: { isValid: false, message: 'Conflicting time slot' },
                endTime: { isValid: false, message: 'Conflicting time slot' }
            }));
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
                // Reset validations
                setValidations({
                    day: { isValid: true, message: '' },
                    startTime: { isValid: true, message: '' },
                    endTime: { isValid: true, message: '' }
                });
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

    // Helper function to check time overlapping
    const isTimeOverlapping = (existingStart, existingEnd, newStart, newEnd) => {
        const [existStartHours, existStartMins] = existingStart.split(':').map(Number);
        const [existEndHours, existEndMins] = existingEnd.split(':').map(Number);
        const [newStartHours, newStartMins] = newStart.split(':').map(Number);
        const [newEndHours, newEndMins] = newEnd.split(':').map(Number);

        const existStartMinutes = existStartHours * 60 + existStartMins;
        const existEndMinutes = existEndHours * 60 + existEndMins;
        const newStartMinutes = newStartHours * 60 + newStartMins;
        const newEndMinutes = newEndHours * 60 + newEndMins;

        return (
            (newStartMinutes >= existStartMinutes && newStartMinutes < existEndMinutes) ||
            (newEndMinutes > existStartMinutes && newEndMinutes <= existEndMinutes) ||
            (newStartMinutes <= existStartMinutes && newEndMinutes >= existEndMinutes)
        );
    };

    useEffect(() => {
        fetchTimeSlots();
    }, []);

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

    // Updated styles with a more modern and clean design
    const styles = {
        pageContainer: {
            backgroundColor: '#f8f9fc',
            minHeight: '100vh',
            padding: '20px',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 15px'
        },
        row: {
            display: 'flex',
            flexWrap: 'wrap',
            marginRight: '-15px',
            marginLeft: '-15px'
        },
        columnMd6: {
            flex: '0 0 50%',
            maxWidth: '50%',
            padding: '0 15px'
        },
        card: {
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: 'none',
            marginBottom: '20px'
        },
        cardHeader: {
            padding: '15px 20px',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        cardTitle: {
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 600
        },
        cardBody: {
            padding: '20px'
        },
        formGroup: {
            marginBottom: '1rem'
        },
        formRow: {
            display: 'flex',
            flexWrap: 'wrap',
            marginRight: '-15px',
            marginLeft: '-15px'
        },
        formCol: {
            flex: '0 0 50%',
            maxWidth: '50%',
            padding: '0 15px'
        },
        formControl: {
            borderRadius: '8px',
            border: '1px solid #d1d3e2',
            padding: '10px 15px',
            fontSize: '0.875rem',
            transition: 'border-color 0.2s ease-in-out',
            width: '100%'
        },
        formLabel: {
            marginBottom: '0.5rem',
            fontWeight: 600,
            color: '#6e707e'
        },
        button: {
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '0.875rem',
            fontWeight: 600,
            transition: 'all 0.2s ease-in-out',
            width: '100%'
        },
        tableContainer: {
            borderRadius: '8px',
            overflow: 'hidden'
        },
        table: {
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0
        },
        tableHeader: {
            backgroundColor: '#f8f9fc',
            color: '#6e707e',
            padding: '12px 15px',
            textAlign: 'left',
            fontWeight: 600,
            fontSize: '0.875rem',
            borderBottom: '1px solid #e3e6f0'
        },
        tableCell: {
            padding: '12px 15px',
            borderBottom: '1px solid #e3e6f0'
        },
        dayBadge: {
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600
        },
        actionButton: {
            background: 'transparent',
            color: '#dc3545',
            border: '1px solid #dc3545',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '0.75rem',
            transition: 'all 0.2s ease-in-out'
        },
        successMessage: {
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
        },
        errorMessage: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
        },
        loadingSpinner: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px'
        }
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
                                                onChange={(e) => {
                                                    setDay(e.target.value);
                                                    setValidations(prev => ({
                                                        ...prev,
                                                        day: validateDay(e.target.value)
                                                    }));
                                                }}
                                                style={{
                                                    ...styles.formControl,
                                                    borderColor: !validations.day.isValid ? '#dc3545' : undefined
                                                }}
                                                disabled={isLoading}
                                            >
                                                <option value="">Select a day</option>
                                                {daysOfWeek.map(day => (
                                                    <option key={day} value={day}>{day}</option>
                                                ))}
                                            </select>
                                            {!validations.day.isValid && (
                                                <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                                    {validations.day.message}
                                                </div>
                                            )}
                                        </div>
                                        <div style={styles.formRow}>
                                            <div className="column-md-6" style={{ ...styles.formCol, flex: '0 0 50%', maxWidth: '50%' }}>
                                                <div style={styles.formGroup}>
                                                    <label htmlFor="startTime" style={styles.formLabel}>Start Time</label>
                                                    <input
                                                        type="time"
                                                        id="startTime"
                                                        value={startTime}
                                                        onChange={(e) => {
                                                            setStartTime(e.target.value);
                                                            const timeValidations = validateTime(e.target.value, endTime);
                                                            setValidations(prev => ({
                                                                ...prev,
                                                                startTime: timeValidations.startTime,
                                                                endTime: timeValidations.endTime
                                                            }));
                                                        }}
                                                        style={{
                                                            ...styles.formControl,
                                                            borderColor: !validations.startTime.isValid ? '#dc3545' : undefined
                                                        }}
                                                        disabled={isLoading}
                                                    />
                                                    {!validations.startTime.isValid && (
                                                        <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                                            {validations.startTime.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="column-md-6" style={{ ...styles.formCol, flex: '0 0 50%', maxWidth: '50%' }}>
                                                <div style={styles.formGroup}>
                                                    <label htmlFor="endTime" style={styles.formLabel}>End Time</label>
                                                    <input
                                                        type="time"
                                                        id="endTime"
                                                        value={endTime}
                                                        onChange={(e) => {
                                                            setEndTime(e.target.value);
                                                            const timeValidations = validateTime(startTime, e.target.value);
                                                            setValidations(prev => ({
                                                                ...prev,
                                                                startTime: timeValidations.startTime,
                                                                endTime: timeValidations.endTime
                                                            }));
                                                        }}
                                                        style={{
                                                            ...styles.formControl,
                                                            borderColor: !validations.endTime.isValid ? '#dc3545' : undefined
                                                        }}
                                                        disabled={isLoading}
                                                    />
                                                    {!validations.endTime.isValid && (
                                                        <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                                            {validations.endTime.message}
                                                        </div>
                                                    )}
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