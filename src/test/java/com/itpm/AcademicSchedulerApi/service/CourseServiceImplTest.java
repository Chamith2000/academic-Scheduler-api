package com.itpm.AcademicSchedulerApi.service;

import com.itpm.AcademicSchedulerApi.controller.dto.CourseDTO;
import com.itpm.AcademicSchedulerApi.exception.ResourceNotFoundException;
import com.itpm.AcademicSchedulerApi.exception.ValidationException;
import com.itpm.AcademicSchedulerApi.model.*;
import com.itpm.AcademicSchedulerApi.repository.*;
import com.itpm.AcademicSchedulerApi.service.impl.CourseServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceImplTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private SectionRepository sectionRepository;

    @Mock
    private ProgramRepository programRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private InstructorRepository instructorRepository;

    @InjectMocks
    private CourseServiceImpl courseService;

    private Course testCourse;
    private CourseDTO testCourseDTO;
    private Program testProgram;
    private Department testDepartment;
    private Instructor testInstructor;
    private Section testSection;
    private List<Course> courseList;

    @BeforeEach
    void setUp() {
        // Initialize test data
        testProgram = new Program();
        testProgram.setId(1L);
        testProgram.setName("Computer Science");

        testDepartment = new Department();
        testDepartment.setId(1L);
        testDepartment.setName("Information Technology");

        testInstructor = new Instructor();
        testInstructor.setId(1L);
        testInstructor.setFirstName("John");
        testInstructor.setLastName("Doe");

        testCourse = new Course();
        testCourse.setId(1L);
        testCourse.setCourseCode("CS101");
        testCourse.setCourseName("Introduction to Programming");
        testCourse.setYear(2023);
        testCourse.setSemester(1);
        testCourse.setProgram(testProgram);
        testCourse.setDepartment(testDepartment);
        testCourse.setInstructor(testInstructor);

        testCourseDTO = new CourseDTO();
        testCourseDTO.setId(1L);
        testCourseDTO.setCourseCode("CS101");
        testCourseDTO.setCourseName("Introduction to Programming");
        testCourseDTO.setYear(2023);
        testCourseDTO.setSemester(1);
        testCourseDTO.setProgrammeName("Computer Science");
        testCourseDTO.setDeptName("Information Technology");
        testCourseDTO.setInstructorName("John Doe");

        testSection = new Section();
        testSection.setId(1L);
        testSection.setCourse(testCourse);
        testSection.setNumberOfClasses(3);

        courseList = new ArrayList<>();
        courseList.add(testCourse);
    }

    @Test
    void getAllCourses_ShouldReturnAllCourses() {
        // Arrange
        when(courseRepository.findAll()).thenReturn(courseList);

        // Act
        List<CourseDTO> result = courseService.getAllCourses();

        // Assert
        assertEquals(1, result.size());
        assertEquals(testCourse.getId(), result.get(0).getId());
        assertEquals(testCourse.getCourseCode(), result.get(0).getCourseCode());
        assertEquals(testCourse.getCourseName(), result.get(0).getCourseName());
        verify(courseRepository, times(1)).findAll();
    }

    @Test
    void getCourseById_WithValidId_ShouldReturnCourse() {
        // Arrange
        when(courseRepository.findById(anyLong())).thenReturn(Optional.of(testCourse));

        // Act
        Optional<Course> result = courseService.getCourseById(1L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testCourse.getId(), result.get().getId());
        verify(courseRepository, times(1)).findById(1L);
    }

    @Test
    void getCourseById_WithNullId_ShouldThrowValidationException() {
        // Assert & Act
        ValidationException exception = assertThrows(ValidationException.class, () -> {
            courseService.getCourseById(null);
        });

        // Assert
        assertEquals("Course ID cannot be null", exception.getMessage());
        verify(courseRepository, never()).findById(any());
    }

    @Test
    void createCourse_WithValidData_ShouldCreateCourse() {
        // Arrange
        when(programRepository.findByName(anyString())).thenReturn(Optional.of(testProgram));
        when(departmentRepository.findByName(anyString())).thenReturn(Optional.of(testDepartment));
        when(instructorRepository.findByFirstName(anyString())).thenReturn(Optional.of(testInstructor));
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        // Act
        Course result = courseService.createCourse(testCourseDTO);

        // Assert
        assertNotNull(result);
        assertEquals(testCourse.getId(), result.getId());
        verify(programRepository, times(1)).findByName(testCourseDTO.getProgrammeName());
        verify(departmentRepository, times(1)).findByName(testCourseDTO.getDeptName());
        verify(instructorRepository, times(1)).findByFirstName(testCourseDTO.getInstructorName());
        verify(courseRepository, times(1)).save(any(Course.class));
    }

    @Test
    void createCourse_WithNullDTO_ShouldThrowValidationException() {
        // Assert & Act
        ValidationException exception = assertThrows(ValidationException.class, () -> {
            courseService.createCourse(null);
        });

        // Assert
        assertEquals("CourseDTO cannot be null", exception.getMessage());
        verify(courseRepository, never()).save(any());
    }

    @Test
    void createCourse_WithInvalidProgramName_ShouldThrowResourceNotFoundException() {
        // Arrange
        when(programRepository.findByName(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            courseService.createCourse(testCourseDTO);
        });

        // Assert
        assertTrue(exception.getMessage().contains("Program"));
        verify(courseRepository, never()).save(any());
    }

    @Test
    void updateCourse_WithValidData_ShouldUpdateCourse() {
        // Arrange
        when(courseRepository.findById(anyLong())).thenReturn(Optional.of(testCourse));
        when(programRepository.findByName(anyString())).thenReturn(Optional.of(testProgram));
        when(departmentRepository.findByName(anyString())).thenReturn(Optional.of(testDepartment));
        when(instructorRepository.findByFirstName(anyString())).thenReturn(Optional.of(testInstructor));
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        CourseDTO updateDTO = new CourseDTO();
        updateDTO.setCourseCode("CS102");
        updateDTO.setCourseName("Advanced Programming");
        updateDTO.setYear(2024);
        updateDTO.setSemester(2);
        updateDTO.setProgrammeName("Computer Science");
        updateDTO.setDeptName("Information Technology");
        updateDTO.setInstructorName("John Doe");

        // Act
        CourseDTO result = courseService.updateCourse(1L, updateDTO);

        // Assert
        assertNotNull(result);
        verify(courseRepository, times(1)).findById(1L);
        verify(courseRepository, times(1)).save(any(Course.class));
    }

    @Test
    void updateCourse_WithNullId_ShouldThrowValidationException() {
        // Act & Assert
        ValidationException exception = assertThrows(ValidationException.class, () -> {
            courseService.updateCourse(null, testCourseDTO);
        });

        // Assert
        assertEquals("Course ID cannot be null", exception.getMessage());
        verify(courseRepository, never()).save(any());
    }

    @Test
    void updateCourse_WithNullDTO_ShouldThrowValidationException() {
        // Act & Assert
        ValidationException exception = assertThrows(ValidationException.class, () -> {
            courseService.updateCourse(1L, null);
        });

        // Assert
        assertEquals("CourseDTO cannot be null", exception.getMessage());
        verify(courseRepository, never()).save(any());
    }

    @Test
    void updateCourse_WithNonExistentId_ShouldThrowResourceNotFoundException() {
        // Arrange
        when(courseRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            courseService.updateCourse(999L, testCourseDTO);
        });

        // Assert
        assertTrue(exception.getMessage().contains("Course"));
        verify(courseRepository, never()).save(any());
    }

    @Test
    void deleteCourse_WithValidId_ShouldDeleteCourse() {
        // Arrange
        when(courseRepository.existsById(anyLong())).thenReturn(true, false);
        when(sectionRepository.findByCourseId(anyLong())).thenReturn(new ArrayList<>());

        // Act
        courseService.deleteCourse(1L);

        // Assert
        verify(courseRepository, times(1)).deleteById(1L);
        verify(courseRepository, times(2)).existsById(1L);
    }

    @Test
    void deleteCourse_WithNullId_ShouldThrowValidationException() {
        // Act & Assert
        ValidationException exception = assertThrows(ValidationException.class, () -> {
            courseService.deleteCourse(null);
        });

        // Assert
        assertEquals("Course ID cannot be null", exception.getMessage());
        verify(courseRepository, never()).deleteById(any());
    }

    @Test
    void deleteCourse_WithNonExistentId_ShouldThrowResourceNotFoundException() {
        // Arrange
        when(courseRepository.existsById(anyLong())).thenReturn(false);

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            courseService.deleteCourse(999L);
        });

        // Assert
        assertTrue(exception.getMessage().contains("Course"));
        verify(courseRepository, never()).deleteById(any());
    }

    @Test
    void deleteCourse_WithSections_ShouldDeleteSectionsFirst() {
        // Arrange
        List<Section> sections = new ArrayList<>();
        sections.add(testSection);

        when(courseRepository.existsById(anyLong())).thenReturn(true, false);
        when(sectionRepository.findByCourseId(anyLong())).thenReturn(sections, new ArrayList<>());

        // Act
        courseService.deleteCourse(1L);

        // Assert
        verify(sectionRepository, times(1)).deleteAll(sections);
        verify(courseRepository, times(1)).deleteById(1L);
    }

    @Test
    void getAllSectionsByCourseId_WithValidId_ShouldReturnSections() {
        // Arrange
        List<Section> sections = new ArrayList<>();
        sections.add(testSection);
        when(sectionRepository.findByCourseId(anyLong())).thenReturn(sections);

        // Act
        List<Section> result = courseService.getAllSectionsByCourseId(1L);

        // Assert
        assertEquals(1, result.size());
        verify(sectionRepository, times(1)).findByCourseId(1L);
    }

    @Test
    void getAllSectionsByCourseId_WithNullId_ShouldThrowValidationException() {
        // Act & Assert
        ValidationException exception = assertThrows(ValidationException.class, () -> {
            courseService.getAllSectionsByCourseId(null);
        });

        // Assert
        assertEquals("Course ID cannot be null", exception.getMessage());
        verify(sectionRepository, never()).findByCourseId(any());
    }

    @Test
    void getSectionById_WithValidId_ShouldReturnSection() {
        // Arrange
        when(sectionRepository.findById(anyLong())).thenReturn(Optional.of(testSection));

        // Act
        Optional<Section> result = courseService.getSectionById(1L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testSection.getId(), result.get().getId());
        verify(sectionRepository, times(1)).findById(1L);
    }

    @Test
    void getSectionById_WithNullId_ShouldThrowValidationException() {
        // Act & Assert
        ValidationException exception = assertThrows(ValidationException.class, () -> {
            courseService.getSectionById(null);
        });

        // Assert
        assertEquals("Section ID cannot be null", exception.getMessage());
        verify(sectionRepository, never()).findById(any());
    }

    @Test
    void createSection_WithValidData_ShouldCreateSection() {
        // Arrange
        when(courseRepository.findById(anyLong())).thenReturn(Optional.of(testCourse));
        when(sectionRepository.save(any(Section.class))).thenReturn(testSection);

        // Act
        Section result = courseService.createSection(1L, testSection);

        // Assert
        assertNotNull(result);
        assertEquals(testSection.getId(), result.getId());
        verify(courseRepository, times(1)).findById(1L);
        verify(sectionRepository, times(1)).save(any(Section.class));
    }

    @Test
    void createSection_WithNullCourseId_ShouldThrowValidationException() {
        // Act & Assert
        ValidationException exception = assertThrows(ValidationException.class, () -> {
            courseService.createSection(null, testSection);
        });

        // Assert
        assertEquals("Course ID cannot be null", exception.getMessage());
        verify(sectionRepository, never()).save(any());
    }

    @Test
    void createSection_WithNullSection_ShouldThrowValidationException() {
        // Act & Assert
        ValidationException exception = assertThrows(ValidationException.class, () -> {
            courseService.createSection(1L, null);
        });

        // Assert
        assertEquals("Section cannot be null", exception.getMessage());
        verify(sectionRepository, never()).save(any());
    }

    @Test
    void createSection_WithNonExistentCourseId_ShouldThrowResourceNotFoundException() {
        // Arrange
        when(courseRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            courseService.createSection(999L, testSection);
        });

        // Assert
        assertTrue(exception.getMessage().contains("Course"));
        verify(sectionRepository, never()).save(any());
    }

    @Test
    void updateSection_WithValidData_ShouldUpdateSection() {
        // Arrange
        when(sectionRepository.findById(anyLong())).thenReturn(Optional.of(testSection));
        when(sectionRepository.save(any(Section.class))).thenReturn(testSection);

        Section updatedSection = new Section();
        updatedSection.setNumberOfClasses(5);

        // Act
        Optional<Section> result = courseService.updateSection(1L, updatedSection);

        // Assert
        assertTrue(result.isPresent());
        verify(sectionRepository, times(1)).findById(1L);
        verify(sectionRepository, times(1)).save(any(Section.class));
    }

    @Test
    void updateSection_WithNullId_ShouldThrowValidationException() {
        // Act & Assert
        ValidationException exception = assertThrows(ValidationException.class, () -> {
            courseService.updateSection(null, testSection);
        });

        // Assert
        assertEquals("Section ID cannot be null", exception.getMessage());
        verify(sectionRepository, never()).save(any());
    }

    @Test
    void updateSection_WithNullSection_ShouldThrowValidationException() {
        // Act & Assert
        ValidationException exception = assertThrows(ValidationException.class, () -> {
            courseService.updateSection(1L, null);
        });

        // Assert
        assertEquals("Updated section cannot be null", exception.getMessage());
        verify(sectionRepository, never()).save(any());
    }

    @Test
    void updateSection_WithNonExistentId_ShouldReturnEmptyOptional() {
        // Arrange
        when(sectionRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act
        Optional<Section> result = courseService.updateSection(999L, testSection);

        // Assert
        assertFalse(result.isPresent());
        verify(sectionRepository, never()).save(any());
    }

    @Test
    void deleteSection_WithValidId_ShouldDeleteSection() {
        // Arrange
        when(sectionRepository.existsById(anyLong())).thenReturn(true, false);

        // Act
        courseService.deleteSection(1L);

        // Assert
        verify(sectionRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteSection_WithNullId_ShouldThrowValidationException() {
        // Act & Assert
        ValidationException exception = assertThrows(ValidationException.class, () -> {
            courseService.deleteSection(null);
        });

        // Assert
        assertEquals("Section ID cannot be null", exception.getMessage());
        verify(sectionRepository, never()).deleteById(any());
    }

    @Test
    void deleteSection_WithNonExistentId_ShouldThrowResourceNotFoundException() {
        // Arrange
        when(sectionRepository.existsById(anyLong())).thenReturn(false);

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            courseService.deleteSection(999L);
        });

        // Assert
        assertTrue(exception.getMessage().contains("Section"));
        verify(sectionRepository, never()).deleteById(any());
    }

    @Test
    void getCoursesWithoutSection_ShouldReturnCoursesWithoutSections() {
        // Arrange
        when(courseRepository.findAll()).thenReturn(courseList);
        when(sectionRepository.findByCourseId(anyLong())).thenReturn(new ArrayList<>());

        // Act
        List<CourseDTO> result = courseService.getCoursesWithoutSection();

        // Assert
        assertEquals(1, result.size());
        verify(courseRepository, times(1)).findAll();
        verify(sectionRepository, times(1)).findByCourseId(anyLong());
    }
}