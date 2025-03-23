package com.itpm.AcademicSchedulerApi.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "programmes")
@Data
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "programme_id")
    private Long id;

    @Column(name = "programme_code")
    private String code;

    @Column(name = "programme_name")
    private String name;

    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference("program-course")
    private List<Course> courses;

    @ManyToOne
    @JoinColumn(name = "faculty_id")
    @JsonBackReference("faculty-program")
    private Faculty faculty;

}
