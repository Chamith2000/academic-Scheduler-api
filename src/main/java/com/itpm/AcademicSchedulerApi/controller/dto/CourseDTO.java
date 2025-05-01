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
    private Integer year;
    private Integer semester;
    private String programmeName;
    private String deptName;
    private String instructorName;

}
