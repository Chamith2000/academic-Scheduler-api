package com.itpm.AcademicSchedulerApi.controller.request;

public class StudentProfileUpdateRequest {
    private int year;
    private int semester;
    private String email;
    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }
    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}