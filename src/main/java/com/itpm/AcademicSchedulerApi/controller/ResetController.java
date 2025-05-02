package com.itpm.AcademicSchedulerApi.controller;

import com.itpm.AcademicSchedulerApi.service.ResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ResetController {

    private final ResetService resetService;

    @PostMapping("/reset")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> reset() {
        resetService.reset();
        return ResponseEntity.ok().build();
    }
}