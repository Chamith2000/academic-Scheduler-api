package com.itpm.AcademicSchedulerApi.service;

import com.itpm.AcademicSchedulerApi.controller.request.TimeSlotDTO;
import com.itpm.AcademicSchedulerApi.model.TimeSlot;
import java.util.List;

public interface TimeSlotService {
    TimeSlot createTimeSlot(TimeSlotDTO timeSlotDto);
    TimeSlotDTO updateTimeSlot(Long id, TimeSlotDTO timeSlotDto);
    void deleteTimeSlot(Long id);
    List<TimeSlotDTO> getAllTimeSlots();
    TimeSlot getTimeSlotById(Long id);
}
