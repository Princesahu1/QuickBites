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
    <section className="pt-24 min-h-[80vh] grid place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow">
        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Forgot password</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Enter your account email and we'll create a reset link (demo).</p>

        <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="w-full p-2 mb-3 border rounded bg-white dark:bg-gray-800" />
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded">Send reset link</button>
          <Link to="/login" className="px-4 py-2 bg-gray-200 rounded">Back to login</Link>
        </div>

        {info && (
          <div className="mt-4 p-3 border rounded bg-gray-50 dark:bg-gray-800">
            <div className="text-sm mb-2">Simulated reset link:</div>
            <a className="break-all text-blue-600" href={info.link}>{info.link}</a>
            <div className="mt-2 flex gap-2">
              <a className="px-3 py-1 bg-gray-200 rounded" href={info.mailto}>Open mail client</a>
            </div>
            <div className="text-xs text-gray-500 mt-2">Copy the link and paste into an email for a real demo.</div>
          </div>
        )}
      </form>
    </section>
  );
}
