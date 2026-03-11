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
    <section className="pt-24 min-h-[80vh] grid place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow">
        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Reset password</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Set a new password for <span className="font-medium">{email}</span></p>

        <input required type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="New password" className="w-full p-2 mb-2 border rounded bg-white dark:bg-gray-800" />
        <input required type="password" value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="Confirm password" className="w-full p-2 mb-3 border rounded bg-white dark:bg-gray-800" />

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-red-500 text-white rounded">{loading ? "Resetting..." : "Reset password"}</button>
          <Link to="/login" className="px-4 py-2 bg-gray-200 rounded">Back to login</Link>
        </div>
      </form>
    </section>
  );
}
