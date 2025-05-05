package com.itpm.AcademicSchedulerApi.repository;

import com.itpm.AcademicSchedulerApi.model.Course;
import com.itpm.AcademicSchedulerApi.model.Instructor;
import com.itpm.AcademicSchedulerApi.model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    Collection<? extends Schedule> findByCourse(Course course);
}
