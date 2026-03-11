export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const otpAPI = {
  sendOTP: async (email, type = 'register') => {
    const response = await fetch(`${API_BASE_URL}/otp/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }
    
    return response.json();
  },
  
  resendOTP: async (email, type = 'register') => {
    const response = await fetch(`${API_BASE_URL}/otp/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to resend OTP');
    }
    
    return response.json();
  },
  
  verifyOTP: async (email, otp) => {
    const response = await fetch(`${API_BASE_URL}/otp/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify OTP');
    }
    
    return response.json();
  },
  
  testEmail: async () => {
    const response = await fetch(`${API_BASE_URL}/otp/test`);
    return response.json();
  }
};

export const menu = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/menu`);
    if (!response.ok) {
      throw new Error("Failed to fetch menu");
    }
    return response.json();
  },
};