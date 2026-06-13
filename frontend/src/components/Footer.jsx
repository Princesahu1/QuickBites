import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToAbout = (e) => {
    e.preventDefault();
    if (location.pathname === "/") {
      document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
      }, 400);
    }
  };

  return (
    <footer className="bg-white dark:bg-dark-bg border-t border-gray-100 dark:border-dark-border pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-3xl font-extrabold text-coral-500 mb-6 inline-block tracking-tight">
              QB.
            </Link>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md leading-relaxed text-sm">
              Your favorite canteen food ordering platform. Order online and pick up fresh, hot meals without the wait! Elevating campus dining to a premium experience.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-50 dark:bg-dark-card p-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 hover:text-coral-500 hover:border-coral-200 hover:bg-coral-50 dark:hover:text-coral-400 transition-all shadow-sm"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-50 dark:bg-dark-card p-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 hover:text-coral-500 hover:border-coral-200 hover:bg-coral-50 dark:hover:text-coral-400 transition-all shadow-sm"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-50 dark:bg-dark-card p-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 hover:text-coral-500 hover:border-coral-200 hover:bg-coral-50 dark:hover:text-coral-400 transition-all shadow-sm"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-wider mb-6">Explore</h3>
            <ul className="space-y-3 font-medium text-sm">
              <li>
                <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-gray-500 dark:text-gray-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors">
                  Our Menu
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="text-gray-500 dark:text-gray-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors">
                  Checkout
                </Link>
              </li>
              <li>
                <a
                  href="/#about"
                  onClick={scrollToAbout}
                  className="text-gray-500 dark:text-gray-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors cursor-pointer"
                >
                  About Us
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-gray-500 dark:text-gray-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-wider mb-6">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 flex-shrink-0 text-coral-500" />
                <span className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  College Canteen,<br />
                  Campus Building,<br />
                  Your City, 123456
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="flex-shrink-0 text-coral-500" />
                <a href="tel:+911234567890" className="text-gray-500 dark:text-gray-400 hover:text-coral-500 font-medium transition-colors">
                  +91 12345 67890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="flex-shrink-0 text-coral-500" />
                <Link to="/contact" className="text-gray-500 dark:text-gray-400 hover:text-coral-500 font-medium transition-colors">
                  support@quickbite.com
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-dark-border pt-8">
          
          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 dark:text-gray-500 text-xs font-medium text-center md:text-left">
              © {currentYear} QuickBite. All rights reserved.
            </p>
            
            <div className="flex gap-6 text-xs font-semibold">
              <Link to="/privacy" className="text-gray-400 dark:text-gray-500 hover:text-coral-500 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 dark:text-gray-500 hover:text-coral-500 transition-colors">
                Terms of Service
              </Link>
              <Link to="/refund" className="text-gray-400 dark:text-gray-500 hover:text-coral-500 transition-colors">
                Refunds
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}