//package com.itpm.AcademicSchedulerApi.service;
//
//import com.itpm.AcademicSchedulerApi.controller.dto.InstructorDTO;
//import com.itpm.AcademicSchedulerApi.controller.dto.InstructorPreferencesDto;
//import com.itpm.AcademicSchedulerApi.controller.dto.PreferenceDto;
//import com.itpm.AcademicSchedulerApi.model.Department;
//import com.itpm.AcademicSchedulerApi.model.Instructor;
//import com.itpm.AcademicSchedulerApi.model.TimeSlot;
//import com.itpm.AcademicSchedulerApi.model.User;
//import com.itpm.AcademicSchedulerApi.repository.DepartmentRepository;
//import com.itpm.AcademicSchedulerApi.repository.InstructorRepository;
//import com.itpm.AcademicSchedulerApi.repository.TimeSlotRepository;
//import com.itpm.AcademicSchedulerApi.repository.UserRepository;
//import com.itpm.AcademicSchedulerApi.service.impl.AuthenticationServiceImpl;
//import com.itpm.AcademicSchedulerApi.service.impl.InstructorServiceImpl;
//import jakarta.persistence.EntityNotFoundException;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//
//import java.time.LocalTime;
//import java.util.*;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//
//class InstructorServiceImplTest {
//
//    @InjectMocks
//    private InstructorServiceImpl instructorService;
//
//    @Mock
//    private InstructorRepository instructorRepository;
//
//    @Mock
//    private DepartmentRepository departmentRepository;
//
//    @Mock
//    private TimeSlotRepository timeSlotRepository;
//
//    @Mock
//    private UserRepository userRepository;
//
//    @Mock
//    private AuthenticationServiceImpl authenticationService;
//
//    private Instructor instructor;
//    private InstructorDTO instructorDTO;
//    private Department department;
//    private User user;
//    private TimeSlot timeSlot;
//    private PreferenceDto preferenceDto;
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
//        instructorDTO.setUsername("johndoe");
//        instructorDTO.setPassword("password");
//        instructorDTO.setEmail("john.doe@example.com");
//
//        department = new Department();
//        department.setId(1L);
//        department.setName("Computer Science");
//
//        user = new User();
//        user.setId(1L);
//        user.setUsername("johndoe");
//        user.setEmail("john.doe@example.com");
//
//        timeSlot = new TimeSlot();
//        timeSlot.setId(1L);
//        timeSlot.setDay("Monday");
//        timeSlot.setStartTime(LocalTime.parse("09:00"));
//
//        preferenceDto = new PreferenceDto("Monday", LocalTime.parse("09:00"));
//        preferenceDto.setId(1L);
//    }
//
//    @Test
//    void testGetAllInstructors_Success() {
//        instructor.setDepartment(department);
//        instructor.setUser(user);
//        List<Instructor> instructors = Arrays.asList(instructor);
//        when(instructorRepository.findAll()).thenReturn(instructors);
//
//        List<InstructorDTO> result = instructorService.getAllInstructors();
//
//        assertEquals(1, result.size());
//        assertEquals("John", result.get(0).getFirstName());
//        assertEquals("Computer Science", result.get(0).getDeptName());
//        assertEquals("johndoe", result.get(0).getUsername());
//        verify(instructorRepository, times(1)).findAll();
//    }
//
//    @Test
//    void testGetInstructorById_Success() {
//        when(instructorRepository.findById(anyLong())).thenReturn(Optional.of(instructor));
//
//        Optional<Instructor> result = instructorService.getInstructorById(1L);
//
//        assertTrue(result.isPresent());
//        assertEquals(instructor, result.get());
//        verify(instructorRepository, times(1)).findById(anyLong());
//    }
//
//    @Test
//    void testGetInstructorById_NotFound() {
//        when(instructorRepository.findById(anyLong())).thenReturn(Optional.empty());
//
//        Optional<Instructor> result = instructorService.getInstructorById(1L);
//
//        assertFalse(result.isPresent());
//        verify(instructorRepository, times(1)).findById(anyLong());
//    }
//
//    @Test
//    void testCreateInstructor_Success() {
//        when(authenticationService.registerInstructorUser(anyString(), anyString(), anyString())).thenReturn(user);
//        when(departmentRepository.findByName(anyString())).thenReturn(Optional.of(department));
//        when(instructorRepository.save(any(Instructor.class))).thenReturn(instructor);
//
//        Instructor result = instructorService.createInstructor(instructorDTO);
//
//        assertEquals(instructor, result);
//        verify(authenticationService, times(1)).registerInstructorUser("johndoe", "password", "john.doe@example.com");
//        verify(departmentRepository, times(1)).findByName("Computer Science");
//        verify(instructorRepository, times(1)).save(any(Instructor.class));
//    }
//
//    @Test
//    void testCreateInstructor_DepartmentNotFound() {
//        when(departmentRepository.findByName(anyString())).thenReturn(Optional.empty());
//
//        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
//            instructorService.createInstructor(instructorDTO);
//        });
//
//        assertEquals("Invalid department name: Computer Science", exception.getMessage());
//        verify(departmentRepository, times(1)).findByName("Computer Science");
//        verify(instructorRepository, never()).save(any(Instructor.class));
//    }
//
//    @Test
//    void testUpdateInstructor_Success() {
//        when(instructorRepository.findById(anyLong())).thenReturn(Optional.of(instructor));
//        when(departmentRepository.findByName(anyString())).thenReturn(Optional.of(department));
//        when(instructorRepository.save(any(Instructor.class))).thenReturn(instructor);
//
//        InstructorDTO result = instructorService.updateInstructor(1L, instructorDTO);
//
//        assertEquals("John", result.getFirstName());
//        assertEquals("Doe", result.getLastName());
//        assertEquals("Computer Science", result.getDeptName());
//        verify(instructorRepository, times(1)).findById(anyLong());
//        verify(departmentRepository, times(1)).findByName("Computer Science");
//        verify(instructorRepository, times(1)).save(any(Instructor.class));
//    }
//
//    @Test
//    void testUpdateInstructor_NotFound() {
//        when(instructorRepository.findById(anyLong())).thenReturn(Optional.empty());
//
//        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
//            instructorService.updateInstructor(1L, instructorDTO);
//        });
//
//        assertEquals("Instructor not found with id: 1", exception.getMessage());
//        verify(instructorRepository, times(1)).findById(anyLong());
//        verify(instructorRepository, never()).save(any(Instructor.class));
//    }
//
//    @Test
//    void testDeleteInstructor_Success() {
//        instructor.setUser(user);
//        when(instructorRepository.findById(anyLong())).thenReturn(Optional.of(instructor));
//        doNothing().when(instructorRepository).delete(any(Instructor.class));
//        doNothing().when(userRepository).delete(any(User.class));
//
//        instructorService.deleteInstructor(1L);
//
//        verify(instructorRepository, times(1)).findById(anyLong());
//        verify(instructorRepository, times(1)).delete(any(Instructor.class));
//        verify(userRepository, times(1)).delete(any(User.class));
//    }
//
//    @Test
//    void testDeleteInstructor_NotFound() {
//        when(instructorRepository.findById(anyLong())).thenReturn(Optional.empty());
//
//        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
//            instructorService.deleteInstructor(1L);
//        });
//
//        assertEquals("Instructor not found with id: 1", exception.getMessage());
//        verify(instructorRepository, times(1)).findById(anyLong());
//        verify(instructorRepository, never()).delete(any(Instructor.class));
//    }
//
//    @Test
//    void testAddPreference_Success() {
//        instructor.setPreferences(new HashSet<>());
//        when(instructorRepository.findById(anyLong())).thenReturn(Optional.of(instructor));
//        when(timeSlotRepository.findById(anyLong())).thenReturn(Optional.of(timeSlot));
//        when(instructorRepository.save(any(Instructor.class))).thenReturn(instructor);
//
//        Instructor result = instructorService.addPreference(1L, 1L);
//
//        assertEquals(instructor, result);
//        assertTrue(instructor.getPreferences().contains(timeSlot));
//        verify(instructorRepository, times(1)).findById(anyLong());
//        verify(timeSlotRepository, times(1)).findById(anyLong());
//        verify(instructorRepository, times(1)).save(any(Instructor.class));
//    }
//
//    @Test
//    void testAddPreference_InstructorNotFound() {
//        when(instructorRepository.findById(anyLong())).thenReturn(Optional.empty());
//
//        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
//            instructorService.addPreference(1L, 1L);
//        });
//
//        assertEquals("Instructor not found with id: 1", exception.getMessage());
//        verify(instructorRepository, times(1)).findById(anyLong());
//        verify(timeSlotRepository, never()).findById(anyLong());
//    }
//
//    @Test
//    void testUpdatePreference_Success() {
//        instructor.setPreferences(new HashSet<>(Arrays.asList(timeSlot)));
//        when(instructorRepository.findById(1L)).thenReturn(Optional.of(instructor));
//        when(timeSlotRepository.findByDayAndStartTime("Monday", LocalTime.parse("09:00"))).thenReturn(Optional.of(timeSlot));
//        when(instructorRepository.save(any(Instructor.class))).thenReturn(instructor);
//
//        InstructorDTO result = instructorService.updatePreference(1L, preferenceDto);
//
//        assertNotNull(result);
//        assertEquals("John", result.getFirstName());
//        assertEquals("Doe", result.getLastName());
//        verify(instructorRepository, times(1)).findById(1L);
//        verify(timeSlotRepository, times(1)).findByDayAndStartTime("Monday", LocalTime.parse("09:00"));
//        verify(instructorRepository, times(1)).save(any(Instructor.class));
//    }
//
//    @Test
//    void testUpdatePreference_InstructorNotFound() {
//        when(instructorRepository.findById(anyLong())).thenReturn(Optional.empty());
//
//        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
//            instructorService.updatePreference(1L, preferenceDto);
//        });
//
//        assertEquals("Instructor not found with id: 1", exception.getMessage());
//        verify(instructorRepository, times(1)).findById(anyLong());
//        verify(timeSlotRepository, never()).findByDayAndStartTime(anyString(), any(LocalTime.class));
//    }
//
//    @Test
//    void testGetAllInstructorPreferences_Success() {
//        instructor.setPreferences(new HashSet<>(Arrays.asList(timeSlot)));
//        List<Instructor> instructors = Arrays.asList(instructor);
//        when(instructorRepository.findAll()).thenReturn(instructors);
//
//        List<InstructorPreferencesDto> result = instructorService.getAllInstructorPreferences();
//
//        assertEquals(1, result.size());
//        assertEquals("John Doe", result.get(0).getInstructorName());
//        assertEquals(1, result.get(0).getPreferences().size());
//        verify(instructorRepository, times(1)).findAll();
//    }
//
//    @Test
//    void testGetAllInstructorPreferences_NoPreferences() {
//        instructor.setPreferences(new HashSet<>());
//        List<Instructor> instructors = Arrays.asList(instructor);
//        when(instructorRepository.findAll()).thenReturn(instructors);
//
//        List<InstructorPreferencesDto> result = instructorService.getAllInstructorPreferences();
//
//        assertEquals(0, result.size());
//        verify(instructorRepository, times(1)).findAll();
//    }
//}