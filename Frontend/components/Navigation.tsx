"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useAuth } from "@/app/context/AuthContext";
import { translations } from "@/lib/translations";

export default function Navigation() {
  const { language, setLanguage } = useLanguage();
  const { isLoggedIn, logout } = useAuth();
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);

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

            {/* ✅ Booking Pages always visible now */}
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

          {/* ✅ Right Side - Language + Auth */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "hi")}
              className="px-3 py-1 border border-border rounded-lg text-sm bg-surface text-text cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
            </select>

            {/* ✅ Auth Buttons */}
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
              <button
                onClick={logout}
                className="px-4 py-2 text-primary hover:bg-surface rounded-lg transition"
              >
                {t.logout}
              </button>
            )}

            {/* ✅ Mobile Menu Button */}
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

            {/* ✅ Booking visible for everyone */}
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

            {/* ✅ Auth (Mobile View) */}
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
