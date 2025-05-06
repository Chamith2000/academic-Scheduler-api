package com.itpm.AcademicSchedulerApi.controller;

import com.itpm.AcademicSchedulerApi.model.ScheduleResult;
import com.itpm.AcademicSchedulerApi.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping("/generate")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> generateSchedule(@RequestParam int semester, @RequestParam int year) {
        if (semester < 1 || semester > 2) {
            return ResponseEntity.badRequest().build();
        }
        scheduleService.generateSchedule(semester, year);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> getScheduleStatus(@RequestParam int semester, @RequestParam int year) {
        if (semester < 1 || semester > 2) {
            return ResponseEntity.badRequest().body("Invalid semester value");
        }
        return ResponseEntity.ok(scheduleService.getScheduleStatus(semester, year));
    }

    @GetMapping("/timetables")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<ScheduleResult>> getAllScheduleResults(@RequestParam int semester, @RequestParam int year) {
        System.out.println("Controller: Getting timetables for semester=" + semester + ", year=" + year);

        if (semester < 1 || semester > 2) {
            System.out.println("Controller: Invalid semester value " + semester);
            return ResponseEntity.badRequest().body(null);
        }

        // Debug - Get all results first to check what's in the DB
        List<ScheduleResult> allResults = scheduleService.getAllScheduleResults();
        System.out.println("Controller: Total results in DB: " + allResults.size());

        List<ScheduleResult> results = scheduleService.getAllScheduleResultsBySemesterAndYear(semester, year);
        System.out.println("Controller: Returning " + results.size() + " results");

        return ResponseEntity.ok(results);
    }

    @GetMapping("/instructor")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<List<ScheduleResult>> getSchedulesForInstructor(@RequestParam int semester, @RequestParam int year) {
        if (semester < 1 || semester > 2) {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok(scheduleService.getSchedulesForInstructorBySemesterAndYear(semester, year));
    }

    @GetMapping("/myTimetable")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<List<ScheduleResult>> getSchedulesForLoggedInUser(@RequestParam int semester, @RequestParam int year) {
        if (semester < 1 || semester > 2) {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok(scheduleService.getSchedulesForLoggedInUserBySemesterAndYear(semester, year));
    }

    // Debug endpoint - Get all schedule results regardless of semester/year
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<ScheduleResult>> getAllSchedules() {
        List<ScheduleResult> results = scheduleService.getAllScheduleResults();
        System.out.println("Debug endpoint: Found " + results.size() + " total results");
        return ResponseEntity.ok(results);
    }
}