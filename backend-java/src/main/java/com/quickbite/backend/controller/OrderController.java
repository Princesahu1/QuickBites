package com.quickbite.backend.controller;

import com.quickbite.backend.model.Order;
import com.quickbite.backend.security.UserDetailsImpl;
import com.quickbite.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order order) {
        try {
             Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
             UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
             
             Order newOrder = orderService.createOrder(order, userDetails.getId());
             
             Map<String, Object> response = new HashMap<>();
             response.put("success", true);
             response.put("message", "Order placed successfully");
             response.put("data", newOrder);
             return ResponseEntity.status(201).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            List<Order> orders = orderService.getUserOrders(userDetails.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", orders.size());
            response.put("data", orders);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    // Public: returns pending and occupied table numbers for active dine-in orders
    @GetMapping("/occupied-tables")
    public ResponseEntity<?> getOccupiedTables() {
        Map<String, List<String>> tables = orderService.getOccupiedTables();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", tables);
        return ResponseEntity.ok(response);
    }
}
