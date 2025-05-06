package com.itpm.AcademicSchedulerApi.repository;

import com.itpm.AcademicSchedulerApi.model.ProgramEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProgramEnrollmentRepository extends JpaRepository<ProgramEnrollment, Long> {
    Optional<ProgramEnrollment> findByProgramId(Long programId);
}