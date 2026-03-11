package com.quickbite.backend.service;

import com.quickbite.backend.model.MenuItem;
import com.quickbite.backend.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuService {

    @Autowired
    MenuItemRepository menuItemRepository;

    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    public MenuItem getMenuItemById(String id) throws Exception {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new Exception("Menu item not found"));
    }

    public List<MenuItem> getMenuItemsByCategory(String category) {
        return menuItemRepository.findByCategory(category);
    }

    public MenuItem addMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }

    public MenuItem updateMenuItem(String id, MenuItem menuItem) throws Exception {
        if (!menuItemRepository.existsById(id)) {
            throw new Exception("Menu item not found");
        }
        menuItem.setId(id);
        return menuItemRepository.save(menuItem);
    }

    public void deleteMenuItem(String id) {
        menuItemRepository.deleteById(id);
    }
}
