package com.itpm.AcademicSchedulerApi.service.impl;

import com.itpm.AcademicSchedulerApi.repository.*;
import com.itpm.AcademicSchedulerApi.service.ResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ResetServiceImpl implements ResetService {

    private final ScheduleRepository scheduleRepository;
    private final ScheduleResultRepository scheduleResultRepository;
    private final ScheduleStatusRepository scheduleStatusRepository;

    @Override
    public void reset() {
        scheduleRepository.deleteAll();
        scheduleResultRepository.deleteAll();
        scheduleStatusRepository.deleteAll();
    }
}