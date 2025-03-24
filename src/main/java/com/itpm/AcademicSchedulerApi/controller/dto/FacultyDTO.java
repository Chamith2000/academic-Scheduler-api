package com.itpm.AcademicSchedulerApi.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FacultyDTO {
    private Long id;
    private String facultyCode;
    private String facultyName;


}

