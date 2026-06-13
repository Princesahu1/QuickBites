import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const email = params.get("email");
  const { resetPassword } = useAuth();
  const nav = useNavigate();

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (pw !== pw2) return toast.error("Passwords do not match");
    try {
      setLoading(true);
      resetPassword({ email, token, newPassword: pw });
      toast.success("Password reset. You can login now.");
      nav("/login");
    } catch (err) {
      toast.error(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4 py-20 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-coral-400/10 dark:bg-coral-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-400/10 dark:bg-amber-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen -z-10" />

      <form onSubmit={submit} className="w-full max-w-md glass-card p-8 md:p-10 relative z-10 animate-fade-in text-center">
        <div className="w-20 h-20 bg-coral-50 dark:bg-coral-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white dark:ring-[#18181A]">
          <span className="text-4xl">🔑</span>
        </div>
        <h2 className="text-3xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight mb-2">
          Reset Password
        </h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
          Set a new password for <br /><span className="font-bold text-coral-500 mt-1 inline-block">{email}</span>
        </p>

        <div className="text-left space-y-5 mb-8">
          <div>
            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
              New Password
            </label>
            <input 
              required 
              type="password" 
              value={pw} 
              onChange={e=>setPw(e.target.value)} 
              placeholder="••••••••" 
              className="input-field" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
              Confirm Password
            </label>
            <input 
              required 
              type="password" 
              value={pw2} 
              onChange={e=>setPw2(e.target.value)} 
              placeholder="••••••••" 
              className="input-field" 
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button type="submit" disabled={loading} className={`flex-1 py-3.5 px-4 text-center justify-center font-bold rounded-xl transition-all shadow-lg text-white ${loading ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'btn-primary shadow-coral-500/30 hover:shadow-coral-500/50'}`}>
            {loading ? "Resetting..." : "Reset"}
          </button>
          <Link to="/login" className="flex-1 py-3.5 px-4 text-center justify-center font-bold rounded-xl transition-all border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
