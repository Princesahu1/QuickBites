import { API_BASE_URL } from '../config/api';

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // Also store in qb_user for AuthContext compatibility
        localStorage.setItem('qb_user', JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // Also store in qb_user for AuthContext compatibility
        localStorage.setItem('qb_user', JSON.stringify(data.data.user));

        // Trigger storage event to update AuthContext
        window.dispatchEvent(new Event('storage'));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  },

  // Google Sign-In
  googleLogin: async (googleToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ googleToken })
      });

      const data = await response.json();

      if (data.success && data.data) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('qb_user', JSON.stringify(data.data.user));
        window.dispatchEvent(new Event('storage'));
      }

      return data;
    } catch (error) {
      console.error('Google login error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  },

  // Logout user - ✅ ADDED THIS FUNCTION
  logout: async () => {
    try {
      // Optional: Call backend logout endpoint if you have one
      const token = localStorage.getItem('accessToken');

      if (token) {
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (error) {
          // If backend call fails, still clear local storage
          console.log('Backend logout failed, clearing local storage anyway');
        }
      }

      // Clear all auth data from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('qb_user');

      // Trigger storage event
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('authStateChange'));

      console.log('✅ Logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);

      // Even if there's an error, clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('qb_user');

      return { success: true }; // Return success anyway since we cleared local data
    }
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      // Try multiple storage keys
      let userData = localStorage.getItem('user');

      // If not found, try other possible keys
      if (!userData) {
        userData = localStorage.getItem('qb_user');
      }

      // If still not found, check for user in the data object
      if (!userData) {
        const dataStr = localStorage.getItem('data');
        if (dataStr) {
          const data = JSON.parse(dataStr);
          userData = data.user;
        }
      }

      if (userData) {
        const user = JSON.parse(userData);
        console.log('🔍 authService.getCurrentUser() found:', user);
        return user;
      }

      console.log('🔍 authService.getCurrentUser() found: null');
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    const user = authService.getCurrentUser();
    const isAuth = !!(token && user);
    console.log('🔍 authService.isAuthenticated():', isAuth, { token: !!token, user: !!user });
    return isAuth;
  },

  // Get auth token
  getToken: () => {
    const token = localStorage.getItem('accessToken');
    console.log('🔍 authService.getToken():', token ? 'Token exists' : 'No token');
    return token;
  },

  // Refresh token (if you have refresh token endpoint)
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        return { success: false, message: 'No refresh token' };
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      const data = await response.json();

      if (data.success && data.data) {
        localStorage.setItem('accessToken', data.data.accessToken);
        return { success: true };
      }

      return data;
    } catch (error) {
      return { success: false, message: 'Failed to refresh token' };
    }
  }
};

// Add this separate function for complete OTP registration flow
export const registerWithOTP = async (email, otp, userData) => {
  try {
    // Step 1: Verify OTP (OTP should already be sent)
    const verifyResponse = await authService.verifyRegisterOTP(email, otp);

    if (!verifyResponse.success) {
      return verifyResponse;
    }

    // Step 2: Register user with verified OTP
    const registerResponse = await authService.register(userData);

    return registerResponse;
  } catch (error) {
    console.error('Register with OTP error:', error);
    return {
      success: false,
      message: 'Registration failed'
    };
  }
};

// Export authService as default as well
export default authService;