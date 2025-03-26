package com.itpm.AcademicSchedulerApi.service.impl;

import com.itpm.AcademicSchedulerApi.controller.dto.RoomDTO;
import com.itpm.AcademicSchedulerApi.model.Department;
import com.itpm.AcademicSchedulerApi.model.Room;
import com.itpm.AcademicSchedulerApi.repository.DepartmentRepository;
import com.itpm.AcademicSchedulerApi.repository.RoomRepository;
import com.itpm.AcademicSchedulerApi.service.RoomService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final DepartmentRepository departmentRepository;

    @Autowired
    public RoomServiceImpl(RoomRepository roomRepository, DepartmentRepository departmentRepository) {
        this.roomRepository = roomRepository;
        this.departmentRepository = departmentRepository;
    }

    public List<RoomDTO> getAllRooms() {
        return roomRepository.findAll().stream().map(room -> new RoomDTO(
                room.getId(),
                room.getRoomName(),
                room.getCapacity(),
                room.getRoomType(),
                room.isAvailable(),
                room.getDepartment().getName()
        )).collect(Collectors.toList());
    }
    public Optional<Room> getRoomById(Long id) {
        return roomRepository.findById(id);
    }

    public Room createRoom(RoomDTO roomDto) {
        System.out.println(roomDto.toString());

        Room room = new Room();
        room.setRoomName(roomDto.getRoomName());
        room.setCapacity(roomDto.getRoomCapacity());
        room.setRoomType(roomDto.getRoomType());
        room.setAvailable(roomDto.isAvailable());

        Department department = departmentRepository.findByName(roomDto.getDeptName())
                .orElseThrow(() -> new IllegalArgumentException("Invalid department name:" + roomDto.getDeptName()));
        room.setDepartment(department);

        return roomRepository.save(room);
    }

    public RoomDTO updateRoom(Long id, RoomDTO roomDto) {
        Optional<Room> roomOptional = roomRepository.findById(id);
        if (roomOptional.isPresent()) {
            Room room = roomOptional.get();
            room.setRoomName(roomDto.getRoomName());
            room.setCapacity(roomDto.getRoomCapacity());
            room.setRoomType(roomDto.getRoomType());
            room.setAvailable(roomDto.isAvailable());

            Department department = departmentRepository.findByName(roomDto.getDeptName())
                    .orElseThrow(() -> new EntityNotFoundException("Department not found with name: " + roomDto.getDeptName()));

            room.setDepartment(department);

            Room updatedRoom = roomRepository.save(room);

            return new RoomDTO(
                    updatedRoom.getId(),
                    updatedRoom.getRoomName(),
                    updatedRoom.getCapacity(),
                    updatedRoom.getRoomType(),
                    updatedRoom.isAvailable(),
                    updatedRoom.getDepartment().getName()
            );
        } else {
            throw new EntityNotFoundException("Room not found with id: " + id);
        }
    }


    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }
}
