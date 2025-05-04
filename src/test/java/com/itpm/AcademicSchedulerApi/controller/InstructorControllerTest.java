//package com.itpm.AcademicSchedulerApi.controller;
//
//import com.itpm.AcademicSchedulerApi.controller.dto.InstructorDTO;
//import com.itpm.AcademicSchedulerApi.controller.dto.InstructorPreferencesDto;
//import com.itpm.AcademicSchedulerApi.controller.dto.PreferenceDto;
//import com.itpm.AcademicSchedulerApi.model.Instructor;
//import com.itpm.AcademicSchedulerApi.service.InstructorService;
//import jakarta.persistence.EntityNotFoundException;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//
//import java.time.LocalTime;
//import java.util.Arrays;
//import java.util.List;
//import java.util.Optional;
//import java.util.Set;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//
//class InstructorControllerTest {
//
//    @InjectMocks
//    private InstructorController instructorController;
//
//    @Mock
//    private InstructorService instructorService;
//
//    private Instructor instructor;
//    private InstructorDTO instructorDTO;
//    private PreferenceDto preferenceDto;
//    private InstructorPreferencesDto preferencesDto;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//        instructor = new Instructor();
//        instructor.setId(1L);
//        instructor.setFirstName("John");
//        instructor.setLastName("Doe");
//
//        instructorDTO = new InstructorDTO();
//        instructorDTO.setId(1L);
//        instructorDTO.setFirstName("John");
//        instructorDTO.setLastName("Doe");
//        instructorDTO.setDeptName("Computer Science");
//
//        preferenceDto = new PreferenceDto("Monday", LocalTime.parse("09:00")); // Updated to LocalTime
//        preferenceDto.setId(1L);
//
//        preferencesDto = new InstructorPreferencesDto();
//        preferencesDto.setInstructorName("John Doe");
//        preferencesDto.setPreferences(Set.of(preferenceDto));
//    }
//
//    @Test
//    void testGetAllInstructors_Success() {
//        List<InstructorDTO> instructors = Arrays.asList(instructorDTO);
//        when(instructorService.getAllInstructors()).thenReturn(instructors);
//
//        ResponseEntity<List<InstructorDTO>> response = instructorController.getAllInstructors();
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals(instructors, response.getBody());
//        verify(instructorService, times(1)).getAllInstructors();
//    }
//
//    @Test
//    void testGetInstructorById_Success() {
//        when(instructorService.getInstructorById(anyLong())).thenReturn(Optional.of(instructor));
//
//        ResponseEntity<Instructor> response = instructorController.getInstructorById(1L);
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals(instructor, response.getBody());
//        verify(instructorService, times(1)).getInstructorById(anyLong());
//    }
//
//    @Test
//    void testGetInstructorById_NotFound() {
//        when(instructorService.getInstructorById(anyLong())).thenReturn(Optional.empty());
//
//        ResponseEntity<Instructor> response = instructorController.getInstructorById(1L);
//
//        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
//        verify(instructorService, times(1)).getInstructorById(anyLong());
//    }
//
//    @Test
//    void testCreateInstructor_Success() {
//        when(instructorService.createInstructor(any(InstructorDTO.class))).thenReturn(instructor);
//
//        ResponseEntity<Instructor> response = instructorController.createInstructor(instructorDTO);
//
//        assertEquals(HttpStatus.CREATED, response.getStatusCode());
//        assertEquals(instructor, response.getBody());
//        verify(instructorService, times(1)).createInstructor(any(InstructorDTO.class));
//    }
//
//    @Test
//    void testUpdateInstructor_Success() {
//        when(instructorService.updateInstructor(anyLong(), any(InstructorDTO.class))).thenReturn(instructorDTO);
//
//        ResponseEntity<InstructorDTO> response = instructorController.updateInstructor(1L, instructorDTO);
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals(instructorDTO, response.getBody());
//        verify(instructorService, times(1)).updateInstructor(anyLong(), any(InstructorDTO.class));
//    }
//
//    @Test
//    void testUpdateInstructor_NotFound() {
//        when(instructorService.updateInstructor(anyLong(), any(InstructorDTO.class)))
//                .thenThrow(new EntityNotFoundException("Instructor not found"));
//
//        ResponseEntity<InstructorDTO> response = instructorController.updateInstructor(1L, instructorDTO);
//
//        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
//        verify(instructorService, times(1)).updateInstructor(anyLong(), any(InstructorDTO.class));
//    }
//
//    @Test
//    void testDeleteInstructor_Success() {
//        doNothing().when(instructorService).deleteInstructor(anyLong());
//
//        ResponseEntity<Void> response = instructorController.deleteInstructor(1L);
//
//        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
//        verify(instructorService, times(1)).deleteInstructor(anyLong());
//    }
//
//    @Test
//    void testAddPreference_Success() {
//        when(instructorService.addPreference(anyLong(), anyLong())).thenReturn(instructor);
//
//        ResponseEntity<Instructor> response = instructorController.addPreference(1L, 1L);
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals(instructor, response.getBody());
//        verify(instructorService, times(1)).addPreference(anyLong(), anyLong());
//    }
//
//    @Test
//    void testUpdatePreference_Success() {
//        when(instructorService.updatePreference(anyLong(), any(PreferenceDto.class))).thenReturn(instructorDTO);
//
//        ResponseEntity<InstructorDTO> response = instructorController.updatePreference(1L, preferenceDto);
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals(instructorDTO, response.getBody());
//        verify(instructorService, times(1)).updatePreference(anyLong(), any(PreferenceDto.class));
//    }
//
//    @Test
//    void testGetAllPreferences_Success() {
//        List<InstructorPreferencesDto> preferences = Arrays.asList(preferencesDto);
//        when(instructorService.getAllInstructorPreferences()).thenReturn(preferences);
//
//        ResponseEntity<List<InstructorPreferencesDto>> response = instructorController.getAllPreferences();
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals(preferences, response.getBody());
//        verify(instructorService, times(1)).getAllInstructorPreferences();
//    }
//}