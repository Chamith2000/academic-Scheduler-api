package com.itpm.AcademicSchedulerApi.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "schedule_status")
@Data
public class ScheduleStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private int semester;

    @Column(length = 255)
    private String status;


}

