package com.itpm.AcademicSchedulerApi.service;

import com.itpm.AcademicSchedulerApi.controller.dto.CourseDTO;
import com.itpm.AcademicSchedulerApi.controller.dto.InstructorDTO;
import com.itpm.AcademicSchedulerApi.controller.dto.InstructorPreferencesDto;
import com.itpm.AcademicSchedulerApi.controller.dto.PreferenceDto;
import com.itpm.AcademicSchedulerApi.controller.dto.PasswordChangeDTO;
import com.itpm.AcademicSchedulerApi.model.Instructor;

import java.util.List;
import java.util.Optional;

public interface InstructorService {
    List<InstructorDTO> getAllInstructors();
    Optional<Instructor> getInstructorById(Long id);
    Instructor createInstructor(InstructorDTO instructorDto);
    InstructorDTO updateInstructor(Long id, InstructorDTO instructorDto);
    void deleteInstructor(Long id);
    Instructor addPreference(Long instructorId, Long timeslotId);
    InstructorDTO updatePreference(Long instructorId, PreferenceDto preferenceDto);
    void deletePreference(Long instructorId, Long timeslotId);
    List<InstructorPreferencesDto> getAllInstructorPreferences();
    InstructorPreferencesDto getInstructorPreferencesByUsername(String username);
    InstructorDTO getInstructorByUsername(String username);
    List<CourseDTO> getInstructorCoursesByUsername(String username);
    InstructorDTO updateMyProfile(String username, InstructorDTO instructorDTO);
    void changeMyPassword(String username, PasswordChangeDTO passwordChangeDTO);
    byte[] generateCoursesReportCsv(String username);
    byte[] generateAvailabilityGapsReportCsv(String username);
    byte[] generateWorkloadReportCsv(String username);
}