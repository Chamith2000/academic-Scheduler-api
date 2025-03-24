package com.itpm.AcademicSchedulerApi.service.impl;

import com.itpm.AcademicSchedulerApi.controller.dto.DepartmentDTO;
import com.itpm.AcademicSchedulerApi.model.Department;
import com.itpm.AcademicSchedulerApi.model.Faculty;
import com.itpm.AcademicSchedulerApi.repository.DepartmentRepository;
import com.itpm.AcademicSchedulerApi.repository.FacultyRepository;
import com.itpm.AcademicSchedulerApi.service.DepartmentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor(onConstructor_ = {@Autowired})
public class DepartmentServiceImpl implements DepartmentService {

    private  DepartmentRepository departmentRepository;
    private FacultyRepository facultyRepository;

    public Department createDepartment(DepartmentDTO departmentDto) {
        System.out.println(departmentDto.toString());
        Department department = new Department();
        department.setDept_code(departmentDto.getDeptCode());
        department.setName(departmentDto.getDeptName());

        Faculty faculty = facultyRepository.findByFacultyName(departmentDto.getFacultyName())
                .orElseThrow(() -> new IllegalArgumentException("Invalid faculty name:" + departmentDto.getFacultyName()));
        department.setFaculty(faculty);

        return departmentRepository.save(department);
    }


    public DepartmentDTO updateDepartment(Long id, DepartmentDTO departmentDTO) {
        Optional<Department> departmentOptional = departmentRepository.findById(id);
        if (departmentOptional.isPresent()) {
            Department department = departmentOptional.get();
            department.setDept_code(departmentDTO.getDeptCode());
            department.setName(departmentDTO.getDeptName());

            // Fetching related Faculty
            Optional<Faculty> faculty = facultyRepository.findByFacultyName(departmentDTO.getFacultyName());
            if (faculty == null) {
                throw new EntityNotFoundException("Faculty not found with name: " + departmentDTO.getFacultyName());
            }
            department.setFaculty(faculty.get());

            Department updatedDepartment = departmentRepository.save(department);
            return new DepartmentDTO(
                    updatedDepartment.getId(),
                    updatedDepartment.getDept_code(),
                    updatedDepartment.getName(),
                    updatedDepartment.getFaculty().getFacultyName());
        } else {
            throw new EntityNotFoundException("Department not found with id: " + id);
        }
    }
    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }

    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
    }

    public List<DepartmentDTO> getAllDepartments() {
        List<Department> departments = departmentRepository.findAll();
        List<DepartmentDTO> departmentDTOs = new ArrayList<>();

        for (Department department : departments) {
            Faculty faculty = department.getFaculty();
            DepartmentDTO departmentDTO = new DepartmentDTO(
                    department.getId(),
                    department.getDept_code(),
                    department.getName(),
                    faculty != null ? faculty.getFacultyName() : null);
            departmentDTOs.add(departmentDTO);
        }

        return departmentDTOs;
    }}