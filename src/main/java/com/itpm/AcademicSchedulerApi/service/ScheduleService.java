package com.itpm.AcademicSchedulerApi.service;

import com.itpm.AcademicSchedulerApi.model.ScheduleResult;

import java.util.List;

public interface ScheduleService {
    void generateSchedule(int semester);
    String getScheduleStatus(int semester);
    List<ScheduleResult> getAllScheduleResults();
    List<ScheduleResult> getAllScheduleResultsBySemester(int semester);
    List<ScheduleResult> getSchedulesForInstructor();
    List<ScheduleResult> getSchedulesForInstructorBySemester(int semester);
    List<ScheduleResult> getSchedulesForLoggedInUser();
    List<ScheduleResult> getSchedulesForLoggedInUserBySemester(int semester);
}