package com.itpm.AcademicSchedulerApi.service;

import com.itpm.AcademicSchedulerApi.controller.dto.RoomDTO;
import com.itpm.AcademicSchedulerApi.model.Room;

import java.util.List;
import java.util.Optional;

public interface RoomService {
    List<RoomDTO> getAllRooms();
    Optional<Room> getRoomById(Long id);
    Room createRoom(RoomDTO roomDto);
    RoomDTO updateRoom(Long id, RoomDTO roomDto);
    void deleteRoom(Long id);
}