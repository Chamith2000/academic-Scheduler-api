package com.itpm.AcademicSchedulerApi.service;

import com.itpm.AcademicSchedulerApi.controller.dto.FacultyDTO;
import com.itpm.AcademicSchedulerApi.model.Faculty;
import com.itpm.AcademicSchedulerApi.repository.FacultyRepository;
import com.itpm.AcademicSchedulerApi.service.impl.FacultyServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class FacultyServiceImplIntegrationTest {

    @Autowired
    private FacultyServiceImpl facultyService;

    @Autowired
    private FacultyRepository facultyRepository;

    private FacultyDTO facultyDTO;

    @BeforeEach
    void setUp() {
        facultyRepository.deleteAll(); // Clear database before each test
        facultyDTO = new FacultyDTO(null, "F001", "Engineering");
    }

    @Test
    void testCreateFaculty_Success() {
        Faculty createdFaculty = facultyService.createFaculty(facultyDTO);

        assertNotNull(createdFaculty.getId());
        assertEquals("F001", createdFaculty.getFacultyCode());
        assertEquals("Engineering", createdFaculty.getFacultyName());

        // Verify database state
        Faculty savedFaculty = facultyRepository.findById(createdFaculty.getId()).orElseThrow();
        assertEquals("F001", savedFaculty.getFacultyCode());
    }

    @Test
    void testUpdateFaculty_Success() {
        // Create a faculty
        Faculty faculty = new Faculty();
        faculty.setFacultyCode("F001");
        faculty.setFacultyName("Engineering");
        faculty = facultyRepository.save(faculty);

        FacultyDTO updatedDTO = new FacultyDTO(faculty.getId(), "F002", "Updated Engineering");

        FacultyDTO updatedFaculty = facultyService.updateFaculty(faculty.getId(), updatedDTO);

        assertEquals("F002", updatedFaculty.getFacultyCode());
        assertEquals("Updated Engineering", updatedFaculty.getFacultyName());

        // Verify database state
        Faculty savedFaculty = facultyRepository.findById(faculty.getId()).orElseThrow();
        assertEquals("F002", savedFaculty.getFacultyCode());
    }

    @Test
    void testUpdateFaculty_NotFound() {
        FacultyDTO updatedDTO = new FacultyDTO(999L, "F002", "Updated Engineering");

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            facultyService.updateFaculty(999L, updatedDTO);
        });

        assertEquals("Faculty not found with id: 999", exception.getMessage());
    }

    @Test
    void testDeleteFaculty_Success() {
        // Create a faculty
        Faculty faculty = new Faculty();
        faculty.setFacultyCode("F001");
        faculty.setFacultyName("Engineering");
        faculty = facultyRepository.save(faculty);

        facultyService.deleteFaculty(faculty.getId());

        // Verify database state
        assertFalse(facultyRepository.findById(faculty.getId()).isPresent());
    }

    @Test
    void testGetFacultyById_Success() {
        // Create a faculty
        Faculty faculty = new Faculty();
        faculty.setFacultyCode("F001");
        faculty.setFacultyName("Engineering");
        faculty = facultyRepository.save(faculty);

        Faculty foundFaculty = facultyService.getFacultyById(faculty.getId()).orElseThrow();

        assertEquals("F001", foundFaculty.getFacultyCode());
        assertEquals("Engineering", foundFaculty.getFacultyName());
    }

    @Test
    void testGetAllFaculties_Success() {
        // Create faculties
        Faculty faculty1 = new Faculty();
        faculty1.setFacultyCode("F001");
        faculty1.setFacultyName("Engineering");
        Faculty faculty2 = new Faculty();
        faculty2.setFacultyCode("F002");
        faculty2.setFacultyName("Science");
        facultyRepository.saveAll(List.of(faculty1, faculty2));

        List<FacultyDTO> faculties = facultyService.getAllFaculties();

        assertEquals(2, faculties.size());
        assertEquals("F001", faculties.get(0).getFacultyCode());
        assertEquals("F002", faculties.get(1).getFacultyCode());
    }
}