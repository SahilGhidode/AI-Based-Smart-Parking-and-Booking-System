"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useAuth } from "@/app/context/AuthContext";
import { translations } from "@/lib/translations";
import { FaUserCircle } from "react-icons/fa"; // 👈 added user icon

export default function Navigation() {
  const { language, setLanguage } = useLanguage();
  const { isLoggedIn, logout, user } = useAuth(); // 👈 get user info from AuthContext
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Helper: get user initial
  const getInitial = (name: string | undefined) => {
    return name ? name.charAt(0).toUpperCase() : "";
  };

  return (
    <nav className="fixed top-0 w-full bg-background border-b border-border shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ✅ Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="font-bold text-xl text-text hidden sm:inline">SmartPark</span>
          </Link>

          {/* ✅ Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-text-light hover:text-primary transition">
              {t.home}
            </Link>
            <Link href="/features" className="text-text-light hover:text-primary transition">
              {t.features}
            </Link>
            <Link href="/booking" className="text-text-light hover:text-primary transition">
              {t.booking}
            </Link>
            <Link href="/my-booking" className="text-text-light hover:text-primary transition">
              {t.myBooking}
            </Link>
            <Link href="/about" className="text-text-light hover:text-primary transition">
              {t.about}
            </Link>
            <Link href="/contact" className="text-text-light hover:text-primary transition">
              {t.contact}
            </Link>
          </div>

          {/* ✅ Right Side */}
          <div className="flex items-center gap-4 relative">
            {/* Language Switcher */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "hi")}
              className="px-3 py-1 border border-border rounded-lg text-sm bg-surface text-text cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
            </select>

            {/* ✅ Auth Section */}
            {!isLoggedIn ? (
              <div className="flex gap-2">
                <Link href="/login" className="px-4 py-2 text-primary hover:bg-surface rounded-lg transition">
                  {t.login}
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                >
                  {t.signup}
                </Link>
              </div>
            ) : (
              <div className="relative">
                {/* Avatar Circle */}
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg hover:opacity-90 transition"
                >
                  {getInitial(user?.name) || <FaUserCircle size={28} />}
                </button>

                {/* Dropdown */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-surface border border-border rounded-lg shadow-lg">
                    <p className="px-4 py-2 text-sm text-text">{user?.email}</p>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-primary hover:bg-background rounded-b-lg transition"
                    >
                      {t.logout}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-text hover:bg-surface rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* ✅ Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-border">
            <Link href="/" className="block px-4 py-2 text-text-light hover:text-primary">
              {t.home}
            </Link>
            <Link href="/features" className="block px-4 py-2 text-text-light hover:text-primary">
              {t.features}
            </Link>
            <Link href="/booking" className="block px-4 py-2 text-text-light hover:text-primary">
              {t.booking}
            </Link>
            <Link href="/my-booking" className="block px-4 py-2 text-text-light hover:text-primary">
              {t.myBooking}
            </Link>
            <Link href="/about" className="block px-4 py-2 text-text-light hover:text-primary">
              {t.about}
            </Link>
            <Link href="/contact" className="block px-4 py-2 text-text-light hover:text-primary">
              {t.contact}
            </Link>

            {/* Mobile Auth */}
            {!isLoggedIn ? (
              <div className="px-4 mt-2">
                <Link href="/login" className="block py-2 text-primary hover:underline">
                  {t.login}
                </Link>
                <Link href="/signup" className="block py-2 text-primary hover:underline">
                  {t.signup}
                </Link>
              </div>
            ) : (
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-primary hover:bg-surface rounded-lg mt-2"
              >
                {t.logout}
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
