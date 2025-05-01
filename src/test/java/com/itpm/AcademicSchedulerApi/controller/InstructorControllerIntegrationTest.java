//package com.itpm.AcademicSchedulerApi.controller;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.itpm.AcademicSchedulerApi.controller.dto.InstructorDTO;
//import com.itpm.AcademicSchedulerApi.controller.dto.PreferenceDto;
//import com.itpm.AcademicSchedulerApi.model.Department;
//import com.itpm.AcademicSchedulerApi.model.Instructor;
//import com.itpm.AcademicSchedulerApi.model.TimeSlot;
//import com.itpm.AcademicSchedulerApi.model.User;
//import com.itpm.AcademicSchedulerApi.repository.DepartmentRepository;
//import com.itpm.AcademicSchedulerApi.repository.InstructorRepository;
//import com.itpm.AcademicSchedulerApi.repository.TimeSlotRepository;
//import com.itpm.AcademicSchedulerApi.repository.UserRepository;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.http.MediaType;
//import org.springframework.security.test.context.support.WithMockUser;
//import org.springframework.test.context.DynamicPropertyRegistry;
//import org.springframework.test.context.DynamicPropertySource;
//import org.springframework.test.web.servlet.MockMvc;
//import org.testcontainers.containers.MySQLContainer;
//import org.testcontainers.junit.jupiter.Container;
//import org.testcontainers.junit.jupiter.Testcontainers;
//
//import java.time.LocalTime;
//import java.util.Set;
//
//import static org.hamcrest.Matchers.*;
//import static org.junit.jupiter.api.Assertions.assertFalse;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@SpringBootTest
//@AutoConfigureMockMvc
//@Testcontainers
//class InstructorControllerIntegrationTest {
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
//    private MockMvc mockMvc;
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
//    @Autowired
//    private ObjectMapper objectMapper;
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
//        user.setPassword("encodedPassword"); // Assume encoded
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
//    @WithMockUser(roles = "ADMIN")
//    void testGetAllInstructors_Success() throws Exception {
//        mockMvc.perform(get("/api/instructors")
//                        .contentType(MediaType.APPLICATION_JSON))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$", hasSize(1)))
//                .andExpect(jsonPath("$[0].firstName", is("John")))
//                .andExpect(jsonPath("$[0].lastName", is("Doe")))
//                .andExpect(jsonPath("$[0].deptName", is("Computer Science")))
//                .andExpect(jsonPath("$[0].username", is("johndoe")))
//                .andExpect(jsonPath("$[0].email", is("john.doe@example.com")));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void testGetInstructorById_Success() throws Exception {
//        mockMvc.perform(get("/api/instructors/{id}", instructor.getId())
//                        .contentType(MediaType.APPLICATION_JSON))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.firstName", is("John")))
//                .andExpect(jsonPath("$.lastName", is("Doe")));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void testGetInstructorById_NotFound() throws Exception {
//        mockMvc.perform(get("/api/instructors/{id}", 999L)
//                        .contentType(MediaType.APPLICATION_JSON))
//                .andExpect(status().isNotFound());
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void testCreateInstructor_Success() throws Exception {
//        InstructorDTO instructorDTO = new InstructorDTO();
//        instructorDTO.setFirstName("Jane");
//        instructorDTO.setLastName("Smith");
//        instructorDTO.setDeptName("Computer Science");
//        instructorDTO.setUsername("janesmith");
//        instructorDTO.setEmail("jane.smith@example.com");
//        instructorDTO.setPassword("password");
//
//        mockMvc.perform(post("/api/instructors")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(instructorDTO)))
//                .andExpect(status().isCreated())
//                .andExpect(jsonPath("$.firstName", is("Jane")))
//                .andExpect(jsonPath("$.lastName", is("Smith")));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void testCreateInstructor_InvalidDepartment() throws Exception {
//        InstructorDTO instructorDTO = new InstructorDTO();
//        instructorDTO.setFirstName("Jane");
//        instructorDTO.setLastName("Smith");
//        instructorDTO.setDeptName("Invalid Dept");
//        instructorDTO.setUsername("janesmith");
//        instructorDTO.setEmail("jane.smith@example.com");
//        instructorDTO.setPassword("password");
//
//        mockMvc.perform(post("/api/instructors")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(instructorDTO)))
//                .andExpect(status().isBadRequest())
//                .andExpect(jsonPath("$.message", is("Invalid department name: Invalid Dept")));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void testUpdateInstructor_Success() throws Exception {
//        InstructorDTO instructorDTO = new InstructorDTO();
//        instructorDTO.setFirstName("Updated");
//        instructorDTO.setLastName("Name");
//        instructorDTO.setDeptName("Computer Science");
//
//        mockMvc.perform(put("/api/instructors/{id}", instructor.getId())
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(instructorDTO)))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.firstName", is("Updated")))
//                .andExpect(jsonPath("$.lastName", is("Name")))
//                .andExpect(jsonPath("$.deptName", is("Computer Science")));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void testUpdateInstructor_NotFound() throws Exception {
//        InstructorDTO instructorDTO = new InstructorDTO();
//        instructorDTO.setFirstName("Updated");
//        instructorDTO.setLastName("Name");
//        instructorDTO.setDeptName("Computer Science");
//
//        mockMvc.perform(put("/api/instructors/{id}", 999L)
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(instructorDTO)))
//                .andExpect(status().isNotFound());
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void testDeleteInstructor_Success() throws Exception {
//        mockMvc.perform(delete("/api/instructors/{id}", instructor.getId())
//                        .contentType(MediaType.APPLICATION_JSON))
//                .andExpect(status().isNoContent());
//
//        assertFalse(instructorRepository.existsById(instructor.getId()));
//        assertFalse(userRepository.existsById(user.getId()));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void testDeleteInstructor_NotFound() throws Exception {
//        mockMvc.perform(delete("/api/instructors/{id}", 999L)
//                        .contentType(MediaType.APPLICATION_JSON))
//                .andExpect(status().isNotFound());
//    }
//
//    @Test
//    @WithMockUser(roles = {"ADMIN", "INSTRUCTOR"})
//    void testAddPreference_Success() throws Exception {
//        TimeSlot newTimeSlot = new TimeSlot();
//        newTimeSlot.setDay("Tuesday");
//        newTimeSlot.setStartTime(LocalTime.parse("10:00"));
//        newTimeSlot = timeSlotRepository.save(newTimeSlot);
//
//        mockMvc.perform(patch("/api/instructors/{id}/preferences/{timeslotId}", instructor.getId(), newTimeSlot.getId())
//                        .contentType(MediaType.APPLICATION_JSON))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.preferences", hasSize(2)));
//    }
//
//    @Test
//    @WithMockUser(roles = {"ADMIN", "INSTRUCTOR"})
//    void testUpdatePreference_Success() throws Exception {
//        PreferenceDto preferenceDto = new PreferenceDto("Monday", LocalTime.parse("09:00"));
//        preferenceDto.setId(timeSlot.getId());
//
//        mockMvc.perform(patch("/api/instructors/{id}/preferences", instructor.getId())
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(preferenceDto)))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.firstName", is("John")))
//                .andExpect(jsonPath("$.deptName", is("Computer Science")));
//    }
//
//    @Test
//    @WithMockUser(roles = {"ADMIN", "INSTRUCTOR"})
//    void testGetAllPreferences_Success() throws Exception {
//        mockMvc.perform(get("/api/instructors/preferences")
//                        .contentType(MediaType.APPLICATION_JSON))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$", hasSize(1)))
//                .andExpect(jsonPath("$[0].instructorName", is("John Doe")))
//                .andExpect(jsonPath("$[0].preferences", hasSize(1)))
//                .andExpect(jsonPath("$[0].preferences[0].day", is("Monday")))
//                .andExpect(jsonPath("$[0].preferences[0].startTime", is("09:00:00")));
//    }
//}