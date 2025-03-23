package com.itpm.AcademicSchedulerApi.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "departments")
@Data
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dept_id")
    private Long id;


    @Column(name = "dept_name")
    private String name;

    @Column(name = "dept_code")
    private String dept_code;

    @ManyToOne
    @JoinColumn(name = "faculty_id")
    @JsonBackReference("faculty-department")
    private Faculty faculty;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("department-course")
    private List<Course> courses = new ArrayList<>();

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("room-department")
    private List<Room> rooms = new ArrayList<>();

    @ManyToMany(mappedBy = "departments")
    private List<Room> roomsByDept = new ArrayList<>();


}
