import { API_BASE_URL } from '../config/api';

export const menuService = {
  // Get all menu items
  getAllItems: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/menu?${params}`);
    return response.json();
  },

  // Get single item
  getItem: async (id) => {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`);
    return response.json();
  },

  // Get categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/menu/categories`);
    return response.json();
  }
};