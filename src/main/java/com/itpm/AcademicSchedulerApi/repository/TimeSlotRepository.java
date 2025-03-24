package com.itpm.AcademicSchedulerApi.repository;


import com.itpm.AcademicSchedulerApi.model.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.Optional;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {
    Optional<TimeSlot> findByDayAndStartTime(String day, LocalTime startTime);
}
