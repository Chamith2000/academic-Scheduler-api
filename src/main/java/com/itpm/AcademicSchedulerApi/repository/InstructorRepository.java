package com.itpm.AcademicSchedulerApi.repository;

import com.itpm.AcademicSchedulerApi.model.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstructorRepository extends JpaRepository<Instructor, Long> {

    // Find instructor by first name
    Optional<Instructor> findByFirstName(String firstName);
    Optional<Instructor> findById(Long id);
    // Find instructor by first and last name
    List<Instructor> findByFirstNameAndLastName(String firstName, String lastName);
}
