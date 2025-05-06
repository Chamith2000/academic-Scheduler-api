package com.itpm.AcademicSchedulerApi.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(
        name = "schedule_status",
        uniqueConstraints = @UniqueConstraint(columnNames = {"semester", "year"})
)
@Data
public class ScheduleStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int semester;

    private int year;

    @Column(length = 255)
    private String status;
}