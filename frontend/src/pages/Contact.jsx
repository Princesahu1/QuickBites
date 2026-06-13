import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../config/api";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setSent(true);
      toast.success("Message sent! We'll reply within 24 hours.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err.message || "Failed to send. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen pt-28 pb-20 px-4 relative overflow-hidden bg-gray-50 dark:bg-dark-bg">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-coral-400/10 dark:bg-coral-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-400/10 dark:bg-amber-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen -z-10" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4 shadow-sm border border-coral-200 dark:border-coral-800/50">
            Get In Touch
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight leading-tight mb-4">
            Contact <span className="bg-gradient-to-r from-coral-500 to-amber-500 bg-clip-text text-transparent">Support</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl max-w-xl mx-auto font-medium">
            Have a question, feedback or issue? Fill out the form and we'll respond within 24 hours.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Contact Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {[
              {
                icon: <Mail className="text-coral-500" size={24} />,
                title: "Email Us",
                value: "support@quickbite.com",
                sub: "We reply within 24 hours",
                href: "mailto:support@quickbite.com",
              },
              {
                icon: <Phone className="text-coral-500" size={24} />,
                title: "Call Us",
                value: "+91 12345 67890",
                sub: "Mon – Sat, 9 AM – 6 PM",
                href: "tel:+911234567890",
              },
              {
                icon: <MapPin className="text-coral-500" size={24} />,
                title: "Visit Us",
                value: "College Canteen, Campus Building",
                sub: "Your City, 123456",
                href: null,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-4 glass-card p-5 border border-white/50 dark:border-dark-border"
              >
                <div className="bg-coral-50 dark:bg-coral-900/20 p-3 rounded-2xl shadow-inner border border-coral-100 dark:border-coral-800/50">{item.icon}</div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
                    {item.title}
                  </p>
                  {item.href ? (
                    <a href={item.href} className="font-bold text-lg text-gray-900 dark:text-white hover:text-coral-600 dark:hover:text-coral-400 transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-bold text-lg text-gray-900 dark:text-white">{item.value}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{item.sub}</p>
                </div>
              </motion.div>
            ))}

            {/* Promise card */}
            <div className="bg-gradient-to-br from-coral-500 to-amber-500 rounded-3xl p-8 text-white shadow-xl shadow-coral-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
              <div className="relative z-10">
                <div className="text-4xl mb-4 text-white/90 drop-shadow-sm">⚡</div>
                <h3 className="font-extrabold font-display text-2xl mb-2 tracking-tight">Quick Response</h3>
                <p className="text-white/90 font-medium leading-relaxed">
                  We take every message seriously. Our support team responds within 24 hours on weekdays.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card p-8 md:p-10 border border-white/50 dark:border-dark-border"
          >
            {sent ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6 ring-4 ring-green-100 dark:ring-green-900/50 shadow-inner">
                  <CheckCircle size={48} className="text-green-500" />
                </div>
                <h3 className="text-3xl font-extrabold font-display text-gray-900 dark:text-white mb-2 tracking-tight">Message Sent!</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 max-w-sm">
                  We'll respond to your email within 24 hours. Keep an eye on your inbox!
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="btn-primary shadow-coral-500/30 hover:shadow-coral-500/50"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-2xl font-extrabold font-display text-gray-900 dark:text-white tracking-tight border-b border-gray-100 dark:border-dark-border pb-4 mb-6">Send Us a Message</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    placeholder="Order issue, feedback, etc."
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Describe your issue or feedback in detail..."
                    className="input-field resize-y min-h-[120px]"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 text-lg justify-center font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 mt-4 ${loading ? 'bg-gray-400 shadow-none cursor-wait' : 'btn-primary shadow-coral-500/30 hover:shadow-coral-500/50'}`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </motion.button>

                <p className="text-xs text-gray-400 dark:text-gray-500 text-center font-medium mt-4">
                  We'll also send a confirmation to your email.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
