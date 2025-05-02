package com.itpm.AcademicSchedulerApi.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "schedule_results")
public class ScheduleResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ElementCollection
    private List<String> courseCodes;

    @ElementCollection
    private List<String> timeSlots;

    @ElementCollection
    private List<String> instructorNames;

    @ElementCollection
    private List<String> roomNames;

    private String message;
}