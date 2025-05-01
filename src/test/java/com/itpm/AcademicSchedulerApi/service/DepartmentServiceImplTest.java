package com.itpm.AcademicSchedulerApi.service;

import com.itpm.AcademicSchedulerApi.controller.dto.DepartmentDTO;
import com.itpm.AcademicSchedulerApi.model.Department;
import com.itpm.AcademicSchedulerApi.model.Faculty;
import com.itpm.AcademicSchedulerApi.repository.DepartmentRepository;
import com.itpm.AcademicSchedulerApi.repository.FacultyRepository;
import com.itpm.AcademicSchedulerApi.service.impl.DepartmentServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DepartmentServiceImplTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private FacultyRepository facultyRepository;

    @InjectMocks
    private DepartmentServiceImpl departmentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createDepartment_shouldCreateAndReturnDepartment() {
        // Arrange
        DepartmentDTO departmentDTO = new DepartmentDTO();
        departmentDTO.setDeptCode("CS");
        departmentDTO.setDeptName("Computer Science");
        departmentDTO.setFacultyName("Engineering");

        Faculty faculty = new Faculty();
        faculty.setFacultyName("Engineering");

        Department department = new Department();
        department.setId(1L);
        department.setDept_code("CS");
        department.setName("Computer Science");
        department.setFaculty(faculty);

        when(facultyRepository.findByFacultyName("Engineering")).thenReturn(Optional.of(faculty));
        when(departmentRepository.save(any(Department.class))).thenReturn(department);

        // Act
        Department result = departmentService.createDepartment(departmentDTO);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("CS", result.getDept_code());
        assertEquals("Computer Science", result.getName());
        assertEquals("Engineering", result.getFaculty().getFacultyName());

        verify(facultyRepository, times(1)).findByFacultyName("Engineering");
        verify(departmentRepository, times(1)).save(any(Department.class));
    }

    @Test
    void createDepartment_whenFacultyNotFound_shouldThrowException() {
        // Arrange
        DepartmentDTO departmentDTO = new DepartmentDTO();
        departmentDTO.setDeptCode("CS");
        departmentDTO.setDeptName("Computer Science");
        departmentDTO.setFacultyName("NonExistentFaculty");

        when(facultyRepository.findByFacultyName("NonExistentFaculty")).thenReturn(Optional.empty());

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            departmentService.createDepartment(departmentDTO);
        });

        assertEquals("Invalid faculty name:NonExistentFaculty", exception.getMessage());
        verify(facultyRepository, times(1)).findByFacultyName("NonExistentFaculty");
        verify(departmentRepository, times(0)).save(any(Department.class));
    }

    @Test
    void updateDepartment_shouldUpdateAndReturnDepartmentDTO() {
        // Arrange
        Long departmentId = 1L;
        DepartmentDTO departmentDTO = new DepartmentDTO();
        departmentDTO.setDeptCode("CS-Updated");
        departmentDTO.setDeptName("Computer Science Updated");
        departmentDTO.setFacultyName("Engineering");

        Department existingDepartment = new Department();
        existingDepartment.setId(departmentId);
        existingDepartment.setDept_code("CS");
        existingDepartment.setName("Computer Science");

        Faculty faculty = new Faculty();
        faculty.setFacultyName("Engineering");

        Department updatedDepartment = new Department();
        updatedDepartment.setId(departmentId);
        updatedDepartment.setDept_code("CS-Updated");
        updatedDepartment.setName("Computer Science Updated");
        updatedDepartment.setFaculty(faculty);

        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(existingDepartment));
        when(facultyRepository.findByFacultyName("Engineering")).thenReturn(Optional.of(faculty));
        when(departmentRepository.save(any(Department.class))).thenReturn(updatedDepartment);

        // Act
        DepartmentDTO result = departmentService.updateDepartment(departmentId, departmentDTO);

        // Assert
        assertNotNull(result);
        assertEquals(departmentId, result.getId());
        assertEquals("CS-Updated", result.getDeptCode());
        assertEquals("Computer Science Updated", result.getDeptName());
        assertEquals("Engineering", result.getFacultyName());

        verify(departmentRepository, times(1)).findById(departmentId);
        verify(facultyRepository, times(1)).findByFacultyName("Engineering");
        verify(departmentRepository, times(1)).save(any(Department.class));
    }

    @Test
    void updateDepartment_whenDepartmentNotFound_shouldThrowException() {
        // Arrange
        Long departmentId = 999L;
        DepartmentDTO departmentDTO = new DepartmentDTO();
        departmentDTO.setDeptCode("CS-Updated");
        departmentDTO.setDeptName("Computer Science Updated");
        departmentDTO.setFacultyName("Engineering");

        when(departmentRepository.findById(departmentId)).thenReturn(Optional.empty());

        // Act & Assert
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            departmentService.updateDepartment(departmentId, departmentDTO);
        });

        assertEquals("Department not found with id: " + departmentId, exception.getMessage());
        verify(departmentRepository, times(1)).findById(departmentId);
        verify(facultyRepository, times(0)).findByFacultyName(anyString());
        verify(departmentRepository, times(0)).save(any(Department.class));
    }

    @Test
    void deleteDepartment_shouldCallRepositoryDeleteMethod() {
        // Arrange
        Long departmentId = 1L;
        doNothing().when(departmentRepository).deleteById(departmentId);

        // Act
        departmentService.deleteDepartment(departmentId);

        // Assert
        verify(departmentRepository, times(1)).deleteById(departmentId);
    }

    @Test
    void getDepartmentById_shouldReturnDepartment() {
        // Arrange
        Long departmentId = 1L;
        Department department = new Department();
        department.setId(departmentId);
        department.setDept_code("CS");
        department.setName("Computer Science");

        Faculty faculty = new Faculty();
        faculty.setFacultyName("Engineering");
        department.setFaculty(faculty);

        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department));

        // Act
        Department result = departmentService.getDepartmentById(departmentId);

        // Assert
        assertNotNull(result);
        assertEquals(departmentId, result.getId());
        assertEquals("CS", result.getDept_code());
        assertEquals("Computer Science", result.getName());
        assertEquals("Engineering", result.getFaculty().getFacultyName());

        verify(departmentRepository, times(1)).findById(departmentId);
    }

    @Test
    void getDepartmentById_whenDepartmentNotFound_shouldThrowException() {
        // Arrange
        Long departmentId = 999L;
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            departmentService.getDepartmentById(departmentId);
        });

        assertEquals("Department not found with id: " + departmentId, exception.getMessage());
        verify(departmentRepository, times(1)).findById(departmentId);
    }

    @Test
    void getAllDepartments_shouldReturnListOfDepartmentDTOs() {
        // Arrange
        Department dept1 = new Department();
        dept1.setId(1L);
        dept1.setDept_code("CS");
        dept1.setName("Computer Science");
        Faculty faculty1 = new Faculty();
        faculty1.setFacultyName("Engineering");
        dept1.setFaculty(faculty1);

        Department dept2 = new Department();
        dept2.setId(2L);
        dept2.setDept_code("EE");
        dept2.setName("Electrical Engineering");
        Faculty faculty2 = new Faculty();
        faculty2.setFacultyName("Engineering");
        dept2.setFaculty(faculty2);

        List<Department> departments = Arrays.asList(dept1, dept2);

        when(departmentRepository.findAll()).thenReturn(departments);

        // Act
        List<DepartmentDTO> results = departmentService.getAllDepartments();

        // Assert
        assertNotNull(results);
        assertEquals(2, results.size());

        assertEquals(1L, results.get(0).getId());
        assertEquals("CS", results.get(0).getDeptCode());
        assertEquals("Computer Science", results.get(0).getDeptName());
        assertEquals("Engineering", results.get(0).getFacultyName());

        assertEquals(2L, results.get(1).getId());
        assertEquals("EE", results.get(1).getDeptCode());
        assertEquals("Electrical Engineering", results.get(1).getDeptName());
        assertEquals("Engineering", results.get(1).getFacultyName());

        verify(departmentRepository, times(1)).findAll();
    }

    @Test
    void getAllDepartments_withNullFaculty_shouldHandleGracefully() {
        // Arrange
        Department dept = new Department();
        dept.setId(1L);
        dept.setDept_code("CS");
        dept.setName("Computer Science");
        dept.setFaculty(null); // Null faculty

        List<Department> departments = Arrays.asList(dept);

        when(departmentRepository.findAll()).thenReturn(departments);

        // Act
        List<DepartmentDTO> results = departmentService.getAllDepartments();

        // Assert
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(1L, results.get(0).getId());
        assertEquals("CS", results.get(0).getDeptCode());
        assertEquals("Computer Science", results.get(0).getDeptName());
        assertNull(results.get(0).getFacultyName());

        verify(departmentRepository, times(1)).findAll();
    }
}