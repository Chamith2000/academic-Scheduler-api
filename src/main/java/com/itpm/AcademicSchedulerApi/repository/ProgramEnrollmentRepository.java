package com.itpm.AcademicSchedulerApi.repository;

import com.itpm.AcademicSchedulerApi.model.ProgramEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgramEnrollmentRepository extends JpaRepository<ProgramEnrollment, Long> {
}
