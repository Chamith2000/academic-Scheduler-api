package com.itpm.AcademicSchedulerApi.controller.dto;

import lombok.Data;

@Data
public class StudentDTO {
    private Long id;
    private int year;
    private int semester;
    private String username;
    private String email;
    private Long programId;
    private String programName;
}