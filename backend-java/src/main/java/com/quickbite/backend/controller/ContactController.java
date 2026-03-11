package com.quickbite.backend.controller;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String supportEmail;

    public ContactController(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Data
    public static class ContactRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email address")
        private String email;

        @NotBlank(message = "Subject is required")
        private String subject;

        @NotBlank(message = "Message is required")
        private String message;
    }

    @PostMapping
    public ResponseEntity<?> sendContactEmail(@Valid @RequestBody ContactRequest req) {
        try {
            // Email TO the support inbox
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(supportEmail);
            helper.setSubject("QuickBite Support: " + req.getSubject());
            helper.setText(buildEmailBody(req), true);
            helper.setReplyTo(req.getEmail());
            mailSender.send(msg);

            // Auto-reply TO the user
            MimeMessage reply = mailSender.createMimeMessage();
            MimeMessageHelper replyHelper = new MimeMessageHelper(reply, true, "UTF-8");
            replyHelper.setTo(req.getEmail());
            replyHelper.setSubject("We got your message — QuickBite Support");
            replyHelper.setText(buildAutoReply(req.getName()), true);
            mailSender.send(reply);

            return ResponseEntity.ok(Map.of("message", "Your message has been sent successfully!"));
        } catch (MessagingException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to send message. Please try again."));
        }
    }

    private String buildEmailBody(ContactRequest req) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:12px">
              <h2 style="color:#ef4444">📩 New Contact Request — QuickBite</h2>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:8px;font-weight:bold;color:#555">Name</td><td style="padding:8px">%s</td></tr>
                <tr style="background:#fff"><td style="padding:8px;font-weight:bold;color:#555">Email</td><td style="padding:8px">%s</td></tr>
                <tr><td style="padding:8px;font-weight:bold;color:#555">Subject</td><td style="padding:8px">%s</td></tr>
              </table>
              <div style="background:#fff;padding:16px;border-radius:8px;margin-top:16px">
                <p style="font-weight:bold;color:#555;margin-bottom:8px">Message:</p>
                <p style="color:#333;white-space:pre-line">%s</p>
              </div>
            </div>
            """.formatted(req.getName(), req.getEmail(), req.getSubject(), req.getMessage());
    }

    private String buildAutoReply(String name) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:12px">
              <h2 style="color:#ef4444">🍔 QuickBite Support</h2>
              <p>Hi <strong>%s</strong>,</p>
              <p>Thank you for reaching out! We've received your message and will get back to you within <strong>24 hours</strong>.</p>
              <p style="color:#555">In the meantime, feel free to browse our menu and enjoy your meal! 🍕</p>
              <br/>
              <p style="color:#ef4444;font-weight:bold">— Team QuickBite</p>
            </div>
            """.formatted(name);
    }
}
