package com.itpm.AcademicSchedulerApi.service;

import com.itpm.AcademicSchedulerApi.controller.request.ProgrammeDTO;
import com.itpm.AcademicSchedulerApi.model.Program;

import java.util.List;

public interface ProgramService {
    List<ProgrammeDTO> getAllPrograms();
    Program createProgramme(ProgrammeDTO programmeDto);
    Program getProgramById(Long id);
    ProgrammeDTO updateProgram(Long id, ProgrammeDTO programmeDTO);
    void deleteProgramById(Long id);

}
