package com.itpm.AcademicSchedulerApi.service;

import com.itpm.AcademicSchedulerApi.controller.dto.CourseDTO;
import com.itpm.AcademicSchedulerApi.model.Course;
import com.itpm.AcademicSchedulerApi.model.Section;

import java.util.List;
import java.util.Optional;

public interface CourseService {

    List<CourseDTO> getAllCourses();

    Optional<Course> getCourseById(Long id);

    Course createCourse(CourseDTO courseDto);

    CourseDTO updateCourse(Long id, CourseDTO courseDTO);

    void deleteCourse(Long id);

    List<Section> getAllSectionsByCourseId(Long courseId);

    Optional<Section> getSectionById(Long id);

    Section createSection(Long courseId, Section section);

    Optional<Section> updateSection(Long id, Section updatedSection);

    void deleteSection(Long id);

    List<CourseDTO> getCoursesWithoutSection();
}