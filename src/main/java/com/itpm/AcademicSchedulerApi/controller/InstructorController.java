package com.itpm.AcademicSchedulerApi.controller;

import com.itpm.AcademicSchedulerApi.controller.dto.InstructorDTO;
import com.itpm.AcademicSchedulerApi.controller.dto.InstructorPreferencesDto;
import com.itpm.AcademicSchedulerApi.controller.dto.PreferenceDto;
import com.itpm.AcademicSchedulerApi.model.Instructor;
import com.itpm.AcademicSchedulerApi.service.InstructorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/instructors")
public class InstructorController {

    private final InstructorService instructorService;

    @Autowired
    public InstructorController(InstructorService instructorService) {
        this.instructorService = instructorService;
    }

    @GetMapping
    public ResponseEntity<List<InstructorDTO>> getAllInstructors() {
        List<InstructorDTO> instructors = instructorService.getAllInstructors();
        return new ResponseEntity<>(instructors, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Instructor> getInstructorById(@PathVariable Long id) {
        Optional<Instructor> instructor = instructorService.getInstructorById(id);
        return instructor.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Instructor> createInstructor(@RequestBody InstructorDTO instructorDto) {
        Instructor createdInstructor = instructorService.createInstructor(instructorDto);
        return new ResponseEntity<>(createdInstructor, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<InstructorDTO> updateInstructor(@PathVariable Long id, @RequestBody InstructorDTO instructorDto) {
        try {
            InstructorDTO updatedInstructor = instructorService.updateInstructor(id, instructorDto);
            return new ResponseEntity<>(updatedInstructor, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteInstructor(@PathVariable Long id) {
        instructorService.deleteInstructor(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{instructorId}/preferences")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Instructor> addPreference(@PathVariable Long instructorId, @RequestParam Long timeslotId) {
        Instructor instructor = instructorService.addPreference(instructorId, timeslotId);
        return new ResponseEntity<>(instructor, HttpStatus.OK);
    }

    @PutMapping("/{instructorId}/preferences")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<InstructorDTO> updatePreference(@PathVariable Long instructorId, @RequestBody PreferenceDto preferenceDto) {
        InstructorDTO instructorDTO = instructorService.updatePreference(instructorId, preferenceDto);
        return new ResponseEntity<>(instructorDTO, HttpStatus.OK);
    }

    @GetMapping("/preferences")
    public ResponseEntity<List<InstructorPreferencesDto>> getAllPreferences() {
        List<InstructorPreferencesDto> preferences = instructorService.getAllInstructorPreferences();
        return new ResponseEntity<>(preferences, HttpStatus.OK);
    }
}