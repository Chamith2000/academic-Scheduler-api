package com.itpm.AcademicSchedulerApi.exception;

// For data integrity errors
public class DataIntegrityException extends AcademicSchedulerException {

    public DataIntegrityException(String message) {
        super(message);
    }

    public DataIntegrityException(String message, Throwable cause) {
        super(message, cause);
    }
}
