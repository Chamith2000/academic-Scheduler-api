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
//import com.itpm.AcademicSchedulerApi.service.impl.InstructorServiceImpl;
//import jakarta.persistence.EntityNotFoundException;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.test.context.DynamicPropertyRegistry;
//import org.springframework.test.context.DynamicPropertySource;
//import org.testcontainers.containers.MySQLContainer;
//import org.testcontainers.junit.jupiter.Container;
//import org.testcontainers.junit.jupiter.Testcontainers;
//
//import java.time.LocalTime;
//import java.util.List;
//import java.util.Optional;
//import java.util.Set;
//
//import static org.junit.jupiter.api.Assertions.*;
//
//@SpringBootTest
//@Testcontainers
//class InstructorServiceImplIntegrationTest {
//
//    @Container
//    static MySQLContainer<?> mysqlContainer = new MySQLContainer<>("mysql:8.0")
//            .withDatabaseName("testdb")
//            .withUsername("test")
//            .withPassword("test");
//
//    @DynamicPropertySource
//    static void configureProperties(DynamicPropertyRegistry registry) {
//        registry.add("spring.datasource.url", mysqlContainer::getJdbcUrl);
//        registry.add("spring.datasource.username", mysqlContainer::getUsername);
//        registry.add("spring.datasource.password", mysqlContainer::getPassword);
//        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
//    }
//
//    @Autowired
//    private InstructorServiceImpl instructorService;
//
//    @Autowired
//    private InstructorRepository instructorRepository;
//
//    @Autowired
//    private DepartmentRepository departmentRepository;
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private TimeSlotRepository timeSlotRepository;
//
//    private Department department;
//    private User user;
//    private TimeSlot timeSlot;
//    private Instructor instructor;
//
//    @BeforeEach
//    void setUp() {
//        instructorRepository.deleteAll();
//        userRepository.deleteAll();
//        departmentRepository.deleteAll();
//        timeSlotRepository.deleteAll();
//
//        department = new Department();
//        department.setName("Computer Science");
//        department = departmentRepository.save(department);
//
//        user = new User();
//        user.setUsername("johndoe");
//        user.setEmail("john.doe@example.com");
//        user.setPassword("encodedPassword");
//        user = userRepository.save(user);
//
//        timeSlot = new TimeSlot();
//        timeSlot.setDay("Monday");
//        timeSlot.setStartTime(LocalTime.parse("09:00"));
//        timeSlot = timeSlotRepository.save(timeSlot);
//
//        instructor = new Instructor();
//        instructor.setFirstName("John");
//        instructor.setLastName("Doe");
//        instructor.setDepartment(department);
//        instructor.setUser(user);
//        instructor.setPreferences(Set.of(timeSlot));
//        instructor = instructorRepository.save(instructor);
//    }
//
//    @Test
//    void testGetAllInstructors_Success() {
//        List<InstructorDTO> instructors = instructorService.getAllInstructors();
//
//        assertEquals(1, instructors.size());
//        assertEquals("John", instructors.get(0).getFirstName());
//        assertEquals("Doe", instructors.get(0).getLastName());
//        assertEquals("Computer Science", instructors.get(0).getDeptName());
//        assertEquals("johndoe", instructors.get(0).getUsername());
//    }
//
//    @Test
//    void testGetInstructorById_Success() {
//        Optional<Instructor> result = instructorService.getInstructorById(instructor.getId());
//
//        assertTrue(result.isPresent());
//        assertEquals("John", result.get().getFirstName());
//        assertEquals("Doe", result.get().getLastName());
//    }
//
//    @Test
//    void testGetInstructorById_NotFound() {
//        Optional<Instructor> result = instructorService.getInstructorById(999L);
//
//        assertFalse(result.isPresent());
//    }
//
//    @Test
//    void testCreateInstructor_Success() {
//        InstructorDTO instructorDTO = new InstructorDTO();
//        instructorDTO.setFirstName("Jane");
//        instructorDTO.setLastName("Smith");
//        instructorDTO.setDeptName("Computer Science");
//        instructorDTO.setUsername("janesmith");
//        instructorDTO.setEmail("jane.smith@example.com");
//        instructorDTO.setPassword("password");
//
//        Instructor result = instructorService.createInstructor(instructorDTO);
//
//        assertNotNull(result.getId());
//        assertEquals("Jane", result.getFirstName());
//        assertEquals("Smith", result.getLastName());
//        assertEquals("Computer Science", result.getDepartment().getName());
//        assertEquals("janesmith", result.getUser().getUsername());
//    }
//
//    @Test
//    void testCreateInstructor_InvalidDepartment() {
//        InstructorDTO instructorDTO = new InstructorDTO();
//        instructorDTO.setFirstName("Jane");
//        instructorDTO.setLastName("Smith");
//        instructorDTO.setDeptName("Invalid Dept");
//        instructorDTO.setUsername("janesmith");
//        instructorDTO.setEmail("jane.smith@example.com");
//        instructorDTO.setPassword("password");
//
//        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
//            instructorService.createInstructor(instructorDTO);
//        });
//
//        assertEquals("Invalid department name: Invalid Dept", exception.getMessage());
//    }
//
//    @Test
//    void testUpdateInstructor_Success() {
//        InstructorDTO instructorDTO = new InstructorDTO();
//        instructorDTO.setFirstName("Updated");
//        instructorDTO.setLastName("Name");
//        instructorDTO.setDeptName("Computer Science");
//
//        InstructorDTO result = instructorService.updateInstructor(instructor.getId(), instructorDTO);
//
//        assertEquals("Updated", result.getFirstName());
//        assertEquals("Name", result.getLastName());
//        assertEquals("Computer Science", result.getDeptName());
//    }
//
//    @Test
//    void testUpdateInstructor_NotFound() {
//        InstructorDTO instructorDTO = new InstructorDTO();
//        instructorDTO.setFirstName("Updated");
//        instructorDTO.setLastName("Name");
//        instructorDTO.setDeptName("Computer Science");
//
//        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
//            instructorService.updateInstructor(999L, instructorDTO);
//        });
//
//        assertEquals("Instructor not found with id: 999", exception.getMessage());
//    }
//
//    @Test
//    void testDeleteInstructor_Success() {
//        instructorService.deleteInstructor(instructor.getId());
//
//        assertFalse(instructorRepository.existsById(instructor.getId()));
//        assertFalse(userRepository.existsById(user.getId()));
//    }
//
//    @Test
//    void testDeleteInstructor_NotFound() {
//        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
//            instructorService.deleteInstructor(999L);
//        });
//
//        assertEquals("Instructor not found with id: 999", exception.getMessage());
//    }
//
//    @Test
//    void testAddPreference_Success() {
//        TimeSlot newTimeSlot = new TimeSlot();
//        newTimeSlot.setDay("Tuesday");
//        newTimeSlot.setStartTime(LocalTime.parse("10:00"));
//        newTimeSlot = timeSlotRepository.save(newTimeSlot);
//
//        Instructor result = instructorService.addPreference(instructor.getId(), newTimeSlot.getId());
//
//        assertEquals(2, result.getPreferences().size());
//        assertTrue(result.getPreferences().contains(newTimeSlot));
//    }
//
//    @Test
//    void testAddPreference_InstructorNotFound() {
//        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
//            instructorService.addPreference(999L, timeSlot.getId());
//        });
//
//        assertEquals("Instructor not found with id: 999", exception.getMessage());
//    }
//
//    @Test
//    void testUpdatePreference_Success() {
//        PreferenceDto preferenceDto = new PreferenceDto("Monday", LocalTime.parse("09:00"));
//        preferenceDto.setId(timeSlot.getId());
//
//        InstructorDTO result = instructorService.updatePreference(instructor.getId(), preferenceDto);
//
//        assertEquals("John", result.getFirstName());
//        assertEquals("Doe", result.getLastName());
//        assertEquals(1, instructorRepository.findById(instructor.getId()).get().getPreferences().size());
//    }
//
//    @Test
//    void testUpdatePreference_InstructorNotFound() {
//        PreferenceDto preferenceDto = new PreferenceDto("Monday", LocalTime.parse("09:00"));
//        preferenceDto.setId(timeSlot.getId());
//
//        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
//            instructorService.updatePreference(999L, preferenceDto);
//        });
//
//        assertEquals("Instructor not found with id: 999", exception.getMessage());
//    }
//
//    @Test
//    void testGetAllInstructorPreferences_Success() {
//        List<InstructorPreferencesDto> result = instructorService.getAllInstructorPreferences();
//
//        assertEquals(1, result.size());
//        assertEquals("John Doe", result.get(0).getInstructorName());
//        assertEquals(1, result.get(0).getPreferences().size());
//        assertEquals("Monday", result.get(0).getPreferences().iterator().next().getDay());
//    }
//
//    @Test
//    void testGetAllInstructorPreferences_NoPreferences() {
//        instructor.setPreferences(Set.of());
//        instructorRepository.save(instructor);
//
//        List<InstructorPreferencesDto> result = instructorService.getAllInstructorPreferences();
//
//        assertEquals(0, result.size());
//    }
//}