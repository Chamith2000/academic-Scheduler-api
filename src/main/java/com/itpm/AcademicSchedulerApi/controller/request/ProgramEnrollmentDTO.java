package com.itpm.AcademicSchedulerApi.controller.request;

import lombok.Data;

@Data
public class ProgramEnrollmentDTO {
    private Long programId;
    private int enrollmentYear;
    private int enrolledNumber;
}