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
        List<ScheduleResult> allResults = scheduleService.getAllScheduleResults();
        System.out.println("Controller: Total results in DB: " + allResults.size());
        List<ScheduleResult> results = scheduleService.getAllScheduleResultsBySemesterAndYear(semester, year);
        System.out.println("Controller: Returning " + results.size() + " results");
        return ResponseEntity.ok(results);
    }

    @GetMapping("/instructor")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<?> getSchedulesForInstructor(@RequestParam int semester, @RequestParam int year) {
        try {
            if (semester < 1 || semester > 2) {
                return ResponseEntity.badRequest().body("Invalid semester value: must be 1 or 2");
            }
            List<ScheduleResult> schedules = scheduleService.getSchedulesForInstructorBySemesterAndYear(semester, year);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            System.out.println("Error in getSchedulesForInstructor: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    @GetMapping("/instructor/all")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<?> getAllSchedulesForInstructor() {
        try {
            List<ScheduleResult> schedules = scheduleService.getAllSchedulesForInstructor();
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            System.out.println("Error in getAllSchedulesForInstructor: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    @GetMapping("/myTimetable")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<?> getSchedulesForLoggedInUser(@RequestParam int semester, @RequestParam int year) {
        try {
            if (semester < 1 || semester > 2) {
                return ResponseEntity.badRequest().body("Invalid semester value: must be 1 or 2");
            }
            List<ScheduleResult> schedules = scheduleService.getSchedulesForLoggedInUserBySemesterAndYear(semester, year);
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            System.out.println("Error in getSchedulesForLoggedInUser: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<ScheduleResult>> getAllSchedules() {
        List<ScheduleResult> results = scheduleService.getAllScheduleResults();
        System.out.println("Debug endpoint: Found " + results.size() + " total results");
        return ResponseEntity.ok(results);
    }
}