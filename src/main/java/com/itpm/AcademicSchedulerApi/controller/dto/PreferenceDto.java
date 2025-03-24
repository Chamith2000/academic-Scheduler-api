package com.itpm.AcademicSchedulerApi.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PreferenceDto {
    private Long id;
    private String day;
    private LocalTime startTime;


    public PreferenceDto(String day, LocalTime startTime) {
    }
}

