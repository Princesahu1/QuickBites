import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    try {
      const result = requestPasswordReset(email);
      setInfo(result); // { link, mailto }
      toast.success("Reset link generated — open mail client or copy the link below.");
    } catch (err) {
      toast.error(err.message || "Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4 py-20 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-coral-400/10 dark:bg-coral-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-400/10 dark:bg-amber-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen -z-10" />

      <form onSubmit={submit} className="w-full max-w-md glass-card p-8 md:p-10 relative z-10 animate-fade-in text-center">
        <div className="w-20 h-20 bg-coral-50 dark:bg-coral-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white dark:ring-[#18181A]">
          <span className="text-4xl">🔐</span>
        </div>
        <h2 className="text-3xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight mb-2">
          Forgot Password
        </h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
          Enter your account email and we'll create a reset link.
        </p>

        <div className="text-left mb-6">
          <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
            Email Address
          </label>
          <input 
            required 
            type="email" 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            placeholder="you@example.com" 
            className="input-field" 
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button type="submit" className="flex-1 py-3.5 px-4 text-center justify-center font-bold rounded-xl transition-all shadow-lg btn-primary shadow-coral-500/30 hover:shadow-coral-500/50">
            Send Reset Link
          </button>
          <Link to="/login" className="flex-1 py-3.5 px-4 text-center justify-center font-bold rounded-xl transition-all border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            Back to Login
          </Link>
        </div>

        {info && (
          <div className="mt-6 p-4 border border-coral-200 dark:border-coral-900/50 rounded-xl bg-coral-50/50 dark:bg-coral-900/10 text-left animate-fade-in text-sm">
            <div className="font-bold text-coral-600 dark:text-coral-400 mb-2">Simulated reset link:</div>
            <a className="break-all text-blue-500 font-medium hover:underline" href={info.link}>{info.link}</a>
            <div className="mt-4 pt-4 border-t border-coral-200/50 dark:border-coral-900/30">
              <a className="inline-block px-4 py-2 bg-coral-100 dark:bg-coral-900/30 text-coral-700 dark:text-coral-300 rounded-lg font-bold text-xs" href={info.mailto}>Open Mail Client →</a>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-3">Copy the link and paste into an email for a real demo.</div>
          </div>
        )}
      </form>
    </div>
  );
}
