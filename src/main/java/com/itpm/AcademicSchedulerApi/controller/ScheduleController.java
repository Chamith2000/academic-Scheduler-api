package com.itpm.AcademicSchedulerApi.controller;

import com.itpm.AcademicSchedulerApi.model.ScheduleResult;
import com.itpm.AcademicSchedulerApi.model.ScheduleStatus;
import com.itpm.AcademicSchedulerApi.repository.ScheduleStatusRepository;
import com.itpm.AcademicSchedulerApi.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;
    private final ScheduleStatusRepository scheduleStatusRepository;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/generate")
    public ResponseEntity<Void> generateSchedule(@RequestParam int semester) {
        try {
            scheduleService.generateSchedule(semester);
            return new ResponseEntity<>(HttpStatus.ACCEPTED); // Return 202 (Accepted) status
        } catch (Exception e) {
            // Log the error message
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/status")
    public ResponseEntity<String> getScheduleGenerationStatus(@RequestParam int semester) {
        Optional<ScheduleStatus> scheduleStatus = scheduleStatusRepository.findTopBySemesterOrderByIdDesc(semester);
        if (scheduleStatus.isPresent()) {
            return new ResponseEntity<>(scheduleStatus.get().getStatus(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>("PENDING", HttpStatus.OK);
        }
    }

    @PreAuthorize("hasAuthority('STUDENT')")
    @GetMapping("/myTimetable")
    public ResponseEntity<List<ScheduleResult>> getSchedulesForLoggedInUser(Principal principal) {
        try {
            List<ScheduleResult> scheduleResults = scheduleService.getSchedulesForLoggedInUser(principal.getName());
            if (scheduleResults.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(scheduleResults, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    @GetMapping("/instructor")
    public ResponseEntity<List<ScheduleResult>> getSchedulesForInstructor(Principal principal) {
        try {
            List<ScheduleResult> scheduleResults = scheduleService.getSchedulesForInstructor(principal.getName());
            if (scheduleResults.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(scheduleResults, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/timetables")
    public ResponseEntity<List<ScheduleResult>> getGeneratedSchedules() {
        try {
            List<ScheduleResult> scheduleResults = scheduleService.getAllScheduleResults();
            return new ResponseEntity<>(scheduleResults, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
