package com.itpm.AcademicSchedulerApi.repository;


import com.itpm.AcademicSchedulerApi.model.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstructorRepository extends JpaRepository<Instructor, Long> {
    Optional<Instructor> findByFirstName(String firstName);
    List<Instructor> findByFirstNameAndLastName(String firstName, String lastName);

}
