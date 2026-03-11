package com.quickbite.backend.repository;

import com.quickbite.backend.model.Order;
import com.quickbite.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByUser(User user);
    List<Order> findByOrderNumber(String orderNumber);
    List<Order> findByStatus(String status);
    List<Order> findByOrderByCreatedAtDesc();
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    // Check if a dine-in table is already taken by an active order
    boolean existsByTableNumberAndOrderTypeAndStatusIn(String tableNumber, String orderType, List<String> statuses);
}
