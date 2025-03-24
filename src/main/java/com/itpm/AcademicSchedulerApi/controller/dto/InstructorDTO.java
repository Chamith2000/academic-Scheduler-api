package com.itpm.AcademicSchedulerApi.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InstructorDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String deptName;


    public InstructorDTO(String firstName, String lastName, String name) {
    }
}
