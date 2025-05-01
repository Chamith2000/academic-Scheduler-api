package com.itpm.AcademicSchedulerApi.service;

import com.itpm.AcademicSchedulerApi.controller.dto.FacultyDTO;
import com.itpm.AcademicSchedulerApi.model.Faculty;
import com.itpm.AcademicSchedulerApi.repository.FacultyRepository;
import com.itpm.AcademicSchedulerApi.service.impl.FacultyServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FacultyServiceImplTest {

    @Mock
    private FacultyRepository facultyRepository;

    @InjectMocks
    private FacultyServiceImpl facultyService;

    private Faculty testFaculty;
    private FacultyDTO testFacultyDTO;

    @BeforeEach
    void setUp() {
        testFaculty = new Faculty();
        testFaculty.setId(1L);
        testFaculty.setFacultyCode("FCI");
        testFaculty.setFacultyName("Faculty of Computing and Informatics");

        testFacultyDTO = new FacultyDTO();
        testFacultyDTO.setId(1L);
        testFacultyDTO.setFacultyCode("FCI");
        testFacultyDTO.setFacultyName("Faculty of Computing and Informatics");
    }

    @Test
    void getAllFaculties_ShouldReturnAllFaculties() {
        // Arrange
        Faculty faculty1 = new Faculty();
        faculty1.setId(1L);
        faculty1.setFacultyCode("FCI");
        faculty1.setFacultyName("Faculty of Computing and Informatics");

        Faculty faculty2 = new Faculty();
        faculty2.setId(2L);
        faculty2.setFacultyCode("FOE");
        faculty2.setFacultyName("Faculty of Engineering");

        when(facultyRepository.findAll()).thenReturn(Arrays.asList(faculty1, faculty2));

        // Act
        List<FacultyDTO> faculties = facultyService.getAllFaculties();

        // Assert
        assertEquals(2, faculties.size());
        assertEquals("FCI", faculties.get(0).getFacultyCode());
        assertEquals("FOE", faculties.get(1).getFacultyCode());
        verify(facultyRepository, times(1)).findAll();
    }

    @Test
    void getFacultyById_WhenFacultyExists_ShouldReturnFaculty() {
        // Arrange
        when(facultyRepository.findById(1L)).thenReturn(Optional.of(testFaculty));

        // Act
        Optional<Faculty> result = facultyService.getFacultyById(1L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getId());
        assertEquals("FCI", result.get().getFacultyCode());
        assertEquals("Faculty of Computing and Informatics", result.get().getFacultyName());
        verify(facultyRepository, times(1)).findById(1L);
    }

    @Test
    void getFacultyById_WhenFacultyDoesNotExist_ShouldReturnEmptyOptional() {
        // Arrange
        when(facultyRepository.findById(999L)).thenReturn(Optional.empty());

        // Act
        Optional<Faculty> result = facultyService.getFacultyById(999L);

        // Assert
        assertFalse(result.isPresent());
        verify(facultyRepository, times(1)).findById(999L);
    }

    @Test
    void createFaculty_ShouldSaveAndReturnFaculty() {
        // Arrange
        FacultyDTO facultyDTO = new FacultyDTO(null, "FCI", "Faculty of Computing and Informatics");
        Faculty expectedFaculty = new Faculty();
        expectedFaculty.setId(1L);
        expectedFaculty.setFacultyCode("FCI");
        expectedFaculty.setFacultyName("Faculty of Computing and Informatics");

        when(facultyRepository.save(any(Faculty.class))).thenReturn(expectedFaculty);

        // Act
        Faculty result = facultyService.createFaculty(facultyDTO);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("FCI", result.getFacultyCode());
        assertEquals("Faculty of Computing and Informatics", result.getFacultyName());
        verify(facultyRepository, times(1)).save(any(Faculty.class));
    }

    @Test
    void updateFaculty_WhenFacultyExists_ShouldUpdateAndReturnFacultyDTO() {
        // Arrange
        FacultyDTO updateDTO = new FacultyDTO(1L, "FCI_UPD", "Faculty of Computing and Informatics Updated");

        Faculty existingFaculty = new Faculty();
        existingFaculty.setId(1L);
        existingFaculty.setFacultyCode("FCI");
        existingFaculty.setFacultyName("Faculty of Computing and Informatics");

        Faculty updatedFaculty = new Faculty();
        updatedFaculty.setId(1L);
        updatedFaculty.setFacultyCode("FCI_UPD");
        updatedFaculty.setFacultyName("Faculty of Computing and Informatics Updated");

        when(facultyRepository.findById(1L)).thenReturn(Optional.of(existingFaculty));
        when(facultyRepository.save(any(Faculty.class))).thenReturn(updatedFaculty);

        // Act
        FacultyDTO result = facultyService.updateFaculty(1L, updateDTO);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("FCI_UPD", result.getFacultyCode());
        assertEquals("Faculty of Computing and Informatics Updated", result.getFacultyName());
        verify(facultyRepository, times(1)).findById(1L);
        verify(facultyRepository, times(1)).save(any(Faculty.class));
    }

    @Test
    void updateFaculty_WhenFacultyDoesNotExist_ShouldThrowEntityNotFoundException() {
        // Arrange
        FacultyDTO updateDTO = new FacultyDTO(999L, "FCI_UPD", "Faculty of Computing and Informatics Updated");
        when(facultyRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> {
            facultyService.updateFaculty(999L, updateDTO);
        });
        verify(facultyRepository, times(1)).findById(999L);
        verify(facultyRepository, never()).save(any(Faculty.class));
    }

    @Test
    void deleteFaculty_ShouldCallRepositoryDeleteById() {
        // Act
        facultyService.deleteFaculty(1L);

        // Assert
        verify(facultyRepository, times(1)).deleteById(1L);
    }
}