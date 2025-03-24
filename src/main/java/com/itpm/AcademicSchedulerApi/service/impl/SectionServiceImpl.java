package com.itpm.AcademicSchedulerApi.service.impl;

import com.itpm.AcademicSchedulerApi.controller.dto.SectionDTO;
import com.itpm.AcademicSchedulerApi.model.Course;
import com.itpm.AcademicSchedulerApi.model.Section;
import com.itpm.AcademicSchedulerApi.repository.CourseRepository;
import com.itpm.AcademicSchedulerApi.repository.SectionRepository;
import com.itpm.AcademicSchedulerApi.service.SectionService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SectionServiceImpl implements SectionService {
    @Autowired
    private  SectionRepository sectionRepository;
    @Autowired
    private  CourseRepository courseRepository;

    public Section createSection(SectionDTO sectionDto) {
        System.out.println(sectionDto.toString());

        Section section = new Section();
        section.setNumberOfClasses(sectionDto.getNumberOfClasses());

        Course course = courseRepository.findByCourseName(sectionDto.getCourseName())
                .orElseThrow(() -> new IllegalArgumentException("Invalid course name: " + sectionDto.getCourseName()));
        section.setCourse(course);

        return sectionRepository.save(section);
    }

    public SectionDTO updateSection(Long id, SectionDTO sectionDTO) {
        Optional<Section> sectionOptional = sectionRepository.findById(id);
        if (sectionOptional.isPresent()) {
            Section section = sectionOptional.get();
            section.setNumberOfClasses(sectionDTO.getNumberOfClasses());

            Optional<Course> course = courseRepository.findByCourseName(sectionDTO.getCourseName());
            if (!course.isPresent()) {
                throw new EntityNotFoundException("Course not found with name: " + sectionDTO.getCourseName());
            }
            section.setCourse(course.get());

            Section updatedSection = sectionRepository.save(section);
            return new SectionDTO(
                    updatedSection.getId(),
                    updatedSection.getNumberOfClasses(),
                    updatedSection.getCourse().getCourseName());
        } else {
            throw new EntityNotFoundException("Section not found with id: " + id);
        }
    }

    public void deleteSection(Long id) {
        sectionRepository.deleteById(id);
    }

    public Section getSectionById(Long id) {
        return sectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Section not found with id: " + id));
    }

    public List<SectionDTO> getAllSections() {
        List<Section> sections = sectionRepository.findAll();
        List<SectionDTO> sectionDTOs = new ArrayList<>();

        for (Section section : sections) {
            Course course = section.getCourse();
            SectionDTO sectionDTO = new SectionDTO(
                    section.getId(),
                    section.getNumberOfClasses(),
                    course != null ? course.getCourseName() : null);
            sectionDTOs.add(sectionDTO);
        }

        return sectionDTOs;
    }
}
