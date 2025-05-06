package com.itpm.AcademicSchedulerApi.repository;

import com.itpm.AcademicSchedulerApi.model.ScheduleResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ScheduleResultRepository extends JpaRepository<ScheduleResult, Integer> {
    List<ScheduleResult> findBySemester(int semester);

    List<ScheduleResult> findBySemesterAndYear(int semester, int year);

    @Query("SELECT s FROM ScheduleResult s WHERE s.semester = :semester AND (s.year = :year OR s.year IS NULL)")
    List<ScheduleResult> findBySemesterAndYearWithNullCheck(@Param("semester") int semester, @Param("year") int year);

    @Query("SELECT s FROM ScheduleResult s WHERE s.semester = :semester AND s.year = :year")
    List<ScheduleResult> findSchedulesBySemesterAndYear(@Param("semester") int semester, @Param("year") int year);
}