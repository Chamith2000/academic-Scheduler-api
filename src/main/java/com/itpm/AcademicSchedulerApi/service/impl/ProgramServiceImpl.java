package com.itpm.AcademicSchedulerApi.service.impl;
import com.itpm.AcademicSchedulerApi.controller.request.ProgrammeDTO;
import com.itpm.AcademicSchedulerApi.model.Faculty;
import com.itpm.AcademicSchedulerApi.model.Program;
import com.itpm.AcademicSchedulerApi.repository.FacultyRepository;
import com.itpm.AcademicSchedulerApi.repository.ProgramRepository;
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

    @Override
    public List<ProgrammeDTO> getAllPrograms() {
        List<Program> programs = programRepository.findAll();
        List<ProgrammeDTO> programDTOs = new ArrayList<>();
        for (Program program : programs) {
            ProgrammeDTO programDTO = new ProgrammeDTO();
            programDTO.setId(program.getId());
            programDTO.setProgrammeCode(program.getCode());
            programDTO.setProgrammeName(program.getName());
            programDTO.setFacultyName(program.getFaculty().getFacultyName()); // assuming there is a getName() method in Faculty class
            programDTOs.add(programDTO);
        }
        return programDTOs;
    }

    @Override
    public Program createProgramme(ProgrammeDTO programmeDto) {
        // Print the ProgrammeDTO object
        System.out.println(programmeDto.toString());

        Program programme = new Program();
        programme.setCode(programmeDto.getProgrammeCode());
        programme.setName(programmeDto.getProgrammeName());

        Faculty faculty = facultyRepository.findByFacultyName(programmeDto.getFacultyName())
                .orElseThrow(() -> new IllegalArgumentException("Invalid faculty name:" + programmeDto.getFacultyName()));
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

}
