package com.itpm.AcademicSchedulerApi.service;

import com.itpm.AcademicSchedulerApi.model.ScheduleResult;

import java.util.List;

public interface ScheduleService {
    void generateSchedule(int semester);
    String getScheduleStatus(int semester);
    List<ScheduleResult> getAllScheduleResults();
    List<ScheduleResult> getSchedulesForInstructor();
    List<ScheduleResult> getSchedulesForLoggedInUser();
}