package com.itpm.AcademicSchedulerApi.controller.request;

public class ChangePasswordRequest {
    private String newPassword;

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}