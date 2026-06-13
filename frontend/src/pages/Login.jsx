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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4 py-20 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-coral-400/10 dark:bg-coral-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-400/10 dark:bg-amber-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen -z-10" />

      <div className="w-full max-w-md glass-card p-8 md:p-10 relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-coral-50 dark:bg-coral-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <span className="text-3xl">🍔</span>
          </div>
          <h2 className="text-3xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Login to order your favorite meals
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
              Email or Phone Number
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-bold text-coral-500 hover:text-coral-600 transition-colors">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          {showOTPResend && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 animate-fade-in">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-3">
                ⚠️ Your email is not verified. Please verify to continue.
              </p>
              <button
                type="button"
                onClick={() => navigate('/verify-email', { state: { email: pendingEmail } })}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-bold transition-all shadow-sm"
              >
                Verify Email Now
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 text-lg justify-center font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 mt-4 ${loading ? 'bg-gray-400 shadow-none cursor-wait' : 'btn-primary shadow-coral-500/30 hover:shadow-coral-500/50'}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging in...
              </>
            ) : 'Login to Continue'}
          </button>
        </form>

        <div className="flex items-center my-8">
          <div className="flex-1 border-t border-gray-200 dark:border-dark-border" />
          <span className="px-4 text-xs font-bold tracking-widest text-gray-400 uppercase">OR</span>
          <div className="flex-1 border-t border-gray-200 dark:border-dark-border" />
        </div>

        {googleLoading ? (
          <div className="w-full flex justify-center items-center py-3.5 bg-white dark:bg-[#18181A] border border-gray-200 dark:border-dark-border rounded-xl text-gray-500">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="font-bold">Signing in...</span>
          </div>
        ) : (
          <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px] overflow-hidden rounded-xl opacity-90 hover:opacity-100 transition-opacity" />
        )}

        <div className="mt-8 text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-coral-500 font-bold hover:text-coral-600 transition-colors">
              Create one
            </Link>
          </p>
          <Link to="/" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            Continue as guest
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
