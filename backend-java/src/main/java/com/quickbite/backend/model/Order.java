package com.quickbite.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true)
    private String orderNumber;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id") // Creates a foreign key in order_items table
    private List<OrderItem> items = new ArrayList<>();

    @Min(0)
    private Double totalAmount;

    @Min(0)
    private Double discount = 0.0;

    @Min(0)
    private Double finalAmount;

    @Embedded
    private CustomerInfo customerInfo;

    private Date pickupTime;

    private String status = "pending"; // pending, confirmed, preparing, ready, completed, cancelled

    private String paymentMethod = "cash"; // cash, upi, card, wallet

    private String paymentStatus = "pending"; // pending, paid, failed, refunded

    @Column(length = 1000)
    private String notes;

    private String tableNumber; // for dine-in orders e.g. "5"
    private String orderType = "dine_in"; // dine_in | takeaway

    @ElementCollection
    private List<StatusHistory> statusHistory = new ArrayList<>();

    private String cancelReason;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class CustomerInfo {
        private String name;
        private String phone;
        private String email;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class StatusHistory {
        private String status;
        private Date timestamp;
        private String updatedBy; // Storing User ID or Name
        private String note;
    }
}
