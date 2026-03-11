import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';

export default function VerifyEmail() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from location state or localStorage
    const emailFromState = location.state?.email;
    const emailFromInput = location.state?.userEmail;
    
    if (emailFromState) {
      setEmail(emailFromState);
    } else if (emailFromInput) {
      setEmail(emailFromInput);
    }
  }, [location]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Email not found. Please try registering again.');
      navigate('/register');
      return;
    }

    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const result = await response.json();
      
      if (result.success) {
        // Store tokens
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        toast.success('✅ Email verified successfully! Welcome to QuickBite! 🎉');
        navigate('/');
      } else {
        toast.error(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error('Email not found. Please try registering again.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('✅ New OTP sent to your email!');
      } else {
        toast.error(result.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-4 pt-20">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            We've sent a 6-digit OTP to<br />
            <strong>{email || 'your email'}</strong>
          </p>
        </div>
        
        {!email && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Enter your email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              placeholder="your@email.com"
            />
          </div>
        )}
        
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition text-center text-2xl tracking-widest font-bold"
              placeholder="000000"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Valid for 10 minutes
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6 || !email}
            className="w-full bg-gradient-to-r from-red-500 to-orange-400 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="text-center space-y-3">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading || !email}
              className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
            >
              Didn't receive OTP? Resend
            </button>

            <div>
              <Link
                to="/login"
                className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
              >
                ← Back to login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
