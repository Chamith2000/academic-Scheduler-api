package com.itpm.AcademicSchedulerApi.exception;

// For operation failures
public class OperationFailedException extends AcademicSchedulerException {

    public OperationFailedException(String message) {
        super(message);
    }

    public OperationFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}
