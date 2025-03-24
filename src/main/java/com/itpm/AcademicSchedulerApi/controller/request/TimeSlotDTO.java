package com.itpm.AcademicSchedulerApi.controller.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TimeSlotDTO {
    private Long id;
    private String day;
    private LocalTime startTime;
    private LocalTime endTime;


    @Override
    public String toString() {
        return "TimeSlotDTO{" +
                "day='" + day + '\'' +
                ", startTime='" + startTime + '\'' +
                ", endTime='" + endTime + '\'' +
                '}';
    }
}
