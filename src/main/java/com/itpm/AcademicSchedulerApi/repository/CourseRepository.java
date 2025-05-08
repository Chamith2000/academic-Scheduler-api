package com.itpm.AcademicSchedulerApi.repository;


import com.itpm.AcademicSchedulerApi.model.Course;
import com.itpm.AcademicSchedulerApi.model.Instructor;
import com.itpm.AcademicSchedulerApi.model.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findBySemester(int semester);
    List<Course> findBySemesterAndYear(int semester, int year);
    List<Course> findBySemesterAndYearAndProgram(int semester, int year, Program program);

    Optional<Course> findByCourseName(String courseName);
    Optional<Course> findByCourseCode(String courseCode);
    List<Course> findByInstructor(Instructor instructor);

    @Query("SELECT c FROM Course c WHERE c.instructor.id = :instructorId AND c.semester = :semester AND c.year = :year")
    List<Course> findByInstructorIdAndSemesterAndYear(@Param("instructorId") Long instructorId,
                                                      @Param("semester") int semester,
                                                      @Param("year") int year);

}
