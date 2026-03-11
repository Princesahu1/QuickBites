import { API_BASE_URL, getAuthHeaders } from '../config/api';

export const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    return response.json();
  },

  // Get my orders
  getMyOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Get single order
  getOrder: async (id) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Cancel order
  cancelOrder: async (id, reason) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cancelReason: reason })
    });
    return response.json();
  }
};