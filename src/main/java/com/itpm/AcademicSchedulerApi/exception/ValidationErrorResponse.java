package com.itpm.AcademicSchedulerApi.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ValidationErrorResponse extends ErrorResponse {
    private final Map<String, String> errors;

    public ValidationErrorResponse(String status, String message, LocalDateTime timestamp, Map<String, String> errors) {
        super(status, message, timestamp);
        this.errors = errors;
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}
