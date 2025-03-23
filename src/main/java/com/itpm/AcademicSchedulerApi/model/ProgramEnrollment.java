package com.itpm.AcademicSchedulerApi.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "program_enrollments")
@Data
public class ProgramEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "enrollment_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    @JsonBackReference("program-programEnrollment")
    private Program program;

    @Column(name = "enrollment_year", nullable = false)
    private int year;

    @Column(name = "enrollment_number", nullable = false)
    private int enrolledNumber;


}
