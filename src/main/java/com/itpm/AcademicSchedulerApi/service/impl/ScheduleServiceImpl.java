package com.itpm.AcademicSchedulerApi.service.impl;

import com.itpm.AcademicSchedulerApi.model.*;
import com.itpm.AcademicSchedulerApi.repository.*;
import com.itpm.AcademicSchedulerApi.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;

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

    @Override
    public void generateSchedule(int semester) {
        try {
            System.out.println("Starting schedule generation for semester: " + semester);
            updateScheduleStatus(semester, "PENDING");

            // Fetch data
            List<Course> courses = courseRepository.findBySemester(semester);
            List<TimeSlot> timeSlots = timeSlotRepository.findAll();
            List<Room> rooms = roomRepository.findAll();
            List<Instructor> instructors = instructorRepository.findAll();

            System.out.println("Courses: " + courses.size() + ", TimeSlots: " + timeSlots.size() +
                    ", Rooms: " + rooms.size() + ", Instructors: " + instructors.size());

            if (courses.isEmpty() || timeSlots.isEmpty() || rooms.isEmpty() || instructors.isEmpty()) {
                System.out.println("Missing data detected");
                updateScheduleStatus(semester, "FAILED: Missing data");
                return;
            }

            // Track assignments to avoid conflicts
            Map<String, Set<Long>> timeSlotToCourseIds = new HashMap<>(); // timeSlot -> courseIds
            Map<String, Set<Long>> timeSlotToInstructorIds = new HashMap<>(); // timeSlot -> instructorIds
            Map<String, Set<Long>> timeSlotToRoomIds = new HashMap<>(); // timeSlot -> roomIds
            List<ScheduleResult> results = new ArrayList<>();
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

            // Shuffle time slots and rooms to distribute assignments
            Collections.shuffle(timeSlots, new Random());
            Collections.shuffle(rooms, new Random());

            for (Course course : courses) {
                boolean assigned = false;
                // Try each time slot
                for (TimeSlot timeSlot : timeSlots) {
                    String timeSlotKey = timeSlot.getDay() + ":" +
                            timeSlot.getStartTime().format(timeFormatter) + "-" +
                            timeSlot.getEndTime().format(timeFormatter);

                    // Initialize maps if not present
                    timeSlotToCourseIds.computeIfAbsent(timeSlotKey, k -> new HashSet<>());
                    timeSlotToInstructorIds.computeIfAbsent(timeSlotKey, k -> new HashSet<>());
                    timeSlotToRoomIds.computeIfAbsent(timeSlotKey, k -> new HashSet<>());

                    // Find the instructor for this course
                    Instructor assignedInstructor = instructors.stream()
                            .filter(i -> i.getId().equals(course.getId()))
                            .findFirst()
                            .orElse(null);

                    if (assignedInstructor == null) {
                        System.out.println("No instructor found for course: " + course.getCourseCode());
                        continue;
                    }

                    // Check if instructor is available in this time slot
                    if (timeSlotToInstructorIds.get(timeSlotKey).contains(assignedInstructor.getId())) {
                        continue; // Instructor already assigned in this slot
                    }

                    // Find an available room
                    for (Room room : rooms) {
                        if (timeSlotToRoomIds.get(timeSlotKey).contains(room.getId())) {
                            continue; // Room already assigned in this slot
                        }

                        // Assign the course
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
                        result.setMessage("Generated for semester " + semester);

                        // Update tracking maps
                        timeSlotToCourseIds.get(timeSlotKey).add(course.getId());
                        timeSlotToInstructorIds.get(timeSlotKey).add(assignedInstructor.getId());
                        timeSlotToRoomIds.get(timeSlotKey).add(room.getId());

                        results.add(result);
                        assigned = true;
                        break;
                    }
                    if (assigned) break;
                }
                if (!assigned) {
                    System.out.println("Could not assign course: " + course.getCourseCode());
                    updateScheduleStatus(semester, "FAILED: Insufficient time slots or rooms");
                    return;
                }
            }

            System.out.println("Saving " + results.size() + " schedule results");
            scheduleResultRepository.saveAll(results);
            updateScheduleStatus(semester, "COMPLETED");
            System.out.println("Schedule generation completed");
        } catch (Exception e) {
            String errorMessage = "FAILED: " + e.getMessage();
            if (errorMessage.length() > 255) {
                errorMessage = errorMessage.substring(0, 252) + "...";
            }
            System.out.println("Error during schedule generation: " + errorMessage);
            updateScheduleStatus(semester, errorMessage);
        }
    }

    @Override
    public String getScheduleStatus(int semester) {
        return scheduleStatusRepository.findBySemester(semester)
                .map(ScheduleStatus::getStatus)
                .orElse("PENDING");
    }

    @Override
    public List<ScheduleResult> getAllScheduleResults() {
        return scheduleResultRepository.findAll();
    }

    @Override
    public List<ScheduleResult> getSchedulesForInstructor() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return scheduleResultRepository.findAll().stream()
                .filter(result -> result.getInstructorNames().contains(username))
                .toList();
    }

    @Override
    public List<ScheduleResult> getSchedulesForLoggedInUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return scheduleResultRepository.findAll(); // Replace with student-specific logic
    }

    private void updateScheduleStatus(int semester, String status) {
        Optional<ScheduleStatus> existingStatus = scheduleStatusRepository.findBySemester(semester);
        ScheduleStatus scheduleStatus;
        if (existingStatus.isPresent()) {
            scheduleStatus = existingStatus.get();
            scheduleStatus.setStatus(status);
        } else {
            scheduleStatus = new ScheduleStatus();
            scheduleStatus.setSemester(semester);
            scheduleStatus.setStatus(status);
        }
        scheduleStatusRepository.save(scheduleStatus);
    }
}