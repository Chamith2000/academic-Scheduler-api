package com.itpm.AcademicSchedulerApi.service.impl;

import com.itpm.AcademicSchedulerApi.model.*;
import com.itpm.AcademicSchedulerApi.repository.*;
import com.itpm.AcademicSchedulerApi.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final ScheduleResultRepository scheduleResultRepository;
    private final ScheduleStatusRepository scheduleStatusRepository;
    private final CourseRepository courseRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final RoomRepository roomRepository;
    private final InstructorRepository instructorRepository;
    private final SectionRepository sectionRepository;
    private final ProgramRepository programmeRepository;

    @Override
    public void generateSchedule(int semester, int year) {
        try {
            System.out.println("Starting schedule generation for semester: " + semester + ", year: " + year);
            updateScheduleStatus(semester, year, "PENDING");

            // Fetch data
            List<Course> courses = courseRepository.findBySemesterAndYear(semester, year);
            List<TimeSlot> timeSlots = timeSlotRepository.findAll();
            List<Room> rooms = roomRepository.findAll();
            List<Instructor> instructors = instructorRepository.findAll();
            List<Program> programmes = programmeRepository.findAll();

            System.out.println("Courses: " + courses.size() + ", TimeSlots: " + timeSlots.size() +
                    ", Rooms: " + rooms.size() + ", Instructors: " + instructors.size() +
                    ", Programmes: " + programmes.size());

            if (courses.isEmpty() || timeSlots.isEmpty() || rooms.isEmpty() || instructors.isEmpty()) {
                System.out.println("Missing data detected");
                updateScheduleStatus(semester, year, "FAILED: Missing data");
                return;
            }

            // Cache sections and programmes
            Map<Long, List<Section>> courseSections = new HashMap<>();
            for (Course course : courses) {
                courseSections.put(course.getId(), sectionRepository.findByCourseId(course.getId()));
            }
            Map<Long, Program> programmeMap = programmes.stream()
                    .collect(Collectors.toMap(Program::getId, p -> p));

            // Validate courses - check instructor assignments
            for (Course course : courses) {
                System.out.println("Validating course: " + course.getCourseCode() + ", instructor_id: " +
                        (course.getInstructor() != null ? course.getInstructor().getId() : "null"));
                if (course.getInstructor() == null) {
                    System.out.println("Course " + course.getCourseCode() + " has no assigned instructor.");
                    updateScheduleStatus(semester, year, "FAILED: Course " + course.getCourseCode() + " has no assigned instructor");
                    return;
                }

                Long instructorId = course.getInstructor().getId();
                boolean instructorExists = instructors.stream()
                        .anyMatch(i -> i.getId().equals(instructorId));

                if (!instructorExists) {
                    System.out.println("Course " + course.getCourseCode() + " has invalid instructor_id: " + instructorId);
                    updateScheduleStatus(semester, year, "FAILED: Invalid instructor_id for course " + course.getCourseCode());
                    return;
                }
            }

            // Track assignments to avoid conflicts
            Map<String, Set<Long>> timeSlotToCourseIds = new HashMap<>();
            Map<String, Set<Long>> timeSlotToInstructorIds = new HashMap<>();
            Map<String, Set<Long>> timeSlotToRoomIds = new HashMap<>();
            List<ScheduleResult> results = new ArrayList<>();
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

            // Shuffle time slots and rooms for better distribution
            Collections.shuffle(timeSlots, new Random());
            Collections.shuffle(rooms, new Random());

            for (Course course : courses) {
                boolean assigned = false;
                Instructor assignedInstructor = course.getInstructor();
                if (assignedInstructor == null) {
                    System.out.println("No instructor found for course: " + course.getCourseCode());
                    updateScheduleStatus(semester, year, "FAILED: No instructor found for course " + course.getCourseCode());
                    return;
                }

                for (TimeSlot timeSlot : timeSlots) {
                    String timeSlotKey = timeSlot.getDay() + ":" +
                            timeSlot.getStartTime().format(timeFormatter) + "-" +
                            timeSlot.getEndTime().format(timeFormatter);

                    // Initialize sets for this time slot if they don't exist
                    timeSlotToCourseIds.computeIfAbsent(timeSlotKey, k -> new HashSet<>());
                    timeSlotToInstructorIds.computeIfAbsent(timeSlotKey, k -> new HashSet<>());
                    timeSlotToRoomIds.computeIfAbsent(timeSlotKey, k -> new HashSet<>());

                    // Skip if instructor is already busy in this time slot
                    if (timeSlotToInstructorIds.get(timeSlotKey).contains(assignedInstructor.getId())) {
                        continue;
                    }

                    // Try to find an available room
                    for (Room room : rooms) {
                        // Skip if room is already booked in this time slot
                        if (timeSlotToRoomIds.get(timeSlotKey).contains(room.getId())) {
                            continue;
                        }

                        // Check room compatibility with course requirements
                        if (course.getRoomSpec() != null && !room.getRoomType().equals(course.getRoomSpec())) {
                            continue;
                        }

                        // Create schedule result
                        ScheduleResult result = new ScheduleResult();
                        result.setCourseCodes(List.of(course.getCourseCode()));
                        result.setTimeSlots(List.of(
                                timeSlot.getDay() + ": " +
                                        timeSlot.getStartTime().format(timeFormatter) + " - " +
                                        timeSlot.getEndTime().format(timeFormatter)
                        ));
                        result.setInstructorNames(List.of(
                                assignedInstructor.getFirstName() + " " + assignedInstructor.getLastName()
                        ));
                        result.setRoomNames(List.of(room.getRoomName()));
                        result.setMessage("Generated for semester " + semester + ", year " + year);
                        result.setSemester(semester);
                        result.setYear(year); // Ensure year is properly set

                        // Mark resources as used
                        timeSlotToCourseIds.get(timeSlotKey).add(course.getId());
                        timeSlotToInstructorIds.get(timeSlotKey).add(assignedInstructor.getId());
                        timeSlotToRoomIds.get(timeSlotKey).add(room.getId());

                        results.add(result);
                        System.out.println("Assigned course " + course.getCourseCode() + " to " +
                                timeSlot.getDay() + " " + timeSlot.getStartTime().format(timeFormatter) +
                                " in " + room.getRoomName());
                        assigned = true;
                        break;
                    }
                    if (assigned) break;
                }

                if (!assigned) {
                    System.out.println("Could not assign course: " + course.getCourseCode() +
                            " - Insufficient time slots or rooms");
                    updateScheduleStatus(semester, year,
                            "FAILED: Insufficient time slots or rooms for course " + course.getCourseCode());
                    return;
                }
            }

            System.out.println("Saving " + results.size() + " schedule results");
            for (ScheduleResult result : results) {
                System.out.println("Saving ScheduleResult: " +
                        "courseCodes=" + result.getCourseCodes() +
                        ", timeSlots=" + result.getTimeSlots() +
                        ", instructorNames=" + result.getInstructorNames() +
                        ", roomNames=" + result.getRoomNames() +
                        ", message=" + result.getMessage() +
                        ", semester=" + result.getSemester() +
                        ", year=" + result.getYear());
            }
            scheduleResultRepository.saveAll(results);
            updateScheduleStatus(semester, year, "COMPLETED");
            System.out.println("Schedule generation completed");
        } catch (Exception e) {
            String errorMessage = "FAILED: " + e.getMessage();
            if (errorMessage.length() > 255) {
                errorMessage = errorMessage.substring(0, 252) + "...";
            }
            System.out.println("Error during schedule generation: " + errorMessage);
            updateScheduleStatus(semester, year, errorMessage);
        }
    }

    @Override
    public String getScheduleStatus(int semester, int year) {
        return scheduleStatusRepository.findBySemesterAndYear(semester, year)
                .map(ScheduleStatus::getStatus)
                .orElse("PENDING");
    }

    @Override
    public List<ScheduleResult> getAllScheduleResults() {
        List<ScheduleResult> allResults = scheduleResultRepository.findAll();
        System.out.println("Total results in DB: " + allResults.size());
        if (!allResults.isEmpty()) {
            ScheduleResult firstResult = allResults.get(0);
            System.out.println("Sample result: semester=" + firstResult.getSemester() +
                    ", year=" + firstResult.getYear() +
                    ", courseCodes=" + firstResult.getCourseCodes());
        }
        return allResults;
    }

    @Override
    public List<ScheduleResult> getAllScheduleResultsBySemesterAndYear(int semester, int year) {
        System.out.println("Searching for schedules with semester=" + semester + ", year=" + year);

        // Debug - Get all results first to see what's in the DB
        List<ScheduleResult> allResults = scheduleResultRepository.findAll();
        System.out.println("Total results in DB: " + allResults.size());

        // Print details of all results
        for (ScheduleResult result : allResults) {
            System.out.println("DB Result: id=" + result.getId() +
                    ", semester=" + result.getSemester() +
                    ", year=" + result.getYear() +
                    ", courseCodes=" + result.getCourseCodes());
        }

        // Try to get the filtered results, accounting for possibly null years in the database
        List<ScheduleResult> results = scheduleResultRepository.findBySemesterAndYearWithNullCheck(semester, year);
        System.out.println("Found " + results.size() + " results for semester=" + semester + ", year=" + year);

        return results;
    }

    @Override
    public List<ScheduleResult> getSchedulesForInstructor() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return scheduleResultRepository.findAll().stream()
                .filter(result -> result.getInstructorNames().stream()
                        .anyMatch(name -> name.contains(username)))
                .toList();
    }

    @Override
    public List<ScheduleResult> getSchedulesForInstructorBySemesterAndYear(int semester, int year) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return scheduleResultRepository.findBySemesterAndYearWithNullCheck(semester, year).stream()
                .filter(result -> result.getInstructorNames().stream()
                        .anyMatch(name -> name.contains(username)))
                .toList();
    }

    @Override
    public List<ScheduleResult> getSchedulesForLoggedInUser() {
        return scheduleResultRepository.findAll();
    }

    @Override
    public List<ScheduleResult> getSchedulesForLoggedInUserBySemesterAndYear(int semester, int year) {
        return scheduleResultRepository.findBySemesterAndYearWithNullCheck(semester, year);
    }

    private void updateScheduleStatus(int semester, int year, String status) {
        Optional<ScheduleStatus> existingStatus = scheduleStatusRepository.findBySemesterAndYear(semester, year);
        ScheduleStatus scheduleStatus;
        if (existingStatus.isPresent()) {
            scheduleStatus = existingStatus.get();
            scheduleStatus.setStatus(status);
        } else {
            scheduleStatus = new ScheduleStatus();
            scheduleStatus.setSemester(semester);
            scheduleStatus.setYear(year);
            scheduleStatus.setStatus(status);
        }
        scheduleStatusRepository.save(scheduleStatus);
    }
}