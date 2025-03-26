package com.itpm.AcademicSchedulerApi.repository;
import com.itpm.AcademicSchedulerApi.model.ScheduleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScheduleStatusRepository extends JpaRepository<ScheduleStatus, Long> {
    Optional<ScheduleStatus> findBySemester(int semester);
    Optional<ScheduleStatus> findTopBySemesterOrderByIdDesc(int semester);
}
