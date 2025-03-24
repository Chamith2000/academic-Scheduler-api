package com.itpm.AcademicSchedulerApi.service;

import com.itpm.AcademicSchedulerApi.controller.dto.SectionDTO;
import com.itpm.AcademicSchedulerApi.model.Section;

import java.util.List;

public interface SectionService {

    Section createSection(SectionDTO sectionDto);

    SectionDTO updateSection(Long id, SectionDTO sectionDTO);

    void deleteSection(Long id);

    Section getSectionById(Long id);

    List<SectionDTO> getAllSections();
}