package com.itpm.AcademicSchedulerApi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itpm.AcademicSchedulerApi.controller.dto.FacultyDTO;
import com.itpm.AcademicSchedulerApi.model.Faculty;
import com.itpm.AcademicSchedulerApi.repository.FacultyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FacultyControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private FacultyDTO facultyDTO;

    @BeforeEach
    void setUp() {
        facultyRepository.deleteAll(); // Clear database before each test
        facultyDTO = new FacultyDTO(null, "F001", "Engineering");
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void testCreateFaculty_Success() throws Exception {
        mockMvc.perform(post("/api/faculties")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.faculty_code", is("F001"))) // Updated to faculty_code
                .andExpect(jsonPath("$.faculty_name", is("Engineering"))); // Updated to faculty_name

        // Verify database state
        Faculty savedFaculty = facultyRepository.findByFacultyName("Engineering").orElseThrow();
        assert savedFaculty.getFacultyCode().equals("F001");
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void testUpdateFaculty_Success() throws Exception {
        // Create a faculty
        Faculty faculty = new Faculty();
        faculty.setFacultyCode("F001");
        faculty.setFacultyName("Engineering");
        faculty = facultyRepository.save(faculty);

        FacultyDTO updatedDTO = new FacultyDTO(faculty.getId(), "F002", "Updated Engineering");

        mockMvc.perform(put("/api/faculties/{id}", faculty.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.facultyCode", is("F002"))) // UpdateFaculty returns FacultyDTO
                .andExpect(jsonPath("$.facultyName", is("Updated Engineering"))); // UpdateFaculty returns FacultyDTO

        // Verify database state
        Faculty updatedFaculty = facultyRepository.findById(faculty.getId()).orElseThrow();
        assert updatedFaculty.getFacultyCode().equals("F002");
        assert updatedFaculty.getFacultyName().equals("Updated Engineering");
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void testDeleteFaculty_Success() throws Exception {
        // Create a faculty
        Faculty faculty = new Faculty();
        faculty.setFacultyCode("F001");
        faculty.setFacultyName("Engineering");
        faculty = facultyRepository.save(faculty);

        mockMvc.perform(delete("/api/faculties/{id}", faculty.getId()))
                .andExpect(status().isNoContent());

        // Verify database state
        assert facultyRepository.findById(faculty.getId()).isEmpty();
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void testGetFacultyById_Success() throws Exception {
        // Create a faculty
        Faculty faculty = new Faculty();
        faculty.setFacultyCode("F001");
        faculty.setFacultyName("Engineering");
        faculty = facultyRepository.save(faculty);

        mockMvc.perform(get("/api/faculties/{id}", faculty.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.faculty_code", is("F001"))) // Updated to faculty_code
                .andExpect(jsonPath("$.faculty_name", is("Engineering"))); // Updated to faculty_name
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void testGetFacultyById_NotFound() throws Exception {
        mockMvc.perform(get("/api/faculties/{id}", 999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void testGetAllFaculties_Success() throws Exception {
        // Create faculties
        Faculty faculty1 = new Faculty();
        faculty1.setFacultyCode("F001");
        faculty1.setFacultyName("Engineering");
        Faculty faculty2 = new Faculty();
        faculty2.setFacultyCode("F002");
        faculty2.setFacultyName("Science");
        facultyRepository.saveAll(List.of(faculty1, faculty2));

        mockMvc.perform(get("/api/faculties"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].facultyCode", is("F001"))) // GetAllFaculties returns FacultyDTO
                .andExpect(jsonPath("$[1].facultyCode", is("F002"))); // GetAllFaculties returns FacultyDTO
    }
}