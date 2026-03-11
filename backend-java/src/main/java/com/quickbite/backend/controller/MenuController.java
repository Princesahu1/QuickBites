package com.quickbite.backend.controller;

import com.quickbite.backend.model.MenuItem;
import com.quickbite.backend.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    @Autowired
    MenuService menuService;

    @GetMapping
    public ResponseEntity<?> getAllMenuItems() {
        List<MenuItem> items = menuService.getAllMenuItems();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", items.size());
        response.put("data", items);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMenuItemById(@PathVariable String id) {
        try {
            MenuItem item = menuService.getMenuItemById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", item);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        String[] categories = {"Pizza", "Burger", "Snacks", "Drinks", "South Indian", "Chinese", "Sandwich", "Rolls", "Dessert"};
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", categories);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<?> addMenuItem(@RequestBody MenuItem menuItem) {
        try {
            MenuItem newItem = menuService.addMenuItem(menuItem);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", newItem);
            return ResponseEntity.status(201).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<?> updateMenuItem(@PathVariable String id, @RequestBody MenuItem menuItem) {
        try {
            MenuItem updated = menuService.updateMenuItem(id, menuItem);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('admin')")
    public ResponseEntity<?> deleteMenuItem(@PathVariable String id) {
        try {
            menuService.deleteMenuItem(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Menu item deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        }
    }
}
