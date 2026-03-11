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
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-3xl font-extrabold text-red-600 mb-4 inline-block">
              🍔 QuickBite
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              Your favorite canteen food ordering platform. Order online and pick up fresh, hot meals without the wait!
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-red-600 transition"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-red-600 transition"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-red-600 transition"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-red-500 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-red-500 transition">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-red-500 transition">
                  Checkout
                </Link>
              </li>
              <li>
                <a
                  href="/#about"
                  onClick={scrollToAbout}
                  className="hover:text-red-500 transition cursor-pointer"
                >
                  About Us
                </a>
              </li>
              <li>
                <Link to="/contact" className="hover:text-red-500 transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin size={18} className="mt-1 flex-shrink-0 text-red-500" />
                <span className="text-sm">
                  College Canteen,<br />
                  Campus Building,<br />
                  Your City, 123456
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={18} className="flex-shrink-0 text-red-500" />
                <a href="tel:+911234567890" className="hover:text-red-500 transition text-sm">
                  +91 12345 67890
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={18} className="flex-shrink-0 text-red-500" />
                <Link to="/contact" className="hover:text-red-500 transition text-sm">
                  support@quickbite.com
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-6">
          
          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {currentYear} QuickBite. All rights reserved.
            </p>
            
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="hover:text-red-500 transition">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-red-500 transition">
                Terms of Service
              </Link>
              <Link to="/refund" className="hover:text-red-500 transition">
                Refund Policy
              </Link>
            </div>
          </div>

          {/* Made with Love */}
          <p className="text-center text-gray-600 text-sm mt-4">
            Made with ❤️ for hungry students
          </p>
        </div>
      </div>
    </footer>
  );
}