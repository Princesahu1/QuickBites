package com.quickbite.backend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.quickbite.backend.model.User;
import com.quickbite.backend.repository.UserRepository;
import com.quickbite.backend.security.JwtUtils;
import com.quickbite.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    OtpService otpService;

    @Value("${google.client.id}")
    private String googleClientId;

    public Map<String, Object> registerUser(String name, String email, String password, String phone) throws Exception {
        // Check if OTP verified
        OtpService.OtpData otpData = otpService.getOtpData(email);
        if (otpData == null || !otpData.type.equals("register") || !otpData.verified) {
            throw new Exception("Please verify your email with OTP first");
        }

        if (userRepository.existsByEmail(email)) {
            throw new Exception("Email already registered");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email.toLowerCase());
        user.setPassword(encoder.encode(password));
        if (phone != null && !phone.isBlank()) {
            user.setPhone(phone);
        }
        user.setIsEmailVerified(true);
        user.setApproved(true);
        user.setRole("user");

        userRepository.save(user);
        otpService.clearOtp(email);

        return authenticateAndGenerateToken(email, password);
    }

    public Map<String, Object> loginUser(String email, String password) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("Invalid credentials"));

        if (user.getPassword() == null || !encoder.matches(password, user.getPassword())) {
             throw new Exception("Invalid credentials");
        }
        
        validateUserStatus(user);

        return authenticateAndGenerateToken(email, password);
    }

    /**
     * Verifies a Google ID token, then either logs in or auto-registers the user.
     */
    public Map<String, Object> googleLoginOrRegister(String googleIdToken) throws Exception {
        // 1. Verify the token with Google's servers
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(googleIdToken);
        if (idToken == null) {
            throw new Exception("Invalid Google token");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String googleId = payload.getSubject();        // unique Google user ID
        String email = payload.getEmail().toLowerCase();
        String name = (String) payload.get("name");
        if (name == null || name.isBlank()) {
            name = email.split("@")[0]; // fallback name
        }

        // 2. Find existing user by googleId or email
        Optional<User> existingByGoogleId = userRepository.findByGoogleId(googleId);
        Optional<User> existingByEmail = userRepository.findByEmail(email);

        User user;
        if (existingByGoogleId.isPresent()) {
            // Known Google user — just log in
            user = existingByGoogleId.get();
        } else if (existingByEmail.isPresent()) {
            // Email exists from a regular account — link Google ID and log in
            user = existingByEmail.get();
            user.setGoogleId(googleId);
            user.setIsEmailVerified(true);
            userRepository.save(user);
        } else {
            // Brand new user — auto-register
            user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setGoogleId(googleId);
            user.setIsEmailVerified(true);
            user.setApproved(true);
            user.setIsActive(true);
            user.setRole("user");
            // password is null for Google-only accounts
            userRepository.save(user);
        }

        validateUserStatus(user);

        // 3. Generate our own JWT (bypass Spring Security auth manager — no password)
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        return buildAuthResponse(jwt, user);
    }

    public Map<String, Object> verifyLoginOtp(String email, String otp) throws Exception {
        if (!otpService.verifyOtp(email, otp)) {
             throw new Exception("Invalid or expired OTP");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("User not found"));

        validateUserStatus(user);
        
        user.setIsEmailVerified(true);
        userRepository.save(user);
         
         UserDetailsImpl userDetails = UserDetailsImpl.build(user);
         UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                 userDetails, null, userDetails.getAuthorities());
         
         SecurityContextHolder.getContext().setAuthentication(authentication);
         String jwt = jwtUtils.generateJwtToken(authentication);

         return buildAuthResponse(jwt, user);
    }

    private void validateUserStatus(User user) throws Exception {
        if (!user.getIsEmailVerified()) throw new Exception("Please verify your email address first");
        if (!user.getApproved()) throw new Exception("Your account is pending admin approval");
        if (!user.getIsActive()) throw new Exception("Your account has been deactivated");
    }

    private Map<String, Object> authenticateAndGenerateToken(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        User user = userRepository.findByEmail(email).get();

        return buildAuthResponse(jwt, user);
    }
    
    private Map<String, Object> buildAuthResponse(String token, User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", token);
        response.put("refreshToken", token); // Reusing as refresh for simplicity
        
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("phone", user.getPhone());
        userData.put("role", user.getRole());
        userData.put("isEmailVerified", user.getIsEmailVerified());
        userData.put("approved", user.getApproved());
        
        response.put("user", userData);
        return response;
    }
}
