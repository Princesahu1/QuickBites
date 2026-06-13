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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4 py-20 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-coral-400/10 dark:bg-coral-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-400/10 dark:bg-amber-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen -z-10" />

      <div className="max-w-md w-full glass-card p-8 md:p-10 relative z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-coral-50 dark:bg-coral-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white dark:ring-[#18181A]">
            <span className="text-4xl">📧</span>
          </div>
          <h2 className="text-3xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight mb-2">
            Verify Email
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            We've sent a 6-digit OTP to<br />
            <strong className="text-coral-500 mt-1 inline-block">{email || 'your email'}</strong>
          </p>
        </div>
        
        {!email && (
          <div className="mb-6">
            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
              Enter your email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              placeholder="your@email.com"
            />
          </div>
        )}
        
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div>
            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-3 text-center">
              Enter Security Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
              className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-dark-border bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white text-center text-4xl font-extrabold tracking-[0.5em] focus:outline-none focus:border-coral-500 transition-colors shadow-inner"
              placeholder="000000"
            />
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mt-4 text-center flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-coral-500 animate-pulse"></span>
              Valid for 10 minutes
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6 || !email}
            className={`w-full py-3.5 text-lg justify-center font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 mt-4 ${loading || otp.length !== 6 || !email ? 'bg-gray-400 shadow-none cursor-not-allowed text-white/80' : 'btn-primary shadow-coral-500/30 hover:shadow-coral-500/50'}`}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="pt-6 mt-6 border-t border-gray-100 dark:border-dark-border text-center space-y-4">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading || !email}
              className="text-sm font-bold text-coral-500 hover:text-coral-600 transition-colors disabled:opacity-50"
            >
              Didn't receive code? Resend
            </button>

            <div>
              <Link
                to="/login"
                className="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors inline-flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
                Back to login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
