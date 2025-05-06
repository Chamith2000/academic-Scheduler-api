package com.itpm.AcademicSchedulerApi.repository;

import com.itpm.AcademicSchedulerApi.model.Instructor;
import com.itpm.AcademicSchedulerApi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstructorRepository extends JpaRepository<Instructor, Long> {

    // Find instructor by first name
    Optional<Instructor> findByFirstName(String firstName);

    // Find instructor by ID
    Optional<Instructor> findById(Long id);

    // Find instructor by first and last name
    List<Instructor> findByFirstNameAndLastName(String firstName, String lastName);

    // Find instructor by user
    Optional<Instructor> findByUser(User user);

    // Delete instructor by ID
    void deleteById(Long id);

    @Query("SELECT i FROM Instructor i JOIN i.user u WHERE u.username = :username")
    Optional<Instructor> findByUserUsername(@Param("username") String username);

}