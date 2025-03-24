package com.itpm.AcademicSchedulerApi.repository;


import com.itpm.AcademicSchedulerApi.model.Course;
import com.itpm.AcademicSchedulerApi.model.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findBySemester(int semester);
    List<Course> findBySemesterAndYearAndProgram(int semester, int year, Program program);

    Optional<Course> findByCourseName(String courseName);

}
