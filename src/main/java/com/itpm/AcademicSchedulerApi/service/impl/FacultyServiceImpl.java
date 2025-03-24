package com.itpm.AcademicSchedulerApi.service.impl;


import com.itpm.AcademicSchedulerApi.controller.dto.FacultyDTO;
import com.itpm.AcademicSchedulerApi.model.Faculty;
import com.itpm.AcademicSchedulerApi.repository.FacultyRepository;
import com.itpm.AcademicSchedulerApi.service.FacultyService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor(onConstructor_ = {@Autowired})
public class FacultyServiceImpl implements FacultyService {

    private final FacultyRepository facultyRepository;

    public List<FacultyDTO> getAllFaculties() {
        return facultyRepository.findAll().stream()
                .map(faculty -> new FacultyDTO(faculty.getId(), faculty.getFacultyCode(), faculty.getFacultyName()))
                .collect(Collectors.toList());
    }

    public Optional<Faculty> getFacultyById(Long id) {
        return facultyRepository.findById(id);
    }

    public Faculty createFaculty(FacultyDTO facultyDTO) {
        Faculty faculty = new Faculty();
        faculty.setFacultyCode(facultyDTO.getFacultyCode());
        faculty.setFacultyName(facultyDTO.getFacultyName());
        return facultyRepository.save(faculty);
    }
    public FacultyDTO updateFaculty(Long id, FacultyDTO facultyDTO) {
        Optional<Faculty> facultyOptional = facultyRepository.findById(id);
        if (facultyOptional.isPresent()) {
            Faculty faculty = facultyOptional.get();
            faculty.setFacultyCode(facultyDTO.getFacultyCode());
            faculty.setFacultyName(facultyDTO.getFacultyName());
            Faculty updatedFaculty = facultyRepository.save(faculty);
            return new FacultyDTO(updatedFaculty.getId(), updatedFaculty.getFacultyCode(), updatedFaculty.getFacultyName());
        } else {
            throw new EntityNotFoundException("Faculty not found with id: " + id);
        }
    }


    public void deleteFaculty(Long id) {
        facultyRepository.deleteById(id);
    }
}
