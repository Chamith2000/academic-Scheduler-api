package com.itpm.AcademicSchedulerApi.service;

import com.itpm.AcademicSchedulerApi.model.ScheduleResult;

import java.util.List;

public interface ScheduleService {
    void generateSchedule(int semester, int year);
    String getScheduleStatus(int semester, int year);
    List<ScheduleResult> getAllScheduleResults();
    List<ScheduleResult> getAllScheduleResultsBySemesterAndYear(int semester, int year);
    List<ScheduleResult> getSchedulesForInstructor();
    List<ScheduleResult> getSchedulesForInstructorBySemesterAndYear(int semester, int year);
    List<ScheduleResult> getSchedulesForLoggedInUser();
    List<ScheduleResult> getSchedulesForLoggedInUserBySemesterAndYear(int semester, int year);
    List<ScheduleResult> getAllSchedulesForInstructor();
}