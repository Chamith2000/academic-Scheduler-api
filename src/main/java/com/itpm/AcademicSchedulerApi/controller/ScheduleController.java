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
        scheduleService.generateSchedule(semester);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> getScheduleStatus(@RequestParam int semester) {
        return ResponseEntity.ok(scheduleService.getScheduleStatus(semester));
    }

    @GetMapping("/timetables")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<ScheduleResult>> getAllScheduleResults() {
        return ResponseEntity.ok(scheduleService.getAllScheduleResults());
    }

    @GetMapping("/instructor")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public ResponseEntity<List<ScheduleResult>> getSchedulesForInstructor() {
        return ResponseEntity.ok(scheduleService.getSchedulesForInstructor());
    }

    @GetMapping("/myTimetable")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<List<ScheduleResult>> getSchedulesForLoggedInUser() {
        return ResponseEntity.ok(scheduleService.getSchedulesForLoggedInUser());
    }
}