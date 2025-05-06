package com.itpm.AcademicSchedulerApi.service;

import com.itpm.AcademicSchedulerApi.controller.request.ProgramEnrollmentDTO;
import com.itpm.AcademicSchedulerApi.controller.request.ProgrammeDTO;
import com.itpm.AcademicSchedulerApi.model.Course;
import com.itpm.AcademicSchedulerApi.model.Program;
import com.itpm.AcademicSchedulerApi.model.ProgramEnrollment;

import java.util.List;

public interface ProgramService {
    List<ProgrammeDTO> getAllPrograms();
    Program createProgramme(ProgrammeDTO programmeDto);
    Program getProgramById(Long id);
    ProgrammeDTO updateProgram(Long id, ProgrammeDTO programmeDTO);
    void deleteProgramById(Long id);
    ProgramEnrollment enrollStudentInProgram(Long studentId, ProgramEnrollmentDTO enrollmentDTO);
    List<Course> getCoursesByProgramId(Long programId);
}