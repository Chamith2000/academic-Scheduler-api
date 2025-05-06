package com.itpm.AcademicSchedulerApi.service;

import com.itpm.AcademicSchedulerApi.controller.dto.StudentDTO;
import com.itpm.AcademicSchedulerApi.controller.request.ProgramEnrollmentDTO;
import com.itpm.AcademicSchedulerApi.model.ProgramEnrollment;

public interface StudentService {
    StudentDTO getStudentDTOByUserId(Long userId);
    ProgramEnrollment enrollStudentInProgram(Long studentId, ProgramEnrollmentDTO enrollmentDTO);
}