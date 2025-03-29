package com.itpm.AcademicSchedulerApi.controller;


import com.itpm.AcademicSchedulerApi.controller.dto.InstructorDTO;
import com.itpm.AcademicSchedulerApi.controller.dto.InstructorPreferencesDto;
import com.itpm.AcademicSchedulerApi.controller.dto.PreferenceDto;
import com.itpm.AcademicSchedulerApi.model.Instructor;
import com.itpm.AcademicSchedulerApi.service.InstructorService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instructors")
public class InstructorController {

    private final InstructorService instructorService;

    @Autowired
    public InstructorController(InstructorService instructorService) {
        this.instructorService = instructorService;
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public ResponseEntity<Instructor> createInstructor(@RequestBody InstructorDTO instructorDto) {
        Instructor savedInstructor = instructorService.createInstructor(instructorDto);
        return new ResponseEntity<>(savedInstructor, HttpStatus.CREATED);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<InstructorDTO> updateInstructor(@PathVariable Long id, @RequestBody InstructorDTO instructorDto) {
        InstructorDTO updatedInstructorDto = instructorService.updateInstructor(id, instructorDto);
        return new ResponseEntity<>(updatedInstructorDto, HttpStatus.OK);
    }



    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstructor(@PathVariable Long id) {
        instructorService.deleteInstructor(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    @PostMapping("/{instructorId}/preferences/{timeslotId}")
    public ResponseEntity<Instructor> addPreference(@PathVariable Long instructorId, @PathVariable Long timeslotId) {
        Instructor instructor = instructorService.addPreference(instructorId, timeslotId);
        return ResponseEntity.ok(instructor);
    }

    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    @PutMapping("/{instructorId}/preferences")
    public ResponseEntity<InstructorDTO> updatePreference(@PathVariable Long instructorId, @RequestBody PreferenceDto preferenceDto) {
        InstructorDTO instructorDto = instructorService.updatePreference(instructorId, preferenceDto);
        return ResponseEntity.ok(instructorDto);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'INSTRUCTOR')")
    @GetMapping("/{id}")
    public ResponseEntity<Instructor> getInstructorById(@PathVariable Long id) {
        Instructor instructor = instructorService.getInstructorById(id).orElseThrow(() -> new EntityNotFoundException("Instructor not found with id: " + id));
        return new ResponseEntity<>(instructor, HttpStatus.OK);
    }


    @PreAuthorize("hasAnyAuthority('ADMIN', 'INSTRUCTOR')")
    @GetMapping
    public ResponseEntity<List<InstructorDTO>> getAllInstructors() {
        List<InstructorDTO> instructors = instructorService.getAllInstructors();
        return new ResponseEntity<>(instructors, HttpStatus.OK);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'INSTRUCTOR')")
    @GetMapping("/preferences")
    public List<InstructorPreferencesDto> getAllInstructorPreferences() {
        return instructorService.getAllInstructorPreferences();
    }

}
