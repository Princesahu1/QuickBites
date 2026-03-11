package com.quickbite.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "menu_items")
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank(message = "Please provide item name")
    @Column(unique = true)
    private String name;

    private String description;

    @NotBlank(message = "Please provide a category")
    private String category;

    @Min(value = 0, message = "Price cannot be negative")
    private Double price;

    private String image = "";

    private Boolean isAvailable = true;

    private Boolean isVeg = true;

    @Min(value = 0, message = "Preparation time cannot be negative")
    private Integer preparationTime = 15;

    @ElementCollection
    private List<String> ingredients;

    private Double rating = 0.0;

    private Integer reviewCount = 0;

    private Integer soldCount = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
