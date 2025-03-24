package com.itpm.AcademicSchedulerApi.exception;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

  // Handle custom application exceptions
  @ExceptionHandler(AcademicSchedulerException.class)
  public ResponseEntity<ErrorResponse> handleAcademicSchedulerException(AcademicSchedulerException ex) {
    HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

    // Determine appropriate status based on exception type
    if (ex instanceof ResourceNotFoundException) {
      status = HttpStatus.NOT_FOUND;
    } else if (ex instanceof ValidationException) {
      status = HttpStatus.BAD_REQUEST;
    } else if (ex instanceof DuplicateResourceException) {
      status = HttpStatus.CONFLICT;
    } else if (ex instanceof BusinessRuleViolationException) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
    }

    ErrorResponse errorResponse = new ErrorResponse(
            status.toString(),
            ex.getMessage(),
            LocalDateTime.now()
    );

    return new ResponseEntity<>(errorResponse, status);
  }

  // Handle standard Jakarta Persistence exceptions
  @ExceptionHandler(EntityNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleEntityNotFoundException(EntityNotFoundException ex) {
    ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.NOT_FOUND.toString(),
            ex.getMessage(),
            LocalDateTime.now()
    );

    return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
  }

  // Handle validation exceptions from @Valid annotations
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ValidationErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
    Map<String, String> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .collect(Collectors.toMap(
                    FieldError::getField,
                    DefaultMessageSourceResolvable::getDefaultMessage,
                    (existing, replacement) -> existing + ", " + replacement
            ));

    ValidationErrorResponse errorResponse = new ValidationErrorResponse(
            HttpStatus.BAD_REQUEST.toString(),
            "Validation failed",
            LocalDateTime.now(),
            errors
    );

    return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
  }

  // Handle IllegalArgumentException
  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
    ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.BAD_REQUEST.toString(),
            ex.getMessage(),
            LocalDateTime.now()
    );

    return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
  }

  // Handle Data Access exceptions
  @ExceptionHandler(DataAccessException.class)
  public ResponseEntity<ErrorResponse> handleDataAccessException(DataAccessException ex) {
    HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
    String message = "Database error occurred";

    if (ex instanceof EmptyResultDataAccessException) {
      status = HttpStatus.NOT_FOUND;
      message = "Resource not found";
    } else if (ex instanceof DataIntegrityViolationException) {
      status = HttpStatus.CONFLICT;
      message = "Data integrity violation";
    }

    ErrorResponse errorResponse = new ErrorResponse(
            status.toString(),
            message + ": " + ex.getMessage(),
            LocalDateTime.now()
    );

    return new ResponseEntity<>(errorResponse, status);
  }

  // Fallback for all other exceptions
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, WebRequest request) {
    ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.toString(),
            "An unexpected error occurred: " + ex.getMessage(),
            LocalDateTime.now()
    );

    return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}