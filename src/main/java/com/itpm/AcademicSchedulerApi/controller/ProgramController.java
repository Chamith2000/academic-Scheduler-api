package com.itpm.AcademicSchedulerApi.controller;

import com.itpm.AcademicSchedulerApi.controller.request.ProgramEnrollmentDTO;
import com.itpm.AcademicSchedulerApi.controller.request.ProgrammeDTO;
import com.itpm.AcademicSchedulerApi.model.*;
import com.itpm.AcademicSchedulerApi.service.ProgramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/programs")
public class ProgramController {

    private final ProgramService programService;

    @Autowired
    public ProgramController(ProgramService programService) {
        this.programService = programService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STUDENT')")
    public ResponseEntity<List<ProgrammeDTO>> getAllPrograms() {
        List<ProgrammeDTO> programDTOs = programService.getAllPrograms();
        return new ResponseEntity<>(programDTOs, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Program> createProgram(@RequestBody ProgrammeDTO programmeDto) {
        Program savedProgram = programService.createProgramme(programmeDto);
        return new ResponseEntity<>(savedProgram, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STUDENT')")
    public ResponseEntity<Program> getProgramById(@PathVariable("id") Long id) {
        Program program = programService.getProgramById(id);
        return new ResponseEntity<>(program, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ProgrammeDTO> updateProgram(@PathVariable("id") Long id, @RequestBody ProgrammeDTO programmeDTO) {
        ProgrammeDTO updatedProgramDTO = programService.updateProgram(id, programmeDTO);
        return new ResponseEntity<>(updatedProgramDTO, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteProgram(@PathVariable("id") Long id) {
        programService.deleteProgramById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/enroll")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ProgramEnrollment> enrollInProgram(@RequestBody ProgramEnrollmentDTO enrollmentDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        Student student = user.getStudent();
        if (student == null) {
            throw new RuntimeException("No student profile found for user");
        }
        ProgramEnrollment enrollment = programService.enrollStudentInProgram(student.getId(), enrollmentDTO);
        return new ResponseEntity<>(enrollment, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/courses")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STUDENT')")
    public ResponseEntity<List<Course>> getCoursesByProgram(@PathVariable("id") Long id) {
        List<Course> courses = programService.getCoursesByProgramId(id);
        return new ResponseEntity<>(courses, HttpStatus.OK);
    }
}