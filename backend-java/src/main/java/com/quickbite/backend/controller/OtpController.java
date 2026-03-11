package com.quickbite.backend.controller;

import com.quickbite.backend.service.AuthService;
import com.quickbite.backend.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/otp")
public class OtpController {

    @Autowired
    OtpService otpService;
    
    @Autowired
    AuthService authService;

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String type = request.get("type");

        if (email == null || email.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Email is required");
            return ResponseEntity.badRequest().body(error);
        }

        try {
            otpService.sendOtp(email, type != null ? type : "register");
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "OTP resent successfully to " + email);
            response.put("expiresIn", 300);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to resend OTP: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String type = request.get("type"); // register or login

        if (email == null || email.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Email is required");
            return ResponseEntity.badRequest().body(error);
        }

        try {
            otpService.sendOtp(email, type != null ? type : "register");
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "OTP sent successfully to " + email);
            response.put("expiresIn", 300);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to send OTP: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        
        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body("Email and OTP are required");
        }
        
        boolean isVerified = otpService.verifyOtp(email, otp);
        
        if (isVerified) {
             Map<String, Object> response = new HashMap<>();
             response.put("success", true);
             response.put("message", "OTP verified successfully");
             Map<String, Object> data = new HashMap<>();
             data.put("email", email);
             data.put("verified", true);
             response.put("data", data);
             return ResponseEntity.ok(response);
        } else {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Invalid or expired OTP");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/verify-login-otp")
    public ResponseEntity<?> verifyLoginOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        
        try {
             Map<String, Object> authResponse = authService.verifyLoginOtp(email, otp);
             Map<String, Object> response = new HashMap<>();
             response.put("success", true);
             response.put("message", "Login successful");
             response.put("data", authResponse);
             return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
