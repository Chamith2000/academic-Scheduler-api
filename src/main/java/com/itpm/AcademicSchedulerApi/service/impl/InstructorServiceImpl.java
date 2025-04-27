package com.itpm.AcademicSchedulerApi.service.impl;

import com.itpm.AcademicSchedulerApi.controller.dto.InstructorDTO;
import com.itpm.AcademicSchedulerApi.controller.dto.InstructorPreferencesDto;
import com.itpm.AcademicSchedulerApi.controller.dto.PreferenceDto;
import com.itpm.AcademicSchedulerApi.model.Department;
import com.itpm.AcademicSchedulerApi.model.Instructor;
import com.itpm.AcademicSchedulerApi.model.TimeSlot;
import com.itpm.AcademicSchedulerApi.model.User;
import com.itpm.AcademicSchedulerApi.repository.DepartmentRepository;
import com.itpm.AcademicSchedulerApi.repository.InstructorRepository;
import com.itpm.AcademicSchedulerApi.repository.TimeSlotRepository;
import com.itpm.AcademicSchedulerApi.repository.UserRepository;
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

        // Create user account for the instructor
        User user = authenticationService.registerInstructorUser(
                instructorDto.getUsername(),
                instructorDto.getPassword(),
                instructorDto.getEmail()
        );

        // Create instructor entity
        Instructor instructor = new Instructor();
        instructor.setFirstName(instructorDto.getFirstName());
        instructor.setLastName(instructorDto.getLastName());
        instructor.setUser(user); // Link instructor to user

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

            // Look up the Department by its name.
            Department department = departmentRepository.findByName(instructorDto.getDeptName())
                    .orElseThrow(() -> new EntityNotFoundException("Department not found with name: " + instructorDto.getDeptName()));

            // Set the Department on the Instructor.
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

        // Get the user associated with this instructor
        User user = instructor.getUser();

        // First remove the instructor
        instructorRepository.delete(instructor);

        // Then remove the associated user if it exists
        if (user != null) {
            // You'll need to inject UserRepository
            userRepository.delete(user);
        }
    }

    public Instructor addPreference(Long instructorId, Long timeslotId) {
        // Fetch the instructor by id
        Instructor instructor = instructorRepository.findById(instructorId)
                .orElseThrow(() -> new EntityNotFoundException("Instructor not found with id: " + instructorId));

        // Fetch the timeslot by id
        TimeSlot timeSlot = timeSlotRepository.findById(timeslotId)
                .orElseThrow(() -> new EntityNotFoundException("Timeslot not found with id: " + timeslotId));

        // Add the timeslot to the instructor's preferences
        instructor.getPreferences().add(timeSlot);

        // Save the instructor and return
        return instructorRepository.save(instructor);
    }

    public InstructorDTO updatePreference(Long instructorId, PreferenceDto preferenceDto) {
        Instructor instructor = instructorRepository.findById(instructorId)
                .orElseThrow(() -> new EntityNotFoundException("Instructor not found with id: " + instructorId));

        TimeSlot timeSlot = timeSlotRepository.findByDayAndStartTime(preferenceDto.getDay(), preferenceDto.getStartTime())
                .orElseThrow(() -> new EntityNotFoundException("Timeslot not found for day: " + preferenceDto.getDay() + ", startTime: " + preferenceDto.getStartTime()));

        // Remove the existing timeslot for the specified day and start time if exists
        instructor.getPreferences().removeIf(slot -> slot.getDay().equals(preferenceDto.getDay()) && slot.getStartTime().equals(preferenceDto.getStartTime()));

        // Add the new timeslot to the instructor's preferences
        instructor.getPreferences().add(timeSlot);

        Instructor updatedInstructor = instructorRepository.save(instructor);

        // convert to DTO and return
        InstructorDTO instructorDTO = new InstructorDTO();
        // set DTO fields based on updatedInstructor
        return instructorDTO;
    }

    public List<InstructorPreferencesDto> getAllInstructorPreferences() {
        return instructorRepository.findAll().stream()
                .filter(instructor -> !instructor.getPreferences().isEmpty())
                .map(instructor -> {
                    InstructorPreferencesDto dto = new InstructorPreferencesDto();
                    dto.setInstructorName(instructor.getFirstName() + " " + instructor.getLastName());
                    dto.setPreferences(instructor.getPreferences().stream().map(timeSlot -> {
                        PreferenceDto preferenceDto = new PreferenceDto(timeSlot.getDay(), timeSlot.getStartTime());
                        preferenceDto.setId(timeSlot.getId());
                        return preferenceDto;
                    }).collect(Collectors.toSet()));
                    return dto;
                }).collect(Collectors.toList());
    }
}