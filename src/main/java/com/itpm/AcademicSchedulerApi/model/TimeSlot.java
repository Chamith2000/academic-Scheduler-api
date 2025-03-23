package com.itpm.AcademicSchedulerApi.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import com.itpm.AcademicSchedulerApi.model.converter.LocalTimeAttributeConverter;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Entity
@Table(name = "time_slots")
@Data
public class TimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "day")
    private String day;

    @Column(name = "start_time")
    @Convert(converter = LocalTimeAttributeConverter.class)
    private LocalTime startTime;

    @Column(name = "end_time")
    @Convert(converter = LocalTimeAttributeConverter.class)
    private LocalTime endTime;


    public String getTime() {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("HH:mm");
        return startTime.format(dtf) + " - " + endTime.format(dtf);
    }

    @OneToMany(mappedBy = "timeSlot", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("timeSlot-schedule")
    private List<Schedule> schedules = new ArrayList<>();

    public List<String> getAllTimes() {
        return schedules.stream()
                .map(schedule -> schedule.getTimeSlot().getDay() + ": " + getTime())
                .collect(Collectors.toList());
    }
}
