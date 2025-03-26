package com.itpm.AcademicSchedulerApi.service;

import com.itpm.AcademicSchedulerApi.auth.AuthenticationRequest;
import com.itpm.AcademicSchedulerApi.auth.AuthenticationResponse;
import com.itpm.AcademicSchedulerApi.auth.RegisterRequest;

public interface AuthenticationService {
    AuthenticationResponse register(RegisterRequest request);
    AuthenticationResponse authenticate(AuthenticationRequest request);
}