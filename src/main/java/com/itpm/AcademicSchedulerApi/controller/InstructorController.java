package com.itpm.AcademicSchedulerApi.controller;

import com.itpm.AcademicSchedulerApi.controller.dto.CourseDTO;
import com.itpm.AcademicSchedulerApi.controller.dto.InstructorDTO;
import com.itpm.AcademicSchedulerApi.controller.dto.InstructorPreferencesDto;
import com.itpm.AcademicSchedulerApi.controller.dto.PasswordChangeDTO;
import com.itpm.AcademicSchedulerApi.controller.dto.PreferenceDto;
import com.itpm.AcademicSchedulerApi.model.Instructor;
import com.itpm.AcademicSchedulerApi.service.InstructorService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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

    // Existing endpoints (unchanged)
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

    @DeleteMapping("/{instructorId}/preferences/{timeslotId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Void> deletePreference(@PathVariable Long instructorId, @PathVariable Long timeslotId) {
        instructorService.deletePreference(instructorId, timeslotId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/preferences")
    public ResponseEntity<List<InstructorPreferencesDto>> getAllPreferences() {
        List<InstructorPreferencesDto> preferences = instructorService.getAllInstructorPreferences();
        return new ResponseEntity<>(preferences, HttpStatus.OK);
    }

    @GetMapping("/me/preferences")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<InstructorPreferencesDto> getMyPreferences(Authentication authentication) {
        String username = authentication.getName();
        InstructorPreferencesDto preferences = instructorService.getInstructorPreferencesByUsername(username);
        return new ResponseEntity<>(preferences, HttpStatus.OK);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<InstructorDTO> getMyDetails(Authentication authentication) {
        String username = authentication.getName();
        InstructorDTO instructor = instructorService.getInstructorByUsername(username);
        return new ResponseEntity<>(instructor, HttpStatus.OK);
    }

    @GetMapping("/courses")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<List<CourseDTO>> getInstructorCourses(Authentication authentication) {
        String username = authentication.getName();
        List<CourseDTO> courses = instructorService.getInstructorCoursesByUsername(username);
        return new ResponseEntity<>(courses, HttpStatus.OK);
    }

    @PutMapping("/me")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<?> updateMyProfile(@RequestBody InstructorDTO instructorDTO, Authentication authentication) {
        try {
            String username = authentication.getName();
            InstructorDTO updatedInstructor = instructorService.updateMyProfile(username, instructorDTO);
            return new ResponseEntity<>(updatedInstructor, HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/me/password")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<?> changeMyPassword(@RequestBody PasswordChangeDTO passwordChangeDTO, Authentication authentication) {
        try {
            String username = authentication.getName();
            instructorService.changeMyPassword(username, passwordChangeDTO);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/me/reports/courses")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<Resource> downloadCoursesReport(Authentication authentication) {
        try {
            String username = authentication.getName();
            byte[] csvData = instructorService.generateCoursesReportCsv(username);
            ByteArrayResource resource = new ByteArrayResource(csvData);

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=courses_report.csv");
            headers.add(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate");
            headers.add(HttpHeaders.PRAGMA, "no-cache");
            headers.add(HttpHeaders.EXPIRES, "0");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(csvData.length)
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(resource);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/me/reports/availability-gaps")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<Resource> downloadAvailabilityGapsReport(Authentication authentication) {
        try {
            String username = authentication.getName();
            byte[] csvData = instructorService.generateAvailabilityGapsReportCsv(username);
            ByteArrayResource resource = new ByteArrayResource(csvData);

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=availability_gaps_report.csv");
            headers.add(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate");
            headers.add(HttpHeaders.PRAGMA, "no-cache");
            headers.add(HttpHeaders.EXPIRES, "0");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(csvData.length)
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(resource);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/me/reports/workload")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<Resource> downloadWorkloadReport(Authentication authentication) {
        try {
            String username = authentication.getName();
            byte[] csvData = instructorService.generateWorkloadReportCsv(username);
            ByteArrayResource resource = new ByteArrayResource(csvData);

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=workload_report.csv");
            headers.add(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate");
            headers.add(HttpHeaders.PRAGMA, "no-cache");
            headers.add(HttpHeaders.EXPIRES, "0");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(csvData.length)
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(resource);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}