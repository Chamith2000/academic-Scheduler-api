package com.itpm.AcademicSchedulerApi.service.impl;

import com.itpm.AcademicSchedulerApi.controller.request.ProgramEnrollmentDTO;
import com.itpm.AcademicSchedulerApi.controller.request.ProgrammeDTO;
import com.itpm.AcademicSchedulerApi.model.*;
import com.itpm.AcademicSchedulerApi.repository.*;
import com.itpm.AcademicSchedulerApi.service.ProgramService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProgramServiceImpl implements ProgramService {
    private final ProgramRepository programRepository;
    private final FacultyRepository facultyRepository;
    private final ProgramEnrollmentRepository programEnrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    @Override
    public List<ProgrammeDTO> getAllPrograms() {
        List<Program> programs = programRepository.findAll();
        List<ProgrammeDTO> programDTOs = new ArrayList<>();
        for (Program program : programs) {
            ProgrammeDTO programDTO = new ProgrammeDTO();
            programDTO.setId(program.getId());
            programDTO.setProgrammeCode(program.getCode());
            programDTO.setProgrammeName(program.getName());
            programDTO.setFacultyName(program.getFaculty().getFacultyName());
            programDTOs.add(programDTO);
        }
        return programDTOs;
    }

    @Override
    public Program createProgramme(ProgrammeDTO programmeDto) {
        Program programme = new Program();
        programme.setCode(programmeDto.getProgrammeCode());
        programme.setName(programmeDto.getProgrammeName());
        Faculty faculty = facultyRepository.findByFacultyName(programmeDto.getFacultyName())
                .orElseThrow(() -> new IllegalArgumentException("Invalid faculty name: " + programmeDto.getFacultyName()));
        programme.setFaculty(faculty);
        return programRepository.save(programme);
    }

    @Override
    public Program getProgramById(Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found with id: " + id));
    }

    @Override
    public ProgrammeDTO updateProgram(Long id, ProgrammeDTO programmeDTO) {
        Optional<Program> programOptional = programRepository.findById(id);
        if (programOptional.isPresent()) {
            Program program = programOptional.get();
            program.setCode(programmeDTO.getProgrammeCode());
            program.setName(programmeDTO.getProgrammeName());
            Faculty faculty = facultyRepository.findByFacultyName(programmeDTO.getFacultyName())
                    .orElseThrow(() -> new EntityNotFoundException("Faculty not found with name: " + programmeDTO.getFacultyName()));
            program.setFaculty(faculty);
            Program updatedProgram = programRepository.save(program);
            return new ProgrammeDTO(updatedProgram.getCode(), updatedProgram.getName(), updatedProgram.getFaculty().getFacultyName());
        } else {
            throw new EntityNotFoundException("Program not found with id: " + id);
        }
    }

    @Override
    public void deleteProgramById(Long id) {
        programRepository.deleteById(id);
    }

    @Override
    public ProgramEnrollment enrollStudentInProgram(Long studentId, ProgramEnrollmentDTO enrollmentDTO) {
        if (enrollmentDTO.getProgramId() == null) {
            throw new IllegalArgumentException("Program ID cannot be null");
        }
        if (enrollmentDTO.getEnrollmentYear() <= 0) {
            throw new IllegalArgumentException("Enrollment year must be a positive number");
        }
        if (enrollmentDTO.getEnrolledNumber() <= 0) {
            throw new IllegalArgumentException("Enrolled number must be a positive number");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + studentId));
        Program program = programRepository.findById(enrollmentDTO.getProgramId())
                .orElseThrow(() -> new EntityNotFoundException("Program not found with id: " + enrollmentDTO.getProgramId()));

        student.setProgram(program);
        student.setYear(enrollmentDTO.getEnrollmentYear());
        studentRepository.save(student);

        Optional<ProgramEnrollment> existingEnrollment = programEnrollmentRepository.findByProgramId(enrollmentDTO.getProgramId());
        ProgramEnrollment enrollment;
        if (existingEnrollment.isPresent()) {
            enrollment = existingEnrollment.get();
            enrollment.setEnrolledNumber(enrollment.getEnrolledNumber() + 1);
        } else {
            enrollment = new ProgramEnrollment();
            enrollment.setProgram(program);
            enrollment.setYear(enrollmentDTO.getEnrollmentYear());
            enrollment.setEnrolledNumber(enrollmentDTO.getEnrolledNumber());
        }
        return programEnrollmentRepository.save(enrollment);
    }

    @Override
    public List<Course> getCoursesByProgramId(Long programId) {
        Program program = programRepository.findById(programId)
                .orElseThrow(() -> new EntityNotFoundException("Program not found with id: " + programId));
        return program.getCourses();
    }
}