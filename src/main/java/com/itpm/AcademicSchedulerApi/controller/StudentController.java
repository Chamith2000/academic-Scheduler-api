package com.itpm.AcademicSchedulerApi.controller;

import com.itpm.AcademicSchedulerApi.controller.dto.StudentDTO;
import com.itpm.AcademicSchedulerApi.controller.request.ChangePasswordRequest;
import com.itpm.AcademicSchedulerApi.controller.request.ProgramEnrollmentDTO;
import com.itpm.AcademicSchedulerApi.controller.request.StudentProfileUpdateRequest;
import com.itpm.AcademicSchedulerApi.model.ProgramEnrollment;
import com.itpm.AcademicSchedulerApi.model.Student;
import com.itpm.AcademicSchedulerApi.model.User;
import com.itpm.AcademicSchedulerApi.repository.StudentRepository;
import com.itpm.AcademicSchedulerApi.repository.UserRepository;
import com.itpm.AcademicSchedulerApi.service.StudentService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;


import java.util.Optional;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public StudentController(StudentService studentService, StudentRepository studentRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.studentService = studentService;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<StudentDTO> getCurrentStudent() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        StudentDTO studentDTO = studentService.getStudentDTOByUserId(user.getId());
        return new ResponseEntity<>(studentDTO, HttpStatus.OK);
    }

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<Student> createStudentProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        Optional<Student> existingStudent = studentRepository.findByUserId(user.getId());
        if (existingStudent.isPresent()) {
            throw new RuntimeException("Student profile already exists");
        }
        Student student = new Student();
        student.setUser(user);
        student.setYear(1);
        Student savedStudent = studentRepository.save(student);
        return new ResponseEntity<>(savedStudent, HttpStatus.CREATED);
    }

    @PostMapping("/enroll")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ProgramEnrollment> enrollInProgram(@RequestBody ProgramEnrollmentDTO enrollmentDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No student profile found for user"));
        ProgramEnrollment enrollment = studentService.enrollStudentInProgram(student.getId(), enrollmentDTO);
        return new ResponseEntity<>(enrollment, HttpStatus.CREATED);
    }

    @PutMapping("/me")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<StudentDTO> updateStudentProfile(@RequestBody StudentProfileUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found."));
        student.setYear(request.getYear());
        user.setEmail(request.getEmail());
        studentRepository.save(student);
        // Assume userRepository.save(user) is needed if email is updated
        StudentDTO studentDTO = studentService.getStudentDTOByUserId(user.getId());
        return new ResponseEntity<>(studentDTO, HttpStatus.OK);
    }
    @PostMapping("/change-password")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/me")
    @PreAuthorize("hasAuthority('STUDENT')")
    @Transactional
    public ResponseEntity<Void> deleteAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        try {
            // Delete Student record first due to foreign key constraint
            studentRepository.deleteByUserId(user.getId());
            // Delete User record
            userRepository.deleteById(user.getId());
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete account: " + e.getMessage());
        }
    }

}
