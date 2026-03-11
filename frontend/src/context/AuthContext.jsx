import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    console.log("🔍 AuthProvider: useEffect running...");

    const checkAuth = () => {
      console.log("🔍 AuthProvider: checkAuth() called");
      try {
        const userData = authService.getCurrentUser();
        const token = authService.getToken();

        console.log("🔍 AuthProvider checkAuth:", {
          userData,
          token: token ? "Token exists" : "No token",
          localStorageUser: localStorage.getItem("user"),
          localStorageToken: localStorage.getItem("accessToken"),
        });

        if (userData && token) {
          console.log("✅ AuthProvider: Setting user:", userData);
          setUser(userData);
        } else {
          console.log("❌ AuthProvider: No valid auth data");
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        console.log("🔍 AuthProvider: Setting loading to false");
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes
    const handleStorageChange = () => {
      console.log("🔍 AuthProvider: Storage change detected");
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);

    // Custom event for auth changes
    window.addEventListener("authStateChange", handleStorageChange);

    // Also check after a short delay (in case localStorage wasn't ready)
    const timeoutId = setTimeout(() => {
      console.log("🔍 AuthProvider: Delayed check");
      checkAuth();
    }, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStateChange", handleStorageChange);
      clearTimeout(timeoutId);
    };
  }, []);

  // Login using backend
  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials);

      if (result.success) {
        setUser(result.data.user);
        // Trigger auth change
        window.dispatchEvent(new Event("authStateChange"));
        return { success: true };
      } else {
        return {
          success: false,
          message: result.message,
          requiresVerification: result.requiresVerification,
          email: result.email,
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Login failed" };
    }
  };

  // Register using backend
  const register = async (userData) => {
    try {
      const result = await authService.register(userData);

      if (result.success) {
        setUser(result.data.user);
        window.dispatchEvent(new Event("authStateChange"));
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, message: "Registration failed" };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      window.dispatchEvent(new Event("authStateChange"));
      return { success: true };
    } catch (error) {
      // Even if API fails, clear local state
      setUser(null);
      window.dispatchEvent(new Event("authStateChange"));
      return { success: true };
    }
  };

  // Check if authenticated
  const isAuthenticated = !!user;

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      // Add these for compatibility with your existing code
      sendVerificationEmail: () => Promise.resolve(),
      verifyEmail: () => Promise.resolve(),
      requestPasswordReset: () => Promise.resolve(),
      resetPassword: () => Promise.resolve(),
    }),
    [user, loading]
  );

  if (loading) {
    return null; // or a loader
  }

  if (loading) {
  return null; // or a loader
}

return (
  <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
);

}
