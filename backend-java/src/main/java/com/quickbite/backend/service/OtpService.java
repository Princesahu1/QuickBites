package com.quickbite.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${spring.mail.properties.mail.smtp.auth}")
    private String mailAuth;

    // Key: Email, Value: OtpData
    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();

    public static class OtpData {
        String otp;
        long expiresAt;
        String type; // "register" or "login"
        boolean verified;

        public OtpData(String otp, long expiresAt, String type) {
            this.otp = otp;
            this.expiresAt = expiresAt;
            this.type = type;
            this.verified = false;
        }
    }

    public String generateOtp() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }

    public void sendOtp(String email, String type) throws MessagingException {
        String otp = generateOtp();
        long expiresAt = System.currentTimeMillis() + 5 * 60 * 1000; // 5 minutes

        otpStore.put(email.toLowerCase(), new OtpData(otp, expiresAt, type));

        sendOtpEmail(email, otp, type);
    }

    private void sendOtpEmail(String email, String otp, String type) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setFrom(fromEmail);
        helper.setTo(email);
        helper.setSubject("🔐 Your QuickBite Verification Code: " + otp);
        
        String htmlContent = String.format("""
             <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; padding: 20px; }
                  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                  .header { background: linear-gradient(135deg, #ef4444 0%%, #fb923c 100%%); padding: 40px 20px; text-align: center; color: white; }
                  .content { padding: 40px 30px; text-align: center; }
                  .otp-box { background: linear-gradient(135deg, #fef3c7 0%%, #fde68a 100%%); border: 3px dashed #f59e0b; border-radius: 12px; padding: 30px; margin: 30px 0; }
                  .otp { font-size: 48px; font-weight: bold; color: #dc2626; letter-spacing: 12px; font-family: 'Courier New', monospace; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header"><h1>🍔 QuickBite</h1><p>Your favorite food delivery app</p></div>
                  <div class="content">
                    <h2>Email Verification Code</h2>
                    <p>Hello! You requested to %s your QuickBite account.</p>
                    <p>Your verification code is:</p>
                    <div class="otp-box"><div class="otp">%s</div></div>
                    <p>Valid for 5 minutes.</p>
                  </div>
                </div>
              </body>
              </html>
            """, type.equals("register") ? "register" : "log in to", otp);

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    public boolean verifyOtp(String email, String otp) {
        String normalizedEmail = email.toLowerCase();
        OtpData data = otpStore.get(normalizedEmail);

        if (data == null) return false;
        if (System.currentTimeMillis() > data.expiresAt) {
            otpStore.remove(normalizedEmail);
            return false;
        }
        if (data.otp.equals(otp.trim())) {
            data.verified = true;
            return true;
        }
        return false;
    }

    public OtpData getOtpData(String email) {
        return otpStore.get(email.toLowerCase());
    }

    public void clearOtp(String email) {
        otpStore.remove(email.toLowerCase());
    }

    // Scheduling cleanup every minute
    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredOtps() {
        long now = System.currentTimeMillis();
        otpStore.entrySet().removeIf(entry -> now > entry.getValue().expiresAt);
    }
}
