package com.itpm.AcademicSchedulerApi.repository;

import com.itpm.AcademicSchedulerApi.model.ScheduleResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleResultRepository extends JpaRepository<ScheduleResult, Integer> {
    List<ScheduleResult> findBySemester(int semester);
}
