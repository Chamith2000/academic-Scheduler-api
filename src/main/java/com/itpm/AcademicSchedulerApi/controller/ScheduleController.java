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
    public ResponseEntity<Void> generateSchedule(@RequestParam int semester) {
        if (semester < 1 || semester > 2) {
            return ResponseEntity.badRequest().build();
        }
        scheduleService.generateSchedule(semester);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> getScheduleStatus(@RequestParam int semester) {
        if (semester < 1 || semester > 2) {
            return ResponseEntity.badRequest().body("Invalid semester value");
        }
        return ResponseEntity.ok(scheduleService.getScheduleStatus(semester));
    }

    @GetMapping("/timetables")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<ScheduleResult>> getAllScheduleResults(@RequestParam int semester) {
        if (semester < 1 || semester > 2) {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok(scheduleService.getAllScheduleResultsBySemester(semester));
    }

    @GetMapping("/instructor")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<List<ScheduleResult>> getSchedulesForInstructor(@RequestParam int semester) {
        if (semester < 1 || semester > 2) {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok(scheduleService.getSchedulesForInstructorBySemester(semester));
    }

    @GetMapping("/myTimetable")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<List<ScheduleResult>> getSchedulesForLoggedInUser(@RequestParam int semester) {
        if (semester < 1 || semester > 2) {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok(scheduleService.getSchedulesForLoggedInUserBySemester(semester));
    }
}