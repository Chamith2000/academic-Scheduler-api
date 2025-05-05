package com.itpm.AcademicSchedulerApi.service.impl;

import com.itpm.AcademicSchedulerApi.controller.dto.CourseDTO;
import com.itpm.AcademicSchedulerApi.controller.dto.InstructorDTO;
import com.itpm.AcademicSchedulerApi.controller.dto.InstructorPreferencesDto;
import com.itpm.AcademicSchedulerApi.controller.dto.PreferenceDto;
import com.itpm.AcademicSchedulerApi.controller.dto.PasswordChangeDTO;
import com.itpm.AcademicSchedulerApi.exception.ResourceNotFoundException;
import com.itpm.AcademicSchedulerApi.model.*;
import com.itpm.AcademicSchedulerApi.repository.*;
import com.itpm.AcademicSchedulerApi.service.InstructorService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springdoc.core.SecurityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor(onConstructor = @__(@Autowired))
public class InstructorServiceImpl implements InstructorService {

    private final InstructorRepository instructorRepository;
    private final DepartmentRepository departmentRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final AuthenticationServiceImpl authenticationService;
    private final ScheduleRepository scheduleRepository;
    private final PasswordEncoder passwordEncoder;
    private final SectionRepository sectionRepository;

    // Existing methods (unchanged)
    public List<InstructorDTO> getAllInstructors() {
        return instructorRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private InstructorDTO convertToDTO(Instructor instructor) {
        InstructorDTO dto = new InstructorDTO();
        dto.setId(instructor.getId());
        dto.setFirstName(instructor.getFirstName());
        dto.setLastName(instructor.getLastName());
        dto.setDeptName(instructor.getDepartment().getName());
        if (instructor.getUser() != null) {
            dto.setUsername(instructor.getUser().getUsername());
            dto.setEmail(instructor.getUser().getEmail());
        }
        return dto;
    }

    public Optional<Instructor> getInstructorById(Long id) {
        return instructorRepository.findById(id);
    }

    @Transactional
    public Instructor createInstructor(InstructorDTO instructorDto) {
        User user = authenticationService.registerInstructorUser(
                instructorDto.getUsername(),
                instructorDto.getPassword(),
                instructorDto.getEmail()
        );
        Instructor instructor = new Instructor();
        instructor.setFirstName(instructorDto.getFirstName());
        instructor.setLastName(instructorDto.getLastName());
        instructor.setUser(user);
        Department department = departmentRepository.findByName(instructorDto.getDeptName())
                .orElseThrow(() -> new IllegalArgumentException("Invalid department name: " + instructorDto.getDeptName()));
        instructor.setDepartment(department);
        return instructorRepository.save(instructor);
    }

    public InstructorDTO updateInstructor(Long id, InstructorDTO instructorDto) {
        Optional<Instructor> instructorOptional = instructorRepository.findById(id);
        if (instructorOptional.isPresent()) {
            Instructor instructor = instructorOptional.get();
            instructor.setFirstName(instructorDto.getFirstName());
            instructor.setLastName(instructorDto.getLastName());
            Department department = departmentRepository.findByName(instructorDto.getDeptName())
                    .orElseThrow(() -> new EntityNotFoundException("Department not found with name: " + instructorDto.getDeptName()));
            instructor.setDepartment(department);
            Instructor updatedInstructor = instructorRepository.save(instructor);
            return new InstructorDTO(updatedInstructor.getFirstName(), updatedInstructor.getLastName(), updatedInstructor.getDepartment().getName());
        } else {
            throw new EntityNotFoundException("Instructor not found with id: " + id);
        }
    }

    @Transactional
    public void deleteInstructor(Long id) {
        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Instructor not found with id: " + id));

        // Handle courses assigned to this instructor
        List<Course> assignedCourses = courseRepository.findByInstructor(instructor);

        // Find all schedules related to this instructor's courses
        List<Schedule> relatedSchedules = new ArrayList<>();
        for (Course course : assignedCourses) {
            relatedSchedules.addAll(scheduleRepository.findByCourse(course));
        }

        // Delete all related schedules first
        if (!relatedSchedules.isEmpty()) {
            scheduleRepository.deleteAll(relatedSchedules);
            scheduleRepository.flush();
        }

        // Find all sections related to this instructor's courses
        List<Section> relatedSections = new ArrayList<>();
        for (Course course : assignedCourses) {
            relatedSections.addAll(sectionRepository.findByCourse(course));
        }

        // Delete all related sections
        if (!relatedSections.isEmpty()) {
            sectionRepository.deleteAll(relatedSections);
            sectionRepository.flush();
        }

        // Update courses to remove instructor reference
        if (!assignedCourses.isEmpty()) {
            for (Course course : assignedCourses) {
                course.setInstructor(null);
            }
            courseRepository.saveAll(assignedCourses);
            courseRepository.flush();
        }

        // Clean up instructor preferences
        instructor.getPreferences().clear();
        instructorRepository.save(instructor);
        instructorRepository.flush();

        // Get the associated user
        User user = instructor.getUser();

        // Delete the instructor
        instructorRepository.delete(instructor);
        instructorRepository.flush();

        // Delete the user if it exists
        if (user != null) {
            userRepository.delete(user);
        }
    }

    public Instructor addPreference(Long instructorId, Long timeslotId) {
        Instructor instructor = instructorRepository.findById(instructorId)
                .orElseThrow(() -> new EntityNotFoundException("Instructor not found with id: " + instructorId));
        TimeSlot timeSlot = timeSlotRepository.findById(timeslotId)
                .orElseThrow(() -> new EntityNotFoundException("Timeslot not found with id: " + timeslotId));
        instructor.getPreferences().add(timeSlot);
        return instructorRepository.save(instructor);
    }

    public InstructorDTO updatePreference(Long instructorId, PreferenceDto preferenceDto) {
        Instructor instructor = instructorRepository.findById(instructorId)
                .orElseThrow(() -> new EntityNotFoundException("Instructor not found with id: " + instructorId));
        TimeSlot timeSlot = timeSlotRepository.findById(preferenceDto.getId())
                .orElseThrow(() -> new EntityNotFoundException("Timeslot not found with id: " + preferenceDto.getId()));
        instructor.getPreferences().removeIf(slot -> slot.getDay().equals(preferenceDto.getDay()) && slot.getStartTime().equals(preferenceDto.getStartTime()));
        instructor.getPreferences().add(timeSlot);
        Instructor updatedInstructor = instructorRepository.save(instructor);
        InstructorDTO instructorDTO = new InstructorDTO();
        instructorDTO.setId(updatedInstructor.getId());
        instructorDTO.setFirstName(updatedInstructor.getFirstName());
        instructorDTO.setLastName(updatedInstructor.getLastName());
        instructorDTO.setDeptName(updatedInstructor.getDepartment().getName());
        if (updatedInstructor.getUser() != null) {
            instructorDTO.setUsername(updatedInstructor.getUser().getUsername());
            instructorDTO.setEmail(updatedInstructor.getUser().getEmail());
        }
        return instructorDTO;
    }

    @Transactional
    public void deletePreference(Long instructorId, Long timeslotId) {
        Instructor instructor = instructorRepository.findById(instructorId)
                .orElseThrow(() -> new EntityNotFoundException("Instructor not found with id: " + instructorId));
        TimeSlot timeSlot = timeSlotRepository.findById(timeslotId)
                .orElseThrow(() -> new EntityNotFoundException("Timeslot not found with id: " + timeslotId));
        instructor.getPreferences().remove(timeSlot);
        instructorRepository.save(instructor);
    }

    public List<InstructorPreferencesDto> getAllInstructorPreferences() {
        return instructorRepository.findAll().stream()
                .filter(instructor -> !instructor.getPreferences().isEmpty())
                .map(instructor -> {
                    InstructorPreferencesDto dto = new InstructorPreferencesDto();
                    dto.setInstructorName(instructor.getFirstName() + " " + instructor.getLastName());
                    dto.setPreferences(instructor.getPreferences().stream().map(timeSlot -> {
                        PreferenceDto preferenceDto = new PreferenceDto(
                                timeSlot.getId(),
                                timeSlot.getDay(),
                                timeSlot.getStartTime(),
                                timeSlot.getEndTime()
                        );
                        return preferenceDto;
                    }).collect(Collectors.toSet()));
                    return dto;
                }).collect(Collectors.toList());
    }

    public InstructorPreferencesDto getInstructorPreferencesByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));
        Instructor instructor = instructorRepository.findByUser(user)
                .orElseThrow(() -> new EntityNotFoundException("Instructor not found for username: " + username));
        InstructorPreferencesDto dto = new InstructorPreferencesDto();
        dto.setInstructorName(instructor.getFirstName() + " " + instructor.getLastName());
        dto.setPreferences(instructor.getPreferences().stream().map(timeSlot -> {
            PreferenceDto preferenceDto = new PreferenceDto(
                    timeSlot.getId(),
                    timeSlot.getDay(),
                    timeSlot.getStartTime(),
                    timeSlot.getEndTime()
            );
            return preferenceDto;
        }).collect(Collectors.toSet()));
        return dto;
    }

    public InstructorDTO getInstructorByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));
        Instructor instructor = instructorRepository.findByUser(user)
                .orElseThrow(() -> new EntityNotFoundException("Instructor not found for username: " + username));
        return convertToDTO(instructor);
    }

    @Override
    public List<CourseDTO> getInstructorCoursesByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        Instructor instructor = instructorRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor", "username", username));
        List<Course> courses = courseRepository.findByInstructor(instructor);
        return courses.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InstructorDTO updateMyProfile(String username, InstructorDTO instructorDTO) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));
        Instructor instructor = instructorRepository.findByUser(user)
                .orElseThrow(() -> new EntityNotFoundException("Instructor not found for username: " + username));
        if (instructorDTO.getFirstName() != null && !instructorDTO.getFirstName().isEmpty()) {
            instructor.setFirstName(instructorDTO.getFirstName());
        }
        if (instructorDTO.getLastName() != null && !instructorDTO.getLastName().isEmpty()) {
            instructor.setLastName(instructorDTO.getLastName());
        }
        if (instructorDTO.getEmail() != null && !instructorDTO.getEmail().isEmpty()) {
            if (!instructorDTO.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                throw new IllegalArgumentException("Invalid email format");
            }
            if (userRepository.findByEmail(instructorDTO.getEmail())
                    .filter(existing -> !existing.getId().equals(user.getId()))
                    .isPresent()) {
                throw new IllegalArgumentException("Email is already in use");
            }
            user.setEmail(instructorDTO.getEmail());
        }
        userRepository.save(user);
        Instructor updatedInstructor = instructorRepository.save(instructor);
        InstructorDTO updatedDTO = new InstructorDTO();
        updatedDTO.setId(updatedInstructor.getId());
        updatedDTO.setFirstName(updatedInstructor.getFirstName());
        updatedDTO.setLastName(updatedInstructor.getLastName());
        updatedDTO.setDeptName(updatedInstructor.getDepartment().getName());
        updatedDTO.setUsername(user.getUsername());
        updatedDTO.setEmail(user.getEmail());
        return updatedDTO;
    }

    @Override
    @Transactional
    public void changeMyPassword(String username, PasswordChangeDTO passwordChangeDTO) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));
        if (!passwordEncoder.matches(passwordChangeDTO.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        if (passwordChangeDTO.getNewPassword() == null || passwordChangeDTO.getNewPassword().isEmpty()) {
            throw new IllegalArgumentException("New password cannot be empty");
        }
        user.setPassword(passwordEncoder.encode(passwordChangeDTO.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public byte[] generateCoursesReportCsv(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));
        Instructor instructor = instructorRepository.findByUser(user)
                .orElseThrow(() -> new EntityNotFoundException("Instructor not found for username: " + username));
        List<Course> courses = courseRepository.findByInstructor(instructor);
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             PrintWriter writer = new PrintWriter(baos)) {
            writer.println("Course Code,Course Name,Year,Semester,Programme,Department,Instructor");
            for (Course course : courses) {
                String programme = course.getProgram() != null ? course.getProgram().getName() : "";
                String department = course.getDepartment() != null ? course.getDepartment().getName() : "";
                String instructorName = instructor.getFirstName() + " " + instructor.getLastName();
                writer.printf(
                        "\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                        escapeCsv(course.getCourseCode()),
                        escapeCsv(course.getCourseName()),
                        course.getYear(),
                        course.getSemester(),
                        escapeCsv(programme),
                        escapeCsv(department),
                        escapeCsv(instructorName)
                );
            }
            writer.flush();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating CSV report", e);
        }
    }

    @Override
    public byte[] generateAvailabilityGapsReportCsv(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));
        Instructor instructor = instructorRepository.findByUser(user)
                .orElseThrow(() -> new EntityNotFoundException("Instructor not found for username: " + username));

        // Get preferred timeslots
        Set<TimeSlot> preferredTimeSlots = instructor.getPreferences();
        // Get scheduled timeslots via courses and schedules
        List<Course> courses = courseRepository.findByInstructor(instructor);
        Set<TimeSlot> scheduledTimeSlots = scheduleRepository.findAll().stream()
                .filter(schedule -> courses.contains(schedule.getCourse()))
                .map(Schedule::getTimeSlot)
                .collect(Collectors.toSet());

        // Find gaps (preferred but not scheduled)
        List<TimeSlot> availabilityGaps = preferredTimeSlots.stream()
                .filter(timeSlot -> !scheduledTimeSlots.contains(timeSlot))
                .sorted(Comparator.comparing(TimeSlot::getDay).thenComparing(TimeSlot::getStartTime))
                .collect(Collectors.toList());

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             PrintWriter writer = new PrintWriter(baos)) {
            writer.println("Day,Time");
            for (TimeSlot gap : availabilityGaps) {
                writer.printf(
                        "\"%s\",\"%s\"\n",
                        escapeCsv(gap.getDay()),
                        escapeCsv(gap.getTime())
                );
            }
            writer.flush();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating availability gaps CSV report", e);
        }
    }

    @Override
    public byte[] generateWorkloadReportCsv(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));
        Instructor instructor = instructorRepository.findByUser(user)
                .orElseThrow(() -> new EntityNotFoundException("Instructor not found for username: " + username));

        List<Course> courses = courseRepository.findByInstructor(instructor);
        List<Schedule> schedules = scheduleRepository.findAll().stream()
                .filter(schedule -> courses.contains(schedule.getCourse()))
                .collect(Collectors.toList());

        // Calculate total hours
        double totalHours = schedules.stream()
                .map(schedule -> Duration.between(
                        schedule.getTimeSlot().getStartTime(),
                        schedule.getTimeSlot().getEndTime()
                ).toHours())
                .mapToDouble(Long::doubleValue)
                .sum();

        // Group courses by semester
        Map<String, List<Course>> coursesBySemester = courses.stream()
                .collect(Collectors.groupingBy(course -> course.getYear() + "-Semester" + course.getSemester()));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             PrintWriter writer = new PrintWriter(baos)) {
            writer.println("Instructor,Total Courses,Total Weekly Hours,Semester,Courses in Semester");
            String instructorName = instructor.getFirstName() + " " + instructor.getLastName();
            for (Map.Entry<String, List<Course>> entry : coursesBySemester.entrySet()) {
                String semester = entry.getKey();
                List<Course> semesterCourses = entry.getValue();
                String courseList = semesterCourses.stream()
                        .map(course -> course.getCourseCode() + ": " + course.getCourseName())
                        .collect(Collectors.joining("; "));
                writer.printf(
                        "\"%s\",\"%d\",\"%.2f\",\"%s\",\"%s\"\n",
                        escapeCsv(instructorName),
                        courses.size(),
                        totalHours,
                        escapeCsv(semester),
                        escapeCsv(courseList)
                );
            }
            writer.flush();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating workload CSV report", e);
        }
    }

    private CourseDTO convertToDTO(Course course) {
        CourseDTO courseDTO = new CourseDTO();
        courseDTO.setId(course.getId());
        courseDTO.setCourseCode(course.getCourseCode());
        courseDTO.setCourseName(course.getCourseName());
        courseDTO.setYear(course.getYear());
        courseDTO.setSemester(course.getSemester());
        courseDTO.setProgrammeName(course.getProgram() != null ? course.getProgram().getName() : null);
        courseDTO.setDeptName(course.getDepartment() != null ? course.getDepartment().getName() : null);
        courseDTO.setInstructorName(course.getInstructor() != null
                ? course.getInstructor().getFirstName() + " " + course.getInstructor().getLastName()
                : null);
        return courseDTO;
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains("\"") || value.contains(",")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}