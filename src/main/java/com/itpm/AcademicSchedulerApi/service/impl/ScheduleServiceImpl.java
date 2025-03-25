package com.itpm.AcademicSchedulerApi.service.impl;

import com.itpm.AcademicSchedulerApi.model.*;
import com.itpm.AcademicSchedulerApi.repository.*;
import com.itpm.AcademicSchedulerApi.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

        private static final Logger logger = LoggerFactory.getLogger(ScheduleService.class);

        // Repositories
        private final CourseRepository courseRepository;
        private final RoomRepository roomRepository;
        private final TimeSlotRepository timeSlotRepository;
        private final ScheduleRepository scheduleRepository;
        private final ProgramRepository programRepository;
        private final ScheduleResultRepository scheduleResultRepository;
        private final UserRepository userRepository;
        private final ProgramEnrollmentRepository programEnrollmentRepository;
        private final ScheduleStatusRepository scheduleStatusRepository;

        // Thread-safe storage for common courses
        private final Map<String, List<Schedule>> commonCourseSchedules = new ConcurrentHashMap<>();

        @Async
        @Transactional
        public void generateSchedule(int semester) {
            ScheduleStatus status = new ScheduleStatus();
            status.setSemester(semester);
            status.setStatus("IN_PROGRESS");
            scheduleStatusRepository.save(status);

            try {
                List<Program> programs = programRepository.findAll();
                List<ScheduleResult> results = new ArrayList<>();

                for (Program program : programs) {
                    for (int year = 1; year <= 4; year++) {
                        ScheduleResult result = generateYearlySchedule(semester, year, program);
                        results.add(result);
                    }
                }

                scheduleResultRepository.saveAll(results);
                status.setStatus("COMPLETED");
            } catch (Exception e) {
                status.setStatus("FAILED");
                logger.error("Scheduling failed for semester {}", semester, e);
                throw new RuntimeException("Scheduling failed", e);
            } finally {
                scheduleStatusRepository.save(status);
            }
        }

        @Transactional
        protected ScheduleResult generateYearlySchedule(int semester, int year, Program program) {
            List<Course> courses = courseRepository.findBySemesterAndYearAndProgram(semester, year, program);
            List<Room> rooms = roomRepository.findAll();
            List<TimeSlot> timeSlots = timeSlotRepository.findAll();
            List<Schedule> schedules = new ArrayList<>();

            if (courses.isEmpty()) {
                return new ScheduleResult(Collections.emptyList(), "No courses to schedule.");
            }

            // Sort courses by constraint (valid rooms * valid timeslots)
            courses.sort(Comparator.comparingInt(course ->
                    getValidRoomsForCourse(course, schedules).size() *
                            getValidTimeSlotsForCourse(course, schedules).size()
            ));

            if (!backtrackCourses(courses, rooms, timeSlots, schedules)) {
                return new ScheduleResult(schedules, "Partial schedule due to conflicts.");
            }

            return new ScheduleResult(schedules, "Schedule for " + program.getName() + " Year " + year);
        }

        // Get rooms that are valid for a course (department, room type, availability)
        private List<Room> getValidRoomsForCourse(Course course, List<Schedule> schedules) {
            return roomRepository.findAll().stream()
                    .filter(room -> room.getDepartments().contains(course.getDepartment()))
                    .filter(room -> course.getRoomSpec() == null || room.getRoomType().equals(course.getRoomSpec()))
                    .filter(room -> room.getRoomName().contains(String.valueOf(course.getYear()))) // Optional: Year-based room naming
                    .filter(room -> !isRoomAlreadyUsedForCourse(room, course, schedules))
                    .collect(Collectors.toList());
        }

        // Get timeslots that are valid for a course (no instructor/student conflicts)
        private List<TimeSlot> getValidTimeSlotsForCourse(Course course, List<Schedule> schedules) {
            return timeSlotRepository.findAll().stream()
                    .filter(timeSlot -> !isInstructorBusy(course.getInstructor(), timeSlot, schedules))
                    .filter(timeSlot -> !hasStudentConflict(course, timeSlot, schedules))
                    .collect(Collectors.toList());
        }

        // Check if a room is already used for the same course
        private boolean isRoomAlreadyUsedForCourse(Room room, Course course, List<Schedule> schedules) {
            return schedules.stream()
                    .anyMatch(s -> s.getCourse().equals(course) && s.getRoom().equals(room));
        }

        private boolean backtrackCourses(List<Course> courses, List<Room> rooms,
                                         List<TimeSlot> timeSlots, List<Schedule> schedules) {
            for (Course course : courses) {
                if (!assignCourse(course, rooms, timeSlots, schedules)) {
                    if (!backtrack(schedules)) {
                        return false;
                    }
                }
            }
            return true;
        }

        private boolean assignCourse(Course course, List<Room> rooms,
                                     List<TimeSlot> timeSlots, List<Schedule> schedules) {
            if (course.isCommonCourse()) {
                List<Schedule> existing = commonCourseSchedules.get(course.getCommonId());
                if (existing != null && isCommonScheduleValid(existing, schedules)) {
                    reuseCommonSchedules(course, existing, schedules);
                    return true;
                }
            }

            for (Room room : rooms) {
                for (TimeSlot slot : timeSlots) {
                    if (isValidAssignment(course, room, slot, schedules)) {
                        Schedule schedule = createSchedule(course, room, slot);
                        scheduleRepository.save(schedule);
                        schedules.add(schedule);
                        room.occupyTimeSlot(slot);

                        if (course.isCommonCourse()) {
                            commonCourseSchedules.computeIfAbsent(course.getCommonId(), k -> new ArrayList<>())
                                    .add(schedule);
                        }
                        return true;
                    }
                }
            }
            return false;
        }

        // --- Helper Methods ---
        private boolean isValidAssignment(Course course, Room room, TimeSlot slot, List<Schedule> schedules) {
            return room.isAvailable(slot) &&
                    !isInstructorBusy(course.getInstructor(), slot, schedules) &&
                    !hasStudentConflict(course, slot, schedules) &&
                    room.getDepartments().contains(course.getDepartment()) &&
                    (course.getRoomSpec() == null || course.getRoomSpec().equals(room.getRoomType())) &&
                    room.getRoomName().contains(String.valueOf(course.getYear()));
        }

        private boolean isInstructorBusy(Instructor instructor, TimeSlot slot, List<Schedule> schedules) {
            return schedules.stream()
                    .anyMatch(s -> s.getCourse().getInstructor().equals(instructor) &&
                            s.getTimeSlot().equals(slot));
        }

        private boolean hasStudentConflict(Course course, TimeSlot slot, List<Schedule> schedules) {
            return schedules.stream()
                    .anyMatch(s -> s.getCourse().getProgram().equals(course.getProgram()) &&
                            s.getCourse().getYear() == course.getYear() &&
                            s.getTimeSlot().equals(slot));
        }

        private boolean isCommonScheduleValid(List<Schedule> existing, List<Schedule> current) {
            return existing.stream()
                    .noneMatch(e -> current.stream()
                            .anyMatch(c -> c.getRoom().equals(e.getRoom()) ||
                                    c.getTimeSlot().equals(e.getTimeSlot())));
        }

        private void reuseCommonSchedules(Course course, List<Schedule> existing, List<Schedule> schedules) {
            existing.forEach(e -> {
                Schedule newSchedule = new Schedule();
                newSchedule.setCourse(course);
                newSchedule.setRoom(e.getRoom());
                newSchedule.setTimeSlot(e.getTimeSlot());
                newSchedule.setSection(course.getSection());
                scheduleRepository.save(newSchedule);
                schedules.add(newSchedule);
            });
        }

        private Schedule createSchedule(Course course, Room room, TimeSlot slot) {
            Schedule schedule = new Schedule();
            schedule.setCourse(course);
            schedule.setRoom(room);
            schedule.setTimeSlot(slot);
            schedule.setSection(course.getSection());
            return schedule;
        }

        private boolean backtrack(List<Schedule> schedules) {
            if (schedules.isEmpty()) return false;

            Schedule last = schedules.remove(schedules.size() - 1);
            last.getRoom().freeTimeSlot(last.getTimeSlot());
            scheduleRepository.delete(last);
            return true;
        }

        // --- Student/Instructor Schedule Retrieval ---
        public List<ScheduleResult> getSchedulesForLoggedInUser(String username) {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            Student student = user.getStudent();

            return scheduleRepository.findAll().stream()
                    .filter(s -> s.getCourse().getProgram().equals(student.getProgram()) &&
                            s.getCourse().getYear() == student.getYear())
                    .collect(Collectors.groupingBy(
                            s -> "Year " + s.getCourse().getYear() + " " + s.getCourse().getProgram().getName(),
                            Collectors.mapping(s -> s, Collectors.toList())
                    ))
                    .entrySet().stream()
                    .map(e -> new ScheduleResult(e.getValue(), e.getKey()))
                    .collect(Collectors.toList());
        }

        public List<ScheduleResult> getSchedulesForInstructor(String username) {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            Instructor instructor = user.getInstructor();

            return scheduleRepository.findAll().stream()
                    .filter(s -> s.getCourse().getInstructor().equals(instructor))
                    .collect(Collectors.groupingBy(
                            s -> "Instructor " + instructor.getFirstName(),
                            Collectors.mapping(s -> s, Collectors.toList())
                    ))
                    .entrySet().stream()
                    .map(e -> new ScheduleResult(e.getValue(), e.getKey()))
                    .collect(Collectors.toList());
        }
        public List<ScheduleResult> getAllScheduleResults() {
            return scheduleResultRepository.findAll();
        }
    }
