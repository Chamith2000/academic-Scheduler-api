package com.itpm.AcademicSchedulerApi.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor

public class DepartmentDTO {
    private Long id;
    private String deptCode;
    private String deptName;
    private String facultyName;

    public DepartmentDTO() {
    }
}

