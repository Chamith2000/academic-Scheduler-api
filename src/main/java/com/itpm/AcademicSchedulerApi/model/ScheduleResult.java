package com.itpm.AcademicSchedulerApi.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "schedule_results")
@Data
public class ScheduleResult {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
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
