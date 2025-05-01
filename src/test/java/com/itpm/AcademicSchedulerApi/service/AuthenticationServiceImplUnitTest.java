package com.itpm.AcademicSchedulerApi.service;

import com.itpm.AcademicSchedulerApi.auth.AuthenticationRequest;
import com.itpm.AcademicSchedulerApi.auth.AuthenticationResponse;
import com.itpm.AcademicSchedulerApi.auth.RegisterRequest;
import com.itpm.AcademicSchedulerApi.config.JwtService;
import com.itpm.AcademicSchedulerApi.model.Role;
import com.itpm.AcademicSchedulerApi.model.User;
import com.itpm.AcademicSchedulerApi.repository.DepartmentRepository;
import com.itpm.AcademicSchedulerApi.repository.InstructorRepository;
import com.itpm.AcademicSchedulerApi.repository.UserRepository;
import com.itpm.AcademicSchedulerApi.service.impl.AuthenticationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

public class AuthenticationServiceImplUnitTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private InstructorRepository instructorRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @InjectMocks
    private AuthenticationServiceImpl authenticationService;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testRegister() {
        // Arrange
        RegisterRequest registerRequest = RegisterRequest.builder()
                .username("testuser")
                .password("password123")
                .email("test@example.com")
                .build();

        User savedUser = User.builder()
                .username("testuser")
                .password("encodedPassword")
                .email("test@example.com")
                .role(Role.STUDENT)
                .build();

        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("jwtToken123");

        // Act
        AuthenticationResponse response = authenticationService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals("jwtToken123", response.getToken());
        verify(userRepository, times(1)).save(any(User.class));
        verify(jwtService, times(1)).generateToken(any(User.class));
    }

    @Test
    public void testAuthenticate() {
        // Arrange
        AuthenticationRequest authRequest = AuthenticationRequest.builder()
                .username("testuser")
                .password("password123")
                .build();

        User user = User.builder()
                .username("testuser")
                .password("encodedPassword")
                .email("test@example.com")
                .role(Role.STUDENT)
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwtToken123");

        // Act
        AuthenticationResponse response = authenticationService.authenticate(authRequest);

        // Assert
        assertNotNull(response);
        assertEquals("jwtToken123", response.getToken());
        verify(authenticationManager, times(1)).authenticate(
                new UsernamePasswordAuthenticationToken("testuser", "password123")
        );
        verify(userRepository, times(1)).findByUsername("testuser");
        verify(jwtService, times(1)).generateToken(user);
    }

    @Test
    public void testRegisterInstructorUser() {
        // Arrange
        String username = "instructor1";
        String password = "password123";
        String email = "instructor@example.com";

        User savedUser = User.builder()
                .username(username)
                .password("encodedPassword")
                .email(email)
                .role(Role.INSTRUCTOR)
                .build();

        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // Act
        User result = authenticationService.registerInstructorUser(username, password, email);

        // Assert
        assertNotNull(result);
        assertEquals(username, result.getUsername());
        assertEquals("encodedPassword", result.getPassword());
        assertEquals(email, result.getEmail());
        assertEquals(Role.INSTRUCTOR, result.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }
}
