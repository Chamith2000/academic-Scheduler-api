//package com.itpm.AcademicSchedulerApi.repository;
//
//import com.itpm.AcademicSchedulerApi.model.Department;
//import com.itpm.AcademicSchedulerApi.model.Faculty;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
//import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
//
//import java.util.List;
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.*;
//
//@DataJpaTest
//class DepartmentRepositoryTest {
//
//    @Autowired
//    private TestEntityManager entityManager;
//
//    @Autowired
//    private DepartmentRepository departmentRepository;
//
//    @Test
//    void findByName_whenDepartmentExists_shouldReturnDepartment() {
//        // Arrange
//        Faculty faculty = new Faculty();
//        faculty.setFacultyName("Engineering");
//        entityManager.persist(faculty);
//
//        Department department = new Department();
//        department.setName("Computer Science");
//        department.setDept_code("CS");
//        department.setFaculty(faculty);
//        entityManager.persist(department);
//        entityManager.flush();
//
//        // Act
//        Optional<Department> found = departmentRepository.findByName("Computer Science");
//
//        // Assert
//        assertTrue(found.isPresent());
//        assertEquals("Computer Science", found.get().getName());
//        assertEquals("CS", found.get().getDept_code());
//        assertEquals("Engineering", found.get().getFaculty().getFacultyName());
//    }
//
//    @Test
//    void findByName_whenDepartmentDoesNotExist_shouldReturnEmpty() {
//        // Act
//        Optional<Department> found = departmentRepository.findByName("Non-Existent Department");
//
//        // Assert
//        assertFalse(found.isPresent());
//    }
//
//    @Test
//    void findAll_shouldReturnAllDepartments() {
//        // Arrange
//        Faculty faculty = new Faculty();
//        faculty.setFacultyName("Engineering");
//        entityManager.persist(faculty);
//
//        Department dept1 = new Department();
//        dept1.setName("Computer Science");
//        dept1.setDept_code("CS");
//        dept1.setFaculty(faculty);
//        entityManager.persist(dept1);
//
//        Department dept2 = new Department();
//        dept2.setName("Electrical Engineering");
//        dept2.setDept_code("EE");
//        dept2.setFaculty(faculty);
//        entityManager.persist(dept2);
//
//        entityManager.flush();
//
//        // Act
//        List<Department> departments = departmentRepository.findAll();
//
//        // Assert
//        assertEquals(2, departments.size());
//        assertTrue(departments.stream().anyMatch(d -> d.getName().equals("Computer Science")));
//        assertTrue(departments.stream().anyMatch(d -> d.getName().equals("Electrical Engineering")));
//    }
//
//    @Test
//    void save_shouldPersistDepartment() {
//        // Arrange
//        Faculty faculty = new Faculty();
//        faculty.setFacultyName("Engineering");
//        entityManager.persist(faculty);
//
//        Department department = new Department();
//        department.setName("Computer Science");
//        department.setDept_code("CS");
//        department.setFaculty(faculty);
//
//        // Act
//        Department savedDepartment = departmentRepository.save(department);
//
//        // Assert
//        assertNotNull(savedDepartment.getId());
//
//        Department foundDepartment = entityManager.find(Department.class, savedDepartment.getId());
//        assertEquals("Computer Science", foundDepartment.getName());
//        assertEquals("CS", foundDepartment.getDept_code());
//        assertEquals("Engineering", foundDepartment.getFaculty().getFacultyName());
//    }
//
//    @Test
//    void deleteById_shouldRemoveDepartment() {
//        // Arrange
//        Faculty faculty = new Faculty();
//        faculty.setFacultyName("Engineering");
//        entityManager.persist(faculty);
//
//        Department department = new Department();
//        department.setName("Computer Science");
//        department.setDept_code("CS");
//        department.setFaculty(faculty);
//
//        entityManager.persist(department);
//        entityManager.flush();
//
//        Long departmentId = department.getId();
//
//        // Act
//        departmentRepository.deleteById(departmentId);
//
//        // Assert
//        Department foundDepartment = entityManager.find(Department.class, departmentId);
//        assertNull(foundDepartment);
//    }
//
//    @Test
//    void findById_whenDepartmentExists_shouldReturnDepartment() {
//        // Arrange
//        Faculty faculty = new Faculty();
//        faculty.setFacultyName("Engineering");
//        entityManager.persist(faculty);
//
//        Department department = new Department();
//        department.setName("Computer Science");
//        department.setDept_code("CS");
//        department.setFaculty(faculty);
//
//        entityManager.persist(department);
//        entityManager.flush();
//
//        Long departmentId = department.getId();
//
//        // Act
//        Optional<Department> found = departmentRepository.findById(departmentId);
//
//        // Assert
//        assertTrue(found.isPresent());
//        assertEquals("Computer Science", found.get().getName());
//        assertEquals("CS", found.get().getDept_code());
//    }
//
//    @Test
//    void findById_whenDepartmentDoesNotExist_shouldReturnEmpty() {
//        // Act
//        Optional<Department> found = departmentRepository.findById(999L);
//
//        // Assert
//        assertFalse(found.isPresent());
//    }
//}