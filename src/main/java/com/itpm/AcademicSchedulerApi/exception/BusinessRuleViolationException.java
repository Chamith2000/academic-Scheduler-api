package com.itpm.AcademicSchedulerApi.exception;

// For business rule violations
public class BusinessRuleViolationException extends AcademicSchedulerException {

    public BusinessRuleViolationException(String message) {
        super(message);
    }
}
