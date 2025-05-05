package com.itpm.AcademicSchedulerApi.repository;

import com.itpm.AcademicSchedulerApi.model.Course;
import com.itpm.AcademicSchedulerApi.model.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByCourse(Course course);
    List<Section> findByCourseId(Long courseId);
}
