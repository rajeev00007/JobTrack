package com.rajeev.jobtrack.controller;

import com.rajeev.jobtrack.entity.User;
import com.rajeev.jobtrack.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // REGISTER
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return authService.register(user);
    }

    // LOGIN
    @PostMapping("/login")
    public String login(@RequestBody User user) {
        return authService.login(
                user.getEmail(),
                user.getPassword()
        );
    }
}