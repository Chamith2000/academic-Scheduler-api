package com.itpm.AcademicSchedulerApi.exception;

// Base exception class for the application
public abstract class AcademicSchedulerException extends RuntimeException {

    public AcademicSchedulerException(String message) {
        super(message);
    }

    public AcademicSchedulerException(String message, Throwable cause) {
        super(message, cause);
    }
}

