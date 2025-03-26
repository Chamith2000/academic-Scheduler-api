import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    CalendarDaysIcon,
    ClockIcon,
    ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import useAuth from "../../hooks/useAuth";
import Layout from "../../Layout/StudentDashboard"; // Assuming you have a similar layout component
import "../../styles/styles.css";

const StudentTimetable = () => {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const [timetable, setTimetable] = useState([]);
    const [timeslots, setTimeslots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch timetable of a student
    const fetchTimetable = () => {
        axios
            .get("http://localhost:8080/api/schedule/myTimetable", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                setTimetable(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
                setIsLoading(false);
            });
    };

    const fetchTimeslots = () => {
        axios
            .get("http://localhost:8080/api/timeslots", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                setTimeslots(response.data.map(timeslot => {
                    const startHour = timeslot.startTime.slice(0, 5);
                    const endHour = timeslot.endTime.slice(0, 5);
                    return `${timeslot.day}: ${startHour} - ${endHour}`;
                }));
            })
            .catch((error) => console.error(`Error: ${error}`));
    };

    // handle logout
    const logout = () => {
        setAuth({});
        localStorage.removeItem("user");
        navigate("/login");
    };

    useEffect(() => {
        fetchTimetable();
        fetchTimeslots();
    }, []);

    return (
        <Layout>
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Student Timetable</h1>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                    </div>
                ) : (
                    <Table data={timetable} timeslots={timeslots} />
                )}
            </div>
        </Layout>
    );
};

const formatTimetableData = (scheduleData, uniqueTimeslots) => {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    let timetable = {
        days: daysOfWeek,
        timeslots: uniqueTimeslots,
        schedule: {}
    };

    daysOfWeek.forEach(day => {
        timetable.schedule[day] = Array(uniqueTimeslots.length).fill(null);
    });

    if (scheduleData && scheduleData.timeSlots) {
        scheduleData.timeSlots.forEach((timeSlot, index) => {
            const day = timeSlot.split(' ')[0];
            const timeslotStripped = timeSlot.replace(day, '').trim();

            const timetableIndex = uniqueTimeslots.indexOf(timeslotStripped);

            if (timetableIndex !== -1) {
                timetable.schedule[day][timetableIndex] = {
                    courseCode: scheduleData.courseCodes[index],
                    roomName: scheduleData.roomNames[index]
                };
            }
        });
    }

    return timetable;
};

const Table = ({ data, timeslots }) => {
    const uniqueTimeslots = [...new Set(timeslots.map(timeSlot => timeSlot.split(': ')[1]))];
    const scheduleData = Array.isArray(data) ? data[0] : data;
    const timetable = formatTimetableData(scheduleData, uniqueTimeslots);

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-100 border-b">
                <h2 className="text-lg font-semibold">Weekly Schedule</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 border">Time Slot</th>
                        {timetable.days.map(day => (
                            <th key={day} className="p-2 border">{day}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {timetable.timeslots.map((timeslot, index) => (
                        <tr key={timeslot}>
                            <td className="p-2 border font-medium">{timeslot}</td>
                            {timetable.days.map(day => (
                                <td key={day} className="p-2 border text-center">
                                    {timetable.schedule[day][index] ? (
                                        <div>
                                            <div className="font-semibold">
                                                {timetable.schedule[day][index].courseCode}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {timetable.schedule[day][index].roomName}
                                            </div>
                                        </div>
                                    ) : (
                                        '-'
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentTimetable;