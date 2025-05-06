package com.itpm.AcademicSchedulerApi.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "schedule_results")
@Data
public class ScheduleResult {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private Long id;

    @Column(name = "course_codes", columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    private List<String> courseCodes;

    @Column(name = "time_slots", columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    private List<String> timeSlots;

    @Column(name = "instructor_names", columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    private List<String> instructorNames;

    @Column(name = "room_names", columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    private List<String> roomNames;

    @Column(name = "message")
    private String message;

    @Column(name = "semester")
    private Integer semester;

    private Integer year;

    // Converter for List<String> to JSON string
    @Converter
    public static class StringListConverter implements AttributeConverter<List<String>, String> {
        private final ObjectMapper objectMapper = new ObjectMapper();

        @Override
        public String convertToDatabaseColumn(List<String> attribute) {
            try {
                return objectMapper.writeValueAsString(attribute);
            } catch (Exception e) {
                throw new IllegalArgumentException("Error converting list to JSON", e);
            }
        }

        @Override
        public List<String> convertToEntityAttribute(String dbData) {
            try {
                return objectMapper.readValue(dbData, List.class);
            } catch (Exception e) {
                throw new IllegalArgumentException("Error converting JSON to list", e);
            }
        }
    }
}