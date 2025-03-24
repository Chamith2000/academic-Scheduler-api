package com.itpm.AcademicSchedulerApi.model;


import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rooms")
@Data
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long id;

    @Column(name = "room_name")
    private String roomName;

    @Column(name = "room_capacity")
    private int capacity;

    @Column(name = "room_type")
    private String roomType;

    @Column(name = "is_available")
    private boolean isAvailable;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dept_id", nullable = false)
    @JsonBackReference("room-department")
    private Department department;

    @ManyToMany
    private List<TimeSlot> occupiedTimeSlots = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "room_department",
            joinColumns = @JoinColumn(name = "room_id"),
            inverseJoinColumns = @JoinColumn(name = "dept_id"))
    private List<Department> departments = new ArrayList<>();

    public void occupyTimeSlot(TimeSlot timeSlot) {
        occupiedTimeSlots.add(timeSlot);
    }

    public boolean isAvailable(TimeSlot timeSlot) {
        return !occupiedTimeSlots.contains(timeSlot);
    }
    public void freeTimeSlot(TimeSlot timeSlot) {
        occupiedTimeSlots.remove(timeSlot);
    }

}
