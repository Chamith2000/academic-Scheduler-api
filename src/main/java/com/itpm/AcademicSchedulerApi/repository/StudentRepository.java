package com.itpm.AcademicSchedulerApi.repository;

import com.itpm.AcademicSchedulerApi.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByUserUsername(String username);

    @Query("SELECT s FROM Student s JOIN FETCH s.user u LEFT JOIN FETCH s.program p WHERE u.id = :userId")
    Optional<Student> findByUserIdWithUserAndProgram(@Param("userId") Long userId);
}