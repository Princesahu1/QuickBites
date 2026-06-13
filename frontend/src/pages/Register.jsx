import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';
import { otpAPI } from '../config/api';

export default function Register() {
  const [step, setStep] = useState(1); // 1: Register, 2: OTP Verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    // Validation
    const errors = [];

    if (formData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (formData.password.length < 4) {
      errors.push('Password must be at least 4 characters');
    }

    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setLoading(true);

    try {
      const result = await otpAPI.sendOTP(formData.email, 'register');

      if (result.success) {
        toast.success('✅ OTP sent to your email! Check your inbox.');
        setStep(2); // Move to OTP verification step
      } else {
        toast.error(result.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error('❌ ' + (error.message || 'Network error. Please check your connection.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      // First verify OTP
      const otpResult = await otpAPI.verifyOTP(formData.email, otp);

      if (otpResult.success) {
        // OTP already verified above — directly register the user
        const userData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        };

        const registerResult = await authService.register(userData);

        if (registerResult.success) {
          toast.success('✅ Registration successful! 🎉 Welcome!');
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          if (registerResult.message?.includes('already registered')) {
            toast.error('Email already registered. Please login instead.');
            setTimeout(() => navigate('/login'), 2000);
          } else {
            toast.error(registerResult.message || 'Registration failed');
          }
        }
      } else {
        toast.error(otpResult.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('❌ ' + (error.message || 'Verification failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);

    try {
      const result = await otpAPI.resendOTP(formData.email, 'register');

      if (result.success) {
        toast.success('✅ New OTP sent to your email!');
        setOtp(''); // Clear the OTP input
      } else {
        toast.error(result.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('❌ ' + (error.message || 'Network error. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification Step
  if (step === 2) {
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
              We sent a 6-digit code to
            </p>
            <p className="font-bold text-coral-500 mt-1">
              {formData.email}
            </p>
          </div>

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
                autoFocus
              />
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mt-4 text-center flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-coral-500 animate-pulse"></span>
                Code expires in 5 minutes
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className={`w-full py-3.5 text-lg justify-center font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 mt-4 ${loading || otp.length !== 6 ? 'bg-gray-400 shadow-none cursor-not-allowed text-white/80' : 'btn-primary shadow-coral-500/30 hover:shadow-coral-500/50'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify & Create Account'
              )}
            </button>

            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-dark-border text-center space-y-4">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-sm font-bold text-coral-500 hover:text-coral-600 transition-colors disabled:opacity-50"
              >
                Didn't receive code? Resend
              </button>
              <br />
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors inline-flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
                Change Email
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Registration Step
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4 py-20 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-coral-400/10 dark:bg-coral-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-400/10 dark:bg-amber-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen -z-10" />

      <div className="max-w-md w-full glass-card p-8 md:p-10 relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-coral-50 dark:bg-coral-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <span className="text-3xl">✨</span>
          </div>
          <h2 className="text-3xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight mb-2">
            Join QuickBite
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Create an account to start ordering
          </p>
        </div>

        <form onSubmit={handleSendOTP} className="space-y-5">
          <div>
            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={2}
              className="input-field"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
              Email Address *
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
            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
              placeholder="+91 XXXXX XXXXX"
            />
            <p className="text-xs text-gray-400 font-medium mt-1.5 ml-1">
              Optional — used for order updates
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={4}
              className="input-field"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-400 font-medium mt-1.5 ml-1">
              Minimum 4 characters
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={4}
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
             className={`w-full py-3.5 text-lg justify-center font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 mt-6 ${loading ? 'bg-gray-400 shadow-none cursor-wait' : 'btn-primary shadow-coral-500/30 hover:shadow-coral-500/50'}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending Security Code...
              </>
            ) : (
              'Continue with Email 📧'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-border text-center">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-coral-500 font-bold hover:text-coral-600 transition-colors">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}