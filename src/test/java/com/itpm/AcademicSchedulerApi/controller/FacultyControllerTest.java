package com.itpm.AcademicSchedulerApi.controller;

import com.itpm.AcademicSchedulerApi.controller.dto.FacultyDTO;
import com.itpm.AcademicSchedulerApi.model.Faculty;
import com.itpm.AcademicSchedulerApi.service.FacultyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

class FacultyControllerTest {

    @InjectMocks
    private FacultyController facultyController;

    @Mock
    private FacultyService facultyService;

    private Faculty faculty;
    private FacultyDTO facultyDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        faculty = new Faculty();
        faculty.setId(1L);
        faculty.setFacultyCode("F001");
        faculty.setFacultyName("Engineering");

        facultyDTO = new FacultyDTO(1L, "F001", "Engineering");
    }

    @Test
    void testCreateFaculty_Success() {
        when(facultyService.createFaculty(any(FacultyDTO.class))).thenReturn(faculty);

        ResponseEntity<Faculty> response = facultyController.createFaculty(facultyDTO);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(faculty, response.getBody());
        verify(facultyService, times(1)).createFaculty(any(FacultyDTO.class));
    }

    @Test
    void testUpdateFaculty_Success() {
        when(facultyService.updateFaculty(anyLong(), any(FacultyDTO.class))).thenReturn(facultyDTO);

        ResponseEntity<FacultyDTO> response = facultyController.updateFaculty(1L, facultyDTO);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(facultyDTO, response.getBody());
        verify(facultyService, times(1)).updateFaculty(anyLong(), any(FacultyDTO.class));
    }

    @Test
    void testDeleteFaculty_Success() {
        doNothing().when(facultyService).deleteFaculty(anyLong());

        ResponseEntity<Void> response = facultyController.deleteFaculty(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(facultyService, times(1)).deleteFaculty(anyLong());
    }

    @Test
    void testGetFacultyById_Success() {
        when(facultyService.getFacultyById(anyLong())).thenReturn(Optional.of(faculty));

        ResponseEntity<Faculty> response = facultyController.getFacultyById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(faculty, response.getBody());
        verify(facultyService, times(1)).getFacultyById(anyLong());
    }

    @Test
    void testGetFacultyById_NotFound() {
        when(facultyService.getFacultyById(anyLong())).thenReturn(Optional.empty());

        ResponseEntity<Faculty> response = facultyController.getFacultyById(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(facultyService, times(1)).getFacultyById(anyLong());
    }

    @Test
    void testGetAllFaculties_Success() {
        List<FacultyDTO> facultyDTOList = Arrays.asList(facultyDTO);
        when(facultyService.getAllFaculties()).thenReturn(facultyDTOList);

        ResponseEntity<List<FacultyDTO>> response = facultyController.getAllFaculties();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(facultyDTOList, response.getBody());
        verify(facultyService, times(1)).getAllFaculties();
    }
}