package com.quickbite.backend.repository;

import com.quickbite.backend.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, String> {
    List<MenuItem> findByCategory(String category);
    
    // For search functionality
    List<MenuItem> findByNameContainingIgnoreCase(String name);
    
    // For veg/non-veg filter
    List<MenuItem> findByIsVeg(Boolean isVeg);

    // For DataSeeder to avoid duplicates
    boolean existsByName(String name);

    // Exact name lookup for updates
    java.util.Optional<MenuItem> findByName(String name);
}
