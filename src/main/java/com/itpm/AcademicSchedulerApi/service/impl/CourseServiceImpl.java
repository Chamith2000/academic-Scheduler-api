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
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CourseServiceImpl implements CourseService {
    private static final Logger logger = LoggerFactory.getLogger(CourseServiceImpl.class);

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
        try {
            List<Course> courses = courseRepository.findAll();
            logger.info("Retrieved {} courses from database", courses.size());
            return courses.stream()
                    .map(this::convertToDTOSafely)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error retrieving all courses", e);
            throw new OperationFailedException("Failed to retrieve courses: " + e.getMessage(), e);
        }
    }

    private Optional<CourseDTO> convertToDTOSafely(Course course) {
        try {
            CourseDTO courseDTO = new CourseDTO();
            courseDTO.setId(course.getId());
            courseDTO.setCourseCode(course.getCourseCode());
            courseDTO.setCourseName(course.getCourseName());
            courseDTO.setYear(course.getYear());
            courseDTO.setSemester(course.getSemester());

            if (course.getProgram() != null) {
                courseDTO.setProgrammeName(course.getProgram().getName());
            } else {
                courseDTO.setProgrammeName("Unknown Program");
                logger.warn("Course with ID {} has no program assigned", course.getId());
            }

            if (course.getDepartment() != null) {
                courseDTO.setDeptName(course.getDepartment().getName());
            } else {
                courseDTO.setDeptName("Unknown Department");
                logger.warn("Course with ID {} has no department assigned", course.getId());
            }

            if (course.getInstructor() != null) {
                String firstName = course.getInstructor().getFirstName() != null ? course.getInstructor().getFirstName() : "";
                String lastName = course.getInstructor().getLastName() != null ? course.getInstructor().getLastName() : "";
                courseDTO.setInstructorName(firstName + " " + lastName);
            } else {
                courseDTO.setInstructorName("Unassigned");
                logger.warn("Course with ID {} has no instructor assigned", course.getId());
            }

            return Optional.of(courseDTO);
        } catch (Exception e) {
            logger.error("Error converting course with ID {} to DTO", course.getId(), e);
            return Optional.empty();
        }
    }

    private CourseDTO convertToDTO(Course course) {
        CourseDTO courseDTO = new CourseDTO();
        courseDTO.setId(course.getId());
        courseDTO.setCourseCode(course.getCourseCode());
        courseDTO.setCourseName(course.getCourseName());
        courseDTO.setYear(course.getYear());
        courseDTO.setSemester(course.getSemester());

        if (course.getProgram() != null) {
            courseDTO.setProgrammeName(course.getProgram().getName());
        } else {
            courseDTO.setProgrammeName("Unknown Program");
        }

        if (course.getDepartment() != null) {
            courseDTO.setDeptName(course.getDepartment().getName());
        } else {
            courseDTO.setDeptName("Unknown Department");
        }

        if (course.getInstructor() != null) {
            String firstName = course.getInstructor().getFirstName() != null ? course.getInstructor().getFirstName() : "";
            String lastName = course.getInstructor().getLastName() != null ? course.getInstructor().getLastName() : "";
            courseDTO.setInstructorName(firstName + " " + lastName);
        } else {
            courseDTO.setInstructorName("Unassigned");
        }

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

        logger.info("Creating new course: {}", courseDto);

        Course course = new Course();
        course.setCourseCode(courseDto.getCourseCode());
        course.setCourseName(courseDto.getCourseName());
        course.setYear(courseDto.getYear());
        course.setSemester(courseDto.getSemester());

        // Set program if provided
        if (courseDto.getProgrammeName() != null && !courseDto.getProgrammeName().isEmpty()) {
            Program program = programRepository.findByName(courseDto.getProgrammeName())
                    .orElseThrow(() -> new ResourceNotFoundException("Program", "name", courseDto.getProgrammeName()));
            course.setProgram(program);
        }

        // Set department if provided
        if (courseDto.getDeptName() != null && !courseDto.getDeptName().isEmpty()) {
            Department department = departmentRepository.findByName(courseDto.getDeptName())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "name", courseDto.getDeptName()));
            course.setDepartment(department);
        }

        // Set instructor if provided, make it optional
        if (courseDto.getInstructorName() != null && !courseDto.getInstructorName().isEmpty()) {
            try {
                // This assumes instructorName is just the first name
                // You might want to enhance this to handle full names
                Instructor instructor = instructorRepository.findByFirstName(courseDto.getInstructorName())
                        .orElseGet(() -> {
                            logger.warn("Instructor not found with name: {}", courseDto.getInstructorName());
                            return null; // Set to null if instructor not found
                        });
                course.setInstructor(instructor);
            } catch (Exception e) {
                logger.error("Error finding instructor: {}", e.getMessage());
                // Continue without setting instructor
            }
        }

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

        // Update only the fields that are provided (non-null) in the CourseDTO
        if (courseDTO.getCourseCode() != null) {
            course.setCourseCode(courseDTO.getCourseCode());
        }
        if (courseDTO.getCourseName() != null) {
            course.setCourseName(courseDTO.getCourseName());
        }
        if (courseDTO.getYear() != null) {
            course.setYear(courseDTO.getYear());
        }
        if (courseDTO.getSemester() != null) {
            course.setSemester(courseDTO.getSemester());
        }

        // Update program if provided
        if (courseDTO.getProgrammeName() != null && !courseDTO.getProgrammeName().isEmpty()) {
            try {
                Program program = programRepository.findByName(courseDTO.getProgrammeName())
                        .orElseThrow(() -> new ResourceNotFoundException("Program", "name", courseDTO.getProgrammeName()));
                course.setProgram(program);
            } catch (Exception e) {
                logger.error("Error updating program: {}", e.getMessage());
                // Continue without updating program
            }
        }

        // Update department if provided
        if (courseDTO.getDeptName() != null && !courseDTO.getDeptName().isEmpty()) {
            try {
                Department department = departmentRepository.findByName(courseDTO.getDeptName())
                        .orElseThrow(() -> new ResourceNotFoundException("Department", "name", courseDTO.getDeptName()));
                course.setDepartment(department);
            } catch (Exception e) {
                logger.error("Error updating department: {}", e.getMessage());
                // Continue without updating department
            }
        }

        // Update instructor if provided
        if (courseDTO.getInstructorName() != null && !courseDTO.getInstructorName().isEmpty()) {
            try {
                // Try to find instructor by first name
                Optional<Instructor> instructorOpt = instructorRepository.findByFirstName(courseDTO.getInstructorName());
                if (instructorOpt.isPresent()) {
                    course.setInstructor(instructorOpt.get());
                } else {
                    logger.warn("Instructor not found with name: {}", courseDTO.getInstructorName());
                    // You could choose to not update the instructor in this case
                }
            } catch (Exception e) {
                logger.error("Error updating instructor: {}", e.getMessage());
                // Continue without updating instructor
            }
        }

        Course updatedCourse = courseRepository.save(course);
        return convertToDTO(updatedCourse);
    }

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void deleteCourse(Long id) {
        if (id == null) {
            throw new ValidationException("Course ID cannot be null");
        }

        // Check if course exists
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));

        try {
            // Use direct SQL queries with proper transaction handling

            // 1. Check if there are any sections
            List<Section> sections = sectionRepository.findByCourseId(id);

            // 2. Delete sections if they exist
            if (!sections.isEmpty()) {
                // Use SQL for direct deletion to avoid ORM issues
                Query sectionDeleteQuery = entityManager.createNativeQuery(
                        "DELETE FROM sections WHERE course_id = :courseId");
                sectionDeleteQuery.setParameter("courseId", id);
                int deletedSections = sectionDeleteQuery.executeUpdate();

                // Log the number of deleted sections for debugging
                logger.info("Deleted {} sections for course ID: {}", deletedSections, id);
            }

            // 3. Delete the course with direct SQL
            Query courseDeleteQuery = entityManager.createNativeQuery(
                    "DELETE FROM courses WHERE course_id = :courseId");
            courseDeleteQuery.setParameter("courseId", id);
            int deletedCourses = courseDeleteQuery.executeUpdate();

            // Log the result
            logger.info("Deleted {} courses with ID: {}", deletedCourses, id);

            // 4. Verify deletion was successful
            if (deletedCourses == 0) {
                throw new OperationFailedException("No courses were deleted with ID: " + id);
            }

            // 5. Clear the persistence context to refresh entity state
            entityManager.flush();
            entityManager.clear();

        } catch (Exception e) {
            // Log detailed error information
            logger.error("Failed to delete course with ID: {}", id, e);

            // Enhanced error message with more details
            String errorMessage = "Failed to delete course with ID: " + id;
            if (e.getMessage() != null) {
                errorMessage += ". Cause: " + e.getMessage();
            }

            // Check for specific database constraint violations
            if (e.getCause() != null && e.getCause().getMessage() != null &&
                    e.getCause().getMessage().contains("foreign key constraint")) {
                errorMessage += ". There may be related records in other tables that reference this course.";
            }

            throw new OperationFailedException(errorMessage, e);
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
        try {
            return courseRepository.findAll()
                    .stream()
                    .filter(course -> sectionRepository.findByCourseId(course.getId()).isEmpty())
                    .map(this::convertToDTOSafely)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error retrieving courses without sections", e);
            throw new OperationFailedException("Failed to retrieve courses without sections: " + e.getMessage(), e);
        }
    }
}