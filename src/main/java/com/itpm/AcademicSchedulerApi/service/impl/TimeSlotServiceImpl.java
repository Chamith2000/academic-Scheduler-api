package com.itpm.AcademicSchedulerApi.service.impl;
import com.itpm.AcademicSchedulerApi.controller.request.TimeSlotDTO;
import com.itpm.AcademicSchedulerApi.model.TimeSlot;
import com.itpm.AcademicSchedulerApi.repository.TimeSlotRepository;
import com.itpm.AcademicSchedulerApi.service.TimeSlotService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimeSlotServiceImpl implements TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;

    @Override
    public List<TimeSlotDTO> getAllTimeSlots() {
        List<TimeSlot> timeSlots = timeSlotRepository.findAll();

        List<TimeSlotDTO> timeSlotDTOs = timeSlots.stream()
                .map(timeSlot -> new TimeSlotDTO(
                        timeSlot.getId(),
                        timeSlot.getDay(),
                        timeSlot.getStartTime(),
                        timeSlot.getEndTime())
                )
                .collect(Collectors.toList());

        return timeSlotDTOs;
    }
    @Override
    public TimeSlot getTimeSlotById(Long id) {
        return timeSlotRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("TimeSlot not found with id: " + id));
    }

    @Override
    public TimeSlot createTimeSlot(TimeSlotDTO timeSlotDto) {
        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setDay(timeSlotDto.getDay());
        timeSlot.setStartTime(timeSlotDto.getStartTime());
        timeSlot.setEndTime(timeSlotDto.getEndTime());

        return timeSlotRepository.save(timeSlot);
    }

    @Override
    public TimeSlotDTO updateTimeSlot(Long id, TimeSlotDTO timeSlotDto) {
        Optional<TimeSlot> timeSlotOptional = timeSlotRepository.findById(id);
        if (timeSlotOptional.isPresent()) {
            TimeSlot timeSlot = timeSlotOptional.get();
            timeSlot.setDay(timeSlotDto.getDay());
            timeSlot.setStartTime(timeSlotDto.getStartTime());
            timeSlot.setEndTime(timeSlotDto.getEndTime());

            TimeSlot updatedTimeSlot = timeSlotRepository.save(timeSlot);

            return new TimeSlotDTO(updatedTimeSlot.getId(), updatedTimeSlot.getDay(), updatedTimeSlot.getStartTime(), updatedTimeSlot.getEndTime());
        } else {
            throw new EntityNotFoundException("TimeSlot not found with id: " + id);
        }
    }


    @Override
    public void deleteTimeSlot(Long id) {
        timeSlotRepository.deleteById(id);
    }
}
