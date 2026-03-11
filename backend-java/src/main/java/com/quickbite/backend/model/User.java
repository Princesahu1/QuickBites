package com.quickbite.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    @Column(unique = true)
    private String email;

    // Nullable for OAuth users (Google Sign-In) who don't have a password
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Column(nullable = true)
    private String password;

    @Column(unique = true)
    private String googleId; // Set for users who sign in via Google

    private String phone;

    @Embedded
    private Address address;

    private String role = "user"; // user, admin

    private Boolean isVerified = false; // Kept for backward compat if needed, but AuthService uses isEmailVerified
    
    private Boolean isEmailVerified = false;
    private Boolean approved = true;
    private Boolean isActive = true;

    private String verificationToken;

    private String resetPasswordToken;
    private LocalDateTime resetPasswordExpires;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> favorites = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class Address {
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
    }
}
