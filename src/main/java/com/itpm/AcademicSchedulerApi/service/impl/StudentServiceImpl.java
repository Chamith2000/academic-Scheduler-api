package com.itpm.AcademicSchedulerApi.service.impl;

import com.itpm.AcademicSchedulerApi.controller.dto.StudentDTO;
import com.itpm.AcademicSchedulerApi.controller.request.ProgramEnrollmentDTO;
import com.itpm.AcademicSchedulerApi.model.Program;
import com.itpm.AcademicSchedulerApi.model.ProgramEnrollment;
import com.itpm.AcademicSchedulerApi.model.Student;
import com.itpm.AcademicSchedulerApi.model.User;
import com.itpm.AcademicSchedulerApi.repository.StudentRepository;
import com.itpm.AcademicSchedulerApi.repository.UserRepository;
import com.itpm.AcademicSchedulerApi.service.ProgramService;
import com.itpm.AcademicSchedulerApi.service.StudentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final ProgramService programService;

    @Transactional(readOnly = true)
    @Override
    public StudentDTO getStudentDTOByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found for user id: " + userId));

        StudentDTO studentDTO = new StudentDTO();
        studentDTO.setId(student.getId());
        studentDTO.setYear(student.getYear());
        studentDTO.setUsername(user.getUsername());
        studentDTO.setEmail(user.getEmail());
        if (student.getProgram() != null) {
            studentDTO.setProgramId(student.getProgram().getId());
            studentDTO.setProgramName(student.getProgram().getName());
        }
        return studentDTO;
    }

    @Transactional
    @Override
    public ProgramEnrollment enrollStudentInProgram(Long studentId, ProgramEnrollmentDTO enrollmentDTO) {
        return programService.enrollStudentInProgram(studentId, enrollmentDTO);
    }
}