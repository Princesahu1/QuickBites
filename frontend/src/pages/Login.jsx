import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showOTPResend, setShowOTPResend] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const googleBtnRef = useRef(null);
  const navigate = useNavigate();

  // Initialize Google Sign-In when the GSI script has loaded
  useEffect(() => {
    const initGoogle = () => {
      if (!window.google || !googleBtnRef.current) return;

      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        cancel_on_tap_outside: true,
      });

      // Render Google's own branded button inside our wrapper div
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: googleBtnRef.current.offsetWidth || 400,
      });
    };

    // Google script may already be loaded, or we wait for it
    if (window.google) {
      initGoogle();
    } else {
      // Poll until the GSI script loads (it's loaded async in index.html)
      const timer = setInterval(() => {
        if (window.google) {
          clearInterval(timer);
          initGoogle();
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    // response.credential is the Google ID token (JWT)
    setGoogleLoading(true);
    try {
      const result = await authService.googleLogin(response.credential);
      if (result.success) {
        toast.success('✅ Signed in with Google! Welcome 🎉');
        const userData = authService.getCurrentUser();
        if (userData) {
          window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: JSON.stringify(userData) }));
          window.dispatchEvent(new Event('authStateChange'));
          setTimeout(() => { window.location.href = '/'; }, 500);
        }
      } else {
        toast.error(result.message || '❌ Google Sign-In failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      toast.error('Google Sign-In failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authService.login(formData);
      if (result.success) {
        toast.success('✅ Login successful! Welcome back! 🎉');
        const userData = authService.getCurrentUser();
        if (userData) {
          window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: JSON.stringify(userData) }));
          window.dispatchEvent(new Event('authStateChange'));
          setTimeout(() => { window.location.href = '/'; }, 500);
        }
      } else if (result.requiresVerification) {
        setShowOTPResend(true);
        setPendingEmail(result.email);
        toast.error('⚠️ ' + result.message);
      } else {
        toast.error(result.message || '❌ Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-4 pt-20">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back! 🍔
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Login to order your favorite meals
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Email or Phone Number
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              placeholder="your@email.com"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter your registered email address
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              placeholder="••••••••"
            />
          </div>

          {showOTPResend && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                ⚠️ Your email is not verified. Please verify to continue.
              </p>
              <button
                type="button"
                onClick={() => navigate('/verify-email', { state: { email: pendingEmail } })}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-medium transition"
              >
                Verify Email Now
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-orange-400 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging in...
              </span>
            ) : 'Login'}
          </button>
        </form>

        {/* ── OR divider ── */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
          <span className="px-4 text-sm text-gray-400 dark:text-gray-500 font-medium">OR</span>
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
        </div>

        {/* ── Google Sign-In ── */}
        {googleLoading ? (
          <div className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-500">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="font-semibold">Signing in with Google...</span>
          </div>
        ) : (
          /* Google renders its own button here via the GSI library */
          <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]" />
        )}

        <div className="mt-6 text-center space-y-3">
          <p className="text-gray-600 dark:text-gray-300">
            Don't have an account?{' '}
            <Link to="/register" className="text-red-600 dark:text-red-400 font-semibold hover:underline">
              Register here
            </Link>
          </p>
          <Link to="/" className="block text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
            Continue as guest →
          </Link>
        </div>
      </div>
    </div>
  );
}
