package com.itpm.AcademicSchedulerApi.service;

import com.itpm.AcademicSchedulerApi.controller.dto.FacultyDTO;
import com.itpm.AcademicSchedulerApi.model.Faculty;

import java.util.List;
import java.util.Optional;

public interface FacultyService {

    List<FacultyDTO> getAllFaculties();

    Optional<Faculty> getFacultyById(Long id);

    Faculty createFaculty(FacultyDTO facultyDTO);

    FacultyDTO updateFaculty(Long id, FacultyDTO facultyDTO);

    void deleteFaculty(Long id);
}