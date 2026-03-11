package com.quickbite.backend.controller;

import com.quickbite.backend.model.Order;
import com.quickbite.backend.model.User;
import com.quickbite.backend.repository.UserRepository;
import com.quickbite.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('admin')")
public class AdminController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    OrderService orderService;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        // Strip passwords before sending
        List<Map<String, Object>> safeUsers = users.stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("phone", u.getPhone());
            m.put("role", u.getRole());
            m.put("isEmailVerified", u.getIsEmailVerified());
            m.put("approved", u.getApproved());
            m.put("isActive", u.getIsActive());
            m.put("createdAt", u.getCreatedAt());
            return m;
        }).toList();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", safeUsers.size());
        response.put("data", safeUsers);
        return ResponseEntity.ok(response);
    }

    // DELETE user by id
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (!userRepository.existsById(id)) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "User not found");
            return ResponseEntity.status(404).body(error);
        }
        userRepository.deleteById(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "User deleted successfully");
        return ResponseEntity.ok(response);
    }

    // PUT change user role (promote/demote)
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable String id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "User not found");
            return ResponseEntity.status(404).body(error);
        }
        String newRole = body.get("role");
        if (newRole == null || (!newRole.equals("user") && !newRole.equals("admin"))) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Role must be 'user' or 'admin'");
            return ResponseEntity.badRequest().body(error);
        }
        user.setRole(newRole);
        userRepository.save(user);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "User role updated to " + newRole);
        return ResponseEntity.ok(response);
    }

    // GET all orders (admin view)
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", orders.size());
        response.put("data", orders);
        return ResponseEntity.ok(response);
    }

    // PATCH order status
    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String id,
                                               @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        List<String> valid = List.of("pending", "confirmed", "preparing", "ready", "completed", "cancelled");
        if (newStatus == null || !valid.contains(newStatus)) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Invalid status. Must be one of: " + valid);
            return ResponseEntity.badRequest().body(err);
        }
        try {
            Order updated = orderService.updateOrderStatus(id, newStatus);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order status updated to " + newStatus);
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", e.getMessage());
            return ResponseEntity.status(404).body(err);
        }
    }
}
