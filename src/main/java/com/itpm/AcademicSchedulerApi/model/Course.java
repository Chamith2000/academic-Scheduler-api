package com.itpm.AcademicSchedulerApi.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "courses")
@Data
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    private Long id;

    @Column(name = "course_code", nullable = false, unique = true)
    private String courseCode;

    @Column(name = "course_name", nullable = false)
    private String courseName;


    @Column(name = "year")
    private int year;

    @Column(name = "semester")
    private int semester;

    @Column(name = "room_spec")
    private String roomSpec;

    private String commonId;

    @ManyToOne
    @JoinColumn(name = "programme_id")
    @JsonBackReference("program-course")
    private Program program;

    @OneToOne(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonBackReference("course-section")
    private Section section;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id", nullable = false)
    @JsonBackReference("department-course")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    @JsonBackReference("instructor-course")
    private Instructor instructor;


    public boolean isCommonCourse() {
        return this.courseCode.startsWith("CCS");
    }
}
