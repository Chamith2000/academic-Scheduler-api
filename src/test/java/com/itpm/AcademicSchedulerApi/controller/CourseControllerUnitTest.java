package com.itpm.AcademicSchedulerApi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itpm.AcademicSchedulerApi.controller.dto.CourseDTO;
import com.itpm.AcademicSchedulerApi.exception.GlobalExceptionHandler;
import com.itpm.AcademicSchedulerApi.exception.ResourceNotFoundException;
import com.itpm.AcademicSchedulerApi.model.Course;
import com.itpm.AcademicSchedulerApi.model.Department;
import com.itpm.AcademicSchedulerApi.model.Instructor;
import com.itpm.AcademicSchedulerApi.model.Program;
import com.itpm.AcademicSchedulerApi.service.CourseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CourseControllerUnitTest {

    private MockMvc mockMvc;

    @Mock
    private CourseService courseService;

    @InjectMocks
    private CourseController courseController;

    private ObjectMapper objectMapper;
    private Course testCourse;
    private CourseDTO testCourseDTO;
    private List<CourseDTO> courseDTOList;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(courseController).build();
        objectMapper = new ObjectMapper();

        // Set up test data
        Program testProgram = new Program();
        testProgram.setId(1L);
        testProgram.setName("Computer Science");

        Department testDepartment = new Department();
        testDepartment.setId(1L);
        testDepartment.setName("Information Technology");

        Instructor testInstructor = new Instructor();
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

        courseDTOList = new ArrayList<>();
        courseDTOList.add(testCourseDTO);
    }

    @Test
    void getAllCourses_ShouldReturnListOfCourses() throws Exception {
        // Arrange
        when(courseService.getAllCourses()).thenReturn(courseDTOList);

        // Act & Assert
        mockMvc.perform(get("/api/courses"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].courseCode", is("CS101")))
                .andExpect(jsonPath("$[0].courseName", is("Introduction to Programming")));

        verify(courseService, times(1)).getAllCourses();
    }

    @Test
    void getCourseById_WithExistingId_ShouldReturnCourse() throws Exception {
        // Arrange
        when(courseService.getCourseById(anyLong())).thenReturn(Optional.of(testCourse));

        // Act & Assert
        mockMvc.perform(get("/api/courses/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.courseCode", is("CS101")))
                .andExpect(jsonPath("$.courseName", is("Introduction to Programming")));

        verify(courseService, times(1)).getCourseById(1L);
    }

    @Test
    void getCourseById_WithNonExistingId_ShouldReturnNotFound() throws Exception {
        // Arrange
        when(courseService.getCourseById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/api/courses/999"))
                .andExpect(status().isNotFound());

        verify(courseService, times(1)).getCourseById(999L);
    }

    @Test
    void createCourse_WithValidData_ShouldReturnCreatedCourse() throws Exception {
        // Arrange
        when(courseService.createCourse(any(CourseDTO.class))).thenReturn(testCourse);

        // Act & Assert
        mockMvc.perform(post("/api/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testCourseDTO)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.courseCode", is("CS101")))
                .andExpect(jsonPath("$.courseName", is("Introduction to Programming")));

        verify(courseService, times(1)).createCourse(any(CourseDTO.class));
    }

    @Test
    void updateCourse_WithValidData_ShouldReturnUpdatedCourse() throws Exception {
        // Arrange
        when(courseService.updateCourse(anyLong(), any(CourseDTO.class))).thenReturn(testCourseDTO);

        // Act & Assert
        mockMvc.perform(put("/api/courses/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testCourseDTO)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.courseCode", is("CS101")))
                .andExpect(jsonPath("$.courseName", is("Introduction to Programming")));

        verify(courseService, times(1)).updateCourse(eq(1L), any(CourseDTO.class));
    }

    @Test
    void deleteCourse_WithValidId_ShouldReturnNoContent() throws Exception {
        // Arrange
        doNothing().when(courseService).deleteCourse(anyLong());

        // Act & Assert
        mockMvc.perform(delete("/api/courses/1"))
                .andExpect(status().isNoContent());

        verify(courseService, times(1)).deleteCourse(1L);
    }

    @Test
    void deleteCourse_WithExceptionThrown_ShouldPropagateException() throws Exception {
        // Arrange
        // Create a custom exception handler to handle ResourceNotFoundException
        mockMvc = MockMvcBuilders.standaloneSetup(courseController)
                .setControllerAdvice(new GlobalExceptionHandler()) // Add your exception handler
                .build();

        doThrow(new ResourceNotFoundException("Course", "id", 999L))
                .when(courseService).deleteCourse(anyLong());

        // Act & Assert
        mockMvc.perform(delete("/api/courses/999"))
                .andExpect(status().isNotFound());

        verify(courseService, times(1)).deleteCourse(999L);
    }

    @Test
    void getCoursesWithoutSection_ShouldReturnCourses() throws Exception {
        // Arrange
        when(courseService.getCoursesWithoutSection()).thenReturn(courseDTOList);

        // Act & Assert
        mockMvc.perform(get("/api/courses/no-section"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].courseCode", is("CS101")));

        verify(courseService, times(1)).getCoursesWithoutSection();
    }
}