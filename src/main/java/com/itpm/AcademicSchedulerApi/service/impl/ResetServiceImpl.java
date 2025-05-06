package com.itpm.AcademicSchedulerApi.service.impl;

import com.itpm.AcademicSchedulerApi.repository.*;
import com.itpm.AcademicSchedulerApi.service.ResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ResetServiceImpl implements ResetService {

    private final ScheduleRepository scheduleRepository;
    private final ScheduleResultRepository scheduleResultRepository;
    private final ScheduleStatusRepository scheduleStatusRepository;

    @Override
    @Transactional
    public void reset() {
        try {
            // Delete in proper order to respect foreign key constraints
            scheduleRepository.deleteAll();
            scheduleResultRepository.deleteAll();

            // Use native query to delete all status records to avoid JPA issues
            scheduleStatusRepository.deleteAllInBatch();
        } catch (Exception e) {
            // Log the exception
            System.err.println("Error during reset operation: " + e.getMessage());
            // Rethrow as runtime exception
            throw new RuntimeException("Failed to reset database: " + e.getMessage(), e);
        }
    }
}