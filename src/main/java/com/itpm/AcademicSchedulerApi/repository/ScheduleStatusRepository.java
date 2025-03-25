package com.itpm.AcademicSchedulerApi.repository;

import com.itpm.AcademicSchedulerApi.model.ScheduleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ScheduleStatusRepository extends JpaRepository<ScheduleStatus, Long> {
    Optional<ScheduleStatus> findTopBySemesterOrderByIdDesc(int semester);
}
