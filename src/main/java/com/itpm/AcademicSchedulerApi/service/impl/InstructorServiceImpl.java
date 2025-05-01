package com.itpm.AcademicSchedulerApi.service.impl;

import com.itpm.AcademicSchedulerApi.controller.dto.CourseDTO;
import com.itpm.AcademicSchedulerApi.controller.dto.InstructorDTO;
import com.itpm.AcademicSchedulerApi.controller.dto.InstructorPreferencesDto;
import com.itpm.AcademicSchedulerApi.controller.dto.PreferenceDto;
import com.itpm.AcademicSchedulerApi.exception.ResourceNotFoundException;
import com.itpm.AcademicSchedulerApi.model.*;
import com.itpm.AcademicSchedulerApi.repository.*;
import com.itpm.AcademicSchedulerApi.service.InstructorService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
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
        System.out.println(instructorDto.toString());

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
                .orElseThrow(() -> new IllegalArgumentException("Invalid department name:" + instructorDto.getDeptName()));
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

        User user = instructor.getUser();
        instructorRepository.delete(instructor);
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
}