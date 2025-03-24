package com.itpm.AcademicSchedulerApi.service;

import com.itpm.AcademicSchedulerApi.controller.dto.DepartmentDTO;
import com.itpm.AcademicSchedulerApi.model.Department;

import java.util.List;

public interface DepartmentService {

    Department createDepartment(DepartmentDTO departmentDto);

    DepartmentDTO updateDepartment(Long id, DepartmentDTO departmentDTO);

    void deleteDepartment(Long id);

    Department getDepartmentById(Long id);

    List<DepartmentDTO> getAllDepartments();
}