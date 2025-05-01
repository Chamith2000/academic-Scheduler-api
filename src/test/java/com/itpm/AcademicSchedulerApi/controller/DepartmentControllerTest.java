package com.itpm.AcademicSchedulerApi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itpm.AcademicSchedulerApi.controller.dto.DepartmentDTO;
import com.itpm.AcademicSchedulerApi.model.Department;
import com.itpm.AcademicSchedulerApi.model.Faculty;
import com.itpm.AcademicSchedulerApi.service.DepartmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class DepartmentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DepartmentService departmentService;

    @InjectMocks
    private DepartmentController departmentController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(departmentController).build();
    }

    @Test
    void createDepartment_shouldReturnCreatedDepartment() throws Exception {
        // Arrange
        DepartmentDTO departmentDTO = new DepartmentDTO();
        departmentDTO.setDeptCode("CS");
        departmentDTO.setDeptName("Computer Science");
        departmentDTO.setFacultyName("Engineering");

        Department department = new Department();
        department.setId(1L);
        department.setDept_code("CS");
        department.setName("Computer Science");

        Faculty faculty = new Faculty();
        faculty.setFacultyName("Engineering");
        department.setFaculty(faculty);

        when(departmentService.createDepartment(any(DepartmentDTO.class))).thenReturn(department);

        // Act & Assert
        mockMvc.perform(post("/api/departments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(departmentDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.dept_code", is("CS")))
                .andExpect(jsonPath("$.name", is("Computer Science")));

        verify(departmentService, times(1)).createDepartment(any(DepartmentDTO.class));
    }

    @Test
    void updateDepartment_shouldReturnUpdatedDepartment() throws Exception {
        // Arrange
        Long departmentId = 1L;
        DepartmentDTO departmentDTO = new DepartmentDTO();
        departmentDTO.setId(departmentId);
        departmentDTO.setDeptCode("CS-Updated");
        departmentDTO.setDeptName("Computer Science Updated");
        departmentDTO.setFacultyName("Engineering");

        DepartmentDTO updatedDTO = new DepartmentDTO(
                departmentId,
                "CS-Updated",
                "Computer Science Updated",
                "Engineering"
        );

        when(departmentService.updateDepartment(eq(departmentId), any(DepartmentDTO.class))).thenReturn(updatedDTO);

        // Act & Assert
        mockMvc.perform(put("/api/departments/{id}", departmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(departmentDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.deptCode", is("CS-Updated")))
                .andExpect(jsonPath("$.deptName", is("Computer Science Updated")))
                .andExpect(jsonPath("$.facultyName", is("Engineering")));

        verify(departmentService, times(1)).updateDepartment(eq(departmentId), any(DepartmentDTO.class));
    }

    @Test
    void deleteDepartment_shouldReturnNoContent() throws Exception {
        // Arrange
        Long departmentId = 1L;
        doNothing().when(departmentService).deleteDepartment(departmentId);

        // Act & Assert
        mockMvc.perform(delete("/api/departments/{id}", departmentId))
                .andExpect(status().isNoContent());

        verify(departmentService, times(1)).deleteDepartment(departmentId);
    }

    @Test
    void getDepartmentById_shouldReturnDepartment() throws Exception {
        // Arrange
        Long departmentId = 1L;
        Department department = new Department();
        department.setId(departmentId);
        department.setDept_code("CS");
        department.setName("Computer Science");

        Faculty faculty = new Faculty();
        faculty.setFacultyName("Engineering");
        department.setFaculty(faculty);

        when(departmentService.getDepartmentById(departmentId)).thenReturn(department);

        // Act & Assert
        mockMvc.perform(get("/api/departments/{id}", departmentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.dept_code", is("CS")))
                .andExpect(jsonPath("$.name", is("Computer Science")));

        verify(departmentService, times(1)).getDepartmentById(departmentId);
    }

    @Test
    void getAllDepartments_shouldReturnAllDepartments() throws Exception {
        // Arrange
        DepartmentDTO dept1 = new DepartmentDTO(1L, "CS", "Computer Science", "Engineering");
        DepartmentDTO dept2 = new DepartmentDTO(2L, "EE", "Electrical Engineering", "Engineering");
        List<DepartmentDTO> departments = Arrays.asList(dept1, dept2);

        when(departmentService.getAllDepartments()).thenReturn(departments);

        // Act & Assert
        mockMvc.perform(get("/api/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].deptCode", is("CS")))
                .andExpect(jsonPath("$[0].deptName", is("Computer Science")))
                .andExpect(jsonPath("$[0].facultyName", is("Engineering")))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[1].deptCode", is("EE")))
                .andExpect(jsonPath("$[1].deptName", is("Electrical Engineering")))
                .andExpect(jsonPath("$[1].facultyName", is("Engineering")));

        verify(departmentService, times(1)).getAllDepartments();
    }
}