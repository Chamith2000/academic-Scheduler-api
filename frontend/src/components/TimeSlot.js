import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Container, Row, Col, Card, Table, Badge, Spinner } from 'react-bootstrap';
import useAuth from "../hooks/useAuth";
import DashboardLayout from "../Layout/DashboardLayout";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

const TimeSlot = () => {
    const [timeSlots, setTimeSlots] = useState([]);
    const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);
    const [day, setDay] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);

    const { auth } = useAuth();

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const validateDay = (value) => {
        if (!value) {
            return { isValid: false, message: 'Please select a day' };
        }
        return { isValid: true, message: '' };
    };

    const validateTime = (startTime, endTime) => {
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

        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        const startTimeInMinutes = startHours * 60 + startMinutes;
        const endTimeInMinutes = endHours * 60 + endMinutes;

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

    const [validations, setValidations] = useState({
        day: { isValid: true, message: '' },
        startTime: { isValid: true, message: '' },
        endTime: { isValid: true, message: '' }
    });

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
                setFilteredTimeSlots(response.data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error(`Error: ${error}`);
                setError('Failed to load time slots. Please try again later.');
                setIsLoading(false);
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const dayValidation = validateDay(day);
        const timeValidations = validateTime(startTime, endTime);

        setValidations({
            day: dayValidation,
            startTime: timeValidations.startTime,
            endTime: timeValidations.endTime
        });

        if (!dayValidation.isValid ||
            !timeValidations.startTime.isValid ||
            !timeValidations.endTime.isValid) {
            return;
        }

        const hasConflict = timeSlots.some(slot =>
            slot.id !== editingId &&
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

        const timeSlotData = { day, startTime, endTime };
        setIsLoading(true);
        setError(null);

        const request = editingId
            ? axios.put(`http://localhost:8080/api/timeslots/${editingId}`, timeSlotData, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                    'Content-Type': 'application/json',
                },
            })
            : axios.post('http://localhost:8080/api/timeslots', timeSlotData, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

        request
            .then(() => {
                setSuccess(true);
                resetForm();
                fetchTimeSlots();
                setTimeout(() => setSuccess(false), 3000);
            })
            .catch(error => {
                console.error(`Error: ${error}`);
                setError(`Failed to ${editingId ? 'update' : 'add'} time slot. Please try again.`);
                setIsLoading(false);
            });
    };

    const resetForm = () => {
        setDay('');
        setStartTime('');
        setEndTime('');
        setEditingId(null);
        setValidations({
            day: { isValid: true, message: '' },
            startTime: { isValid: true, message: '' },
            endTime: { isValid: true, message: '' }
        });
        setIsLoading(false);
    };

    const editTimeSlot = (timeSlot) => {
        setEditingId(timeSlot.id);
        setDay(timeSlot.day);
        setStartTime(timeSlot.startTime);
        setEndTime(timeSlot.endTime);
    };

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

    const handleSearch = (query) => {
        setSearchQuery(query);
        const filtered = timeSlots.filter((slot) =>
            slot.day.toLowerCase().includes(query.toLowerCase()) ||
            formatTime(slot.startTime).toLowerCase().includes(query.toLowerCase()) ||
            formatTime(slot.endTime).toLowerCase().includes(query.toLowerCase())
        );
        setFilteredTimeSlots(filtered);
    };

    useEffect(() => {
        fetchTimeSlots();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const isMediumScreen = window.innerWidth >= 768;
            const columnElements = document.querySelectorAll('.column-md-6');

            columnElements.forEach(element => {
                if (isMediumScreen) {
                    element.style.flex = '0 0 100%';
                    element.style.maxWidth = '100%';
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

    const getBadgeTextColor = (variant) => {
        return ['warning'].includes(variant) ? '#212529' : '#fff';
    };

    const getWeeklySchedule = () => {
        const schedule = {};
        daysOfWeek.forEach(day => {
            schedule[day] = filteredTimeSlots
                .filter(slot => slot.day === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));
        });
        return schedule;
    };

    const getMaxSlots = () => {
        const schedule = getWeeklySchedule();
        return Math.max(...daysOfWeek.map(day => schedule[day].length), 1);
    };

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
            marginLeft: '-15px',
            flexDirection: 'column'
        },
        columnMd6: {
            flex: '0 0 100%',
            maxWidth: '100%',
            padding: '0 15px',
            marginBottom: '20px'
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
            overflowX: 'auto', // Make table horizontally scrollable
            whiteSpace: 'nowrap'
        },
        table: {
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            minWidth: '1000px' // Ensure all days are visible with scrollbar
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
            borderBottom: '1px solid #e3e6f0',
            verticalAlign: 'top'
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

                    {success && (
                        <div style={styles.successMessage}>
                            Time slot {editingId ? 'updated' : 'added'} successfully!
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
                                    <h3 style={styles.cardTitle}>
                                        {editingId ? 'Edit Time Slot' : 'Add New Time Slot'}
                                    </h3>
                                </div>
                                <div style={styles.cardBody}>
                                    <form onSubmit={handleSubmit}>
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
                                            {isLoading ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Time Slot' : 'Add Time Slot')}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="column-md-6" style={styles.columnMd6}>
                            <div style={styles.card}>
                                <div style={{ ...styles.cardHeader, backgroundColor: '#6c757d', color: 'white' }}>
                                    <h3 style={styles.cardTitle}>Your Weekly Schedule</h3>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            placeholder="      Search time slots..."
                                            className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                                        />
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 left-3" />
                                    </div>
                                </div>

                                <div style={styles.cardBody}>
                                    {isLoading && !filteredTimeSlots.length ? (
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
                                    ) : filteredTimeSlots.length === 0 ? (
                                        <div style={styles.emptyMessage}>
                                            <p style={{ margin: 0 }}>
                                                {searchQuery ? "No matching time slots found." : "No time slots added yet."}
                                            </p>
                                        </div>
                                    ) : (
                                        <div style={styles.tableContainer}>
                                            <table style={styles.table}>
                                                <thead>
                                                <tr>
                                                    {daysOfWeek.map((day) => (
                                                        <th key={day} style={styles.tableHeader}>{day}</th>
                                                    ))}
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {Array.from({ length: getMaxSlots() }).map((_, rowIndex) => (
                                                    <tr key={rowIndex}>
                                                        {daysOfWeek.map((day) => {
                                                            const schedule = getWeeklySchedule();
                                                            const slot = schedule[day][rowIndex];
                                                            return (
                                                                <td key={day} style={styles.tableCell}>
                                                                    {slot ? (
                                                                        <div>
                                                                                <span style={{
                                                                                    ...styles.dayBadge,
                                                                                    backgroundColor: getBadgeBackground(getDayColor(day)),
                                                                                    color: getBadgeTextColor(getDayColor(day)),
                                                                                    display: 'inline-block',
                                                                                    marginBottom: '5px'
                                                                                }}>
                                                                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                                                </span>
                                                                            <div>
                                                                                <button
                                                                                    onClick={() => editTimeSlot(slot)}
                                                                                    style={{
                                                                                        ...styles.actionButton,
                                                                                        color: '#4e73df',
                                                                                        borderColor: '#4e73df',
                                                                                        marginRight: '5px'
                                                                                    }}
                                                                                    disabled={isLoading}
                                                                                    onMouseOver={(e) => {
                                                                                        e.currentTarget.style.backgroundColor = '#4e73df';
                                                                                        e.currentTarget.style.color = 'white';
                                                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                                                    }}
                                                                                    onMouseOut={(e) => {
                                                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                                                        e.currentTarget.style.color = '#4e73df';
                                                                                        e.currentTarget.style.transform = 'none';
                                                                                    }}
                                                                                >
                                                                                    <span style={{ marginRight: '5px' }}>✎</span> Edit
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => deleteTimeSlot(slot.id)}
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
                                                                            </div>
                                                                        </div>
                                                                    ) : null}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
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