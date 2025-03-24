package com.itpm.AcademicSchedulerApi.service;
import com.itpm.AcademicSchedulerApi.model.ScheduleResult;

import java.util.List;

public interface ScheduleService {
    void generateSchedule(int semester);
    List<ScheduleResult> getSchedulesForLoggedInUser(String username);
    List<ScheduleResult> getSchedulesForInstructor(String username);
    List<ScheduleResult> getAllScheduleResults();
}