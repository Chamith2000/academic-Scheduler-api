package com.itpm.AcademicSchedulerApi.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "faculties")
@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class Faculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "faculty_id")
    private Long id;

    @Column(name = "faculty_code", nullable = false, unique = true)
    @JsonProperty("faculty_code")
    private String facultyCode;

    @Column(name = "faculty_name", nullable = false)
    @JsonProperty("faculty_name")
    private String facultyName;

    @OneToMany(mappedBy = "faculty", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("faculty-department")
    private Set<Department> departments = new HashSet<>();

    @OneToMany(mappedBy = "faculty", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("faculty-program")
    private Set<Program> programs = new HashSet<>();


}
