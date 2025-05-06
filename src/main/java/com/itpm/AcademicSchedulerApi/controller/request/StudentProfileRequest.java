package com.itpm.AcademicSchedulerApi.controller.request;

 public class StudentProfileRequest {
    private int year;

     public int getSemester() {
         return semester;
     }

     public void setSemester(int semester) {
         this.semester = semester;
     }

     private int semester;

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }
}

