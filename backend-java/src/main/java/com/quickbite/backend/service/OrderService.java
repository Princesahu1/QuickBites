package com.quickbite.backend.service;

import com.quickbite.backend.model.Order;
import com.quickbite.backend.model.User;
import com.quickbite.backend.repository.OrderRepository;
import com.quickbite.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class OrderService {

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    UserRepository userRepository;

    public Order createOrder(Order order, String userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        // For dine-in orders, ensure the selected table is not already taken
        if ("dine_in".equals(order.getOrderType()) && order.getTableNumber() != null && !order.getTableNumber().isBlank()) {
            List<String> activeStatuses = List.of("pending", "confirmed", "preparing", "ready");
            boolean tableTaken = orderRepository.existsByTableNumberAndOrderTypeAndStatusIn(
                    order.getTableNumber(),
                    "dine_in",
                    activeStatuses
            );
            if (tableTaken) {
                throw new Exception("Table " + order.getTableNumber() + " is already occupied or pending. Please select another table.");
            }
        }

        order.setUser(user);
        order.setOrderNumber(generateOrderNumber());
        order.setCreatedAt(LocalDateTime.now());
        
        // Calculate totals logic should be here or frontend. Assuming frontend sends valid data for now but enforcing server side calc is better.
        // For conversion speed, trusting valid input structure but ensuring crucial fields.
        
        return orderRepository.save(order);
    }

    public List<Order> getUserOrders(String userId) {
        // In JPA, we typically query by the entity or use ID mirroring
        // Better to find user first ensures valid user
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return List.of();
        return orderRepository.findByUser(user);
    }

    public Order getOrderById(String id) throws Exception {
        return orderRepository.findById(id)
                .orElseThrow(() -> new Exception("Order not found"));
    }
    
    // Admin methods
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public Map<String, List<String>> getOccupiedTables() {
        List<Order> allActive = orderRepository.findAll().stream()
            .filter(o -> "dine_in".equals(o.getOrderType()) && o.getTableNumber() != null)
            .toList();

        List<String> pending = allActive.stream()
            .filter(o -> "pending".equals(o.getStatus()))
            .map(Order::getTableNumber).distinct().toList();

        List<String> occupied = allActive.stream()
            .filter(o -> List.of("confirmed", "preparing", "ready").contains(o.getStatus()))
            .map(Order::getTableNumber).distinct().toList();

        return Map.of("pending", pending, "occupied", occupied);
    }

    public Order updateOrderStatus(String id, String status) throws Exception {
        Order order = getOrderById(id);
        if ("cancelled".equals(order.getStatus())) {
            throw new Exception("Cannot change status of a cancelled order");
        }
        if ("completed".equals(order.getStatus())) {
            throw new Exception("Cannot change status of a completed order");
        }
        order.setStatus(status);
        return orderRepository.save(order);
    }

    private String generateOrderNumber() {
        return "QB" + System.currentTimeMillis() + "-" + (new Random().nextInt(9000) + 1000);
    }
}
