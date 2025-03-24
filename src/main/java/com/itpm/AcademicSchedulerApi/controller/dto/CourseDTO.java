package com.itpm.AcademicSchedulerApi.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseDTO {
    private Long id;
    private String courseCode;
    private String courseName;
    private int year;
    private int semester;
    private String programmeName;
    private String deptName;
    private String instructorName;

    public CourseDTO(String courseCode, String courseName, int year, int semester, String name, String name1, String firstName) {
    }
}
