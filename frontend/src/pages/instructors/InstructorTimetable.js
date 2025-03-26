import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import {
    CalendarDaysIcon,
    ClockIcon,
    BuildingOffice2Icon,
    ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import useAuth from "../../hooks/useAuth";
import Layout from "../../Layout/InstructorDashboard";
import "../../styles/styles.css";

const InstructorTimetable = () => {
    const { auth } = useAuth();
    const [timetable, setTimetable] = useState([]);
    const [timeslots, setTimeslots] = useState([]);

    // Fetch timetable of an instructor
    const fetchTimetable = () => {
        axios
            .get("http://localhost:8080/api/schedule/instructor", {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`,
                },
            })
            .then((response) => {
                setTimetable(response.data);
            })
            .catch((error) => console.error(`Error: ${error}`));
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

    useEffect(() => {
        fetchTimetable();
    }, []);

    useEffect(() => {
        fetchTimeslots();
    }, []);

    return (
        <Layout>
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Instructor Timetable</h1>
                </div>

                <Table data={timetable} timeslots={timeslots} />
            </div>
        </Layout>
    );
};

const formatTimetableData = (scheduleData, uniqueTimeslots) => {
    console.log("Inside format timetable", scheduleData);
    const objString = JSON.stringify(scheduleData);
    console.log(objString);
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    // Initialize timetable
    let timetable = {
        days: daysOfWeek,
        timeslots: uniqueTimeslots,
        schedule: {}
    };

    // Initialize schedule with empty arrays
    daysOfWeek.forEach(day => {
        timetable.schedule[day] = Array(uniqueTimeslots.length).fill(null);
    });

    // Make sure we have schedule data
    if (scheduleData) {
        console.log('scheduleData exists');

        // Check if timeSlots property exists on scheduleData
        if (scheduleData.timeSlots) {
            console.log('scheduleData.timeSlots exists');

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
        } else {
            console.log('scheduleData.timeSlots does not exist');
        }
    } else {
        console.log('No schedule data');
    }

    return timetable;
};

const Table = ({ data, timeslots }) => {
    console.log("Inside table component", data);
    // Extract unique timeslots from the timeslots prop
    const uniqueTimeslots = [...new Set(timeslots.map(timeSlot => timeSlot.split(': ')[1]))];

    // Check if data is an array and take the first element
    const scheduleData = Array.isArray(data) ? data[0] : data;

    // As there's only one timetable, we don't need to map over data
    const timetable = formatTimetableData(scheduleData, uniqueTimeslots);

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-100 border-b">
                <h2 className="text-lg font-semibold">Weekly Schedule</h2>
            </div>

            {data.message}

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

export default InstructorTimetable;