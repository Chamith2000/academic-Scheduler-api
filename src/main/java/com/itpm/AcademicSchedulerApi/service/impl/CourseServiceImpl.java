package com.itpm.AcademicSchedulerApi.service.impl;

import com.itpm.AcademicSchedulerApi.controller.dto.CourseDTO;
import com.itpm.AcademicSchedulerApi.exception.ResourceNotFoundException;
import com.itpm.AcademicSchedulerApi.exception.ValidationException;
import com.itpm.AcademicSchedulerApi.exception.OperationFailedException;
import com.itpm.AcademicSchedulerApi.model.*;
import com.itpm.AcademicSchedulerApi.repository.*;
import com.itpm.AcademicSchedulerApi.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;
    private final ProgramRepository programRepository;
    private final DepartmentRepository departmentRepository;
    private final InstructorRepository instructorRepository;

    @Autowired
    public CourseServiceImpl(CourseRepository courseRepository, SectionRepository sectionRepository, ProgramRepository programRepository, DepartmentRepository departmentRepository, InstructorRepository instructorRepository) {
        this.courseRepository = courseRepository;
        this.sectionRepository = sectionRepository;
        this.programRepository = programRepository;
        this.departmentRepository = departmentRepository;
        this.instructorRepository = instructorRepository;
    }

    @Override
    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private CourseDTO convertToDTO(Course course) {
        CourseDTO courseDTO = new CourseDTO();
        courseDTO.setId(course.getId());
        courseDTO.setCourseCode(course.getCourseCode());
        courseDTO.setCourseName(course.getCourseName());
        courseDTO.setYear(course.getYear());
        courseDTO.setSemester(course.getSemester());
        courseDTO.setProgrammeName(course.getProgram().getName());
        courseDTO.setDeptName(course.getDepartment().getName());
        courseDTO.setInstructorName(course.getInstructor().getFirstName() + " " + course.getInstructor().getLastName());
        return courseDTO;
    }

    @Override
    public Optional<Course> getCourseById(Long id) {
        if (id == null) {
            throw new ValidationException("Course ID cannot be null");
        }
        return courseRepository.findById(id);
    }

    @Override
    @Transactional
    public Course createCourse(CourseDTO courseDto) {
        if (courseDto == null) {
            throw new ValidationException("CourseDTO cannot be null");
        }

        System.out.println(courseDto.toString());

        Course course = new Course();
        course.setCourseCode(courseDto.getCourseCode());
        course.setCourseName(courseDto.getCourseName());
        course.setYear(courseDto.getYear());
        course.setSemester(courseDto.getSemester());

        Program program = programRepository.findByName(courseDto.getProgrammeName())
                .orElseThrow(() -> new ResourceNotFoundException("Program", "name", courseDto.getProgrammeName()));
        course.setProgram(program);

        Department department = departmentRepository.findByName(courseDto.getDeptName())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "name", courseDto.getDeptName()));
        course.setDepartment(department);

        Instructor instructor = instructorRepository.findByFirstName(courseDto.getInstructorName())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor", "name", courseDto.getInstructorName()));
        course.setInstructor(instructor);

        return courseRepository.save(course);
    }

    @Override
    @Transactional
    public CourseDTO updateCourse(Long id, CourseDTO courseDTO) {
        if (id == null) {
            throw new ValidationException("Course ID cannot be null");
        }
        if (courseDTO == null) {
            throw new ValidationException("CourseDTO cannot be null");
        }

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));

        course.setCourseCode(courseDTO.getCourseCode());
        course.setCourseName(courseDTO.getCourseName());
        course.setYear(courseDTO.getYear());
        course.setSemester(courseDTO.getSemester());

        Department department = departmentRepository.findByName(courseDTO.getDeptName())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "name", courseDTO.getDeptName()));
        course.setDepartment(department);

        Instructor instructor = instructorRepository.findByFirstName(courseDTO.getInstructorName())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor", "name", courseDTO.getInstructorName()));
        course.setInstructor(instructor);

        Program programme = programRepository.findByName(courseDTO.getProgrammeName())
                .orElseThrow(() -> new ResourceNotFoundException("Programme", "name", courseDTO.getProgrammeName()));
        course.setProgram(programme);

        Course updatedCourse = courseRepository.save(course);
        return convertToDTO(updatedCourse);
    }

    @Override
    @Transactional
    public void deleteCourse(Long id) {
        if (id == null) {
            throw new ValidationException("Course ID cannot be null");
        }

        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Course", "id", id);
        }

        // Delete sections associated with the course first to avoid constraint violations
        List<Section> sections = sectionRepository.findByCourseId(id);
        if (!sections.isEmpty()) {
            sectionRepository.deleteAll(sections);
        }

        // Now delete the course
        courseRepository.deleteById(id);

        // Verify deletion
        if (courseRepository.existsById(id)) {
            throw new OperationFailedException("Failed to delete course with id: " + id);
        }
    }

    @Override
    public List<Section> getAllSectionsByCourseId(Long courseId) {
        if (courseId == null) {
            throw new ValidationException("Course ID cannot be null");
        }
        return sectionRepository.findByCourseId(courseId);
    }

    @Override
    public Optional<Section> getSectionById(Long id) {
        if (id == null) {
            throw new ValidationException("Section ID cannot be null");
        }
        return sectionRepository.findById(id);
    }

    @Override
    @Transactional
    public Section createSection(Long courseId, Section section) {
        if (courseId == null) {
            throw new ValidationException("Course ID cannot be null");
        }
        if (section == null) {
            throw new ValidationException("Section cannot be null");
        }

        return courseRepository.findById(courseId)
                .map(course -> {
                    section.setCourse(course);
                    return sectionRepository.save(section);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
    }

    @Override
    @Transactional
    public Optional<Section> updateSection(Long id, Section updatedSection) {
        if (id == null) {
            throw new ValidationException("Section ID cannot be null");
        }
        if (updatedSection == null) {
            throw new ValidationException("Updated section cannot be null");
        }

        Optional<Section> sectionOptional = sectionRepository.findById(id);
        if (sectionOptional.isPresent()) {
            Section section = sectionOptional.get();
            section.setNumberOfClasses(updatedSection.getNumberOfClasses());
            return Optional.of(sectionRepository.save(section));
        }
        return Optional.empty();
    }

    @Override
    @Transactional
    public void deleteSection(Long id) {
        if (id == null) {
            throw new ValidationException("Section ID cannot be null");
        }

        if (!sectionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Section", "id", id);
        }

        sectionRepository.deleteById(id);

        // Verify deletion
        if (sectionRepository.existsById(id)) {
            throw new OperationFailedException("Failed to delete section with id: " + id);
        }
    }

    @Override
    public List<CourseDTO> getCoursesWithoutSection() {
        return courseRepository.findAll()
                .stream()
                .filter(course -> sectionRepository.findByCourseId(course.getId()).isEmpty())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}