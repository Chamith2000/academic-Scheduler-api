package com.itpm.AcademicSchedulerApi.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomDTO {
    private Long id;
    private String roomName;
    private int roomCapacity;
    private String roomType;
    private boolean isAvailable;
    private String deptName;

}
