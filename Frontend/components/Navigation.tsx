"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { useAuth } from "@/app/context/AuthContext";
import { translations } from "@/lib/translations";
import { FaUserCircle } from "react-icons/fa";

export default function Navigation() {
  const { language, setLanguage } = useLanguage();
  const { isLoggedIn, logout, user } = useAuth();
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const getInitial = (name: string | undefined) => {
    return name ? name.charAt(0).toUpperCase() : "";
  };

  return (
    <nav
      className="
        fixed top-0 w-full z-50 animate-fadeIn
        glass shadow-lg border-b border-blue-300/20
        backdrop-blur-xl transition-all
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="font-bold text-xl text-text hidden sm:inline animate-slideLeft">
              SmartPark
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8 animate-fadeIn">
            {[
              { label: t.home, href: "/" },
              { label: t.features, href: "/features" },
              { label: t.booking, href: "/booking" },
              { label: t.myBooking, href: "/my-booking" },
              { label: t.about, href: "/about" },
              { label: t.contact, href: "/contact" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="
                  text-text-light hover:text-blue-600 transition-all 
                  hover:drop-shadow-sm hover:scale-[1.03]
                "
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4 relative">

            {/* LANGUAGE */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "hi")}
              className="
                px-3 py-1 border border-blue-300/40 rounded-lg text-sm 
                bg-white/40 backdrop-blur-xl text-text cursor-pointer
                hover:bg-white/60 transition
              "
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
            </select>

            {/* AUTH */}
            {!isLoggedIn ? (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="
                    px-4 py-2 text-blue-600 hover:bg-blue-100/40 rounded-lg 
                    transition-all hover:scale-[1.03]
                  "
                >
                  {t.login}
                </Link>
                <Link
                  href="/signup"
                  className="
                    px-4 py-2 bg-blue-600 text-white rounded-lg 
                    hover:bg-blue-700 transition-all shadow-md hover:shadow-lg
                    hover:scale-[1.03]
                  "
                >
                  {t.signup}
                </Link>
              </div>
            ) : (
              <div className="relative">
                {/* AVATAR */}
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="
                    w-10 h-10 rounded-full bg-blue-600 text-white flex 
                    items-center justify-center font-bold text-lg 
                    hover:opacity-90 hover:scale-[1.05] shadow-md 
                    transition-all
                  "
                >
                  {getInitial(user?.name) || <FaUserCircle size={28} />}
                </button>

                {/* DROPDOWN */}
                {showDropdown && (
                  <div
                    className="
                      absolute right-0 mt-3 w-56 glass border-blue-200/30
                      rounded-lg shadow-xl animate-slideDown overflow-hidden
                    "
                  >
                    {/* EMAIL */}
                    <div className="px-4 py-3 border-b border-blue-200/20 bg-blue-50/30 text-text">
                      <p className="text-sm font-medium">{user?.email}</p>
                    </div>

                    {/* MENU LIST */}
                    <div className="py-2 text-sm">
                      {[
                        { href: "/profile", icon: "👤", label: "Profile" },
                        { href: "/AddVehicle", icon: "🚗", label: "Add Vehicle" },
                        { href: "/payment-history", icon: "💳", label: "Payment History" },
                        { href: "/settings", icon: "⚙️", label: "Settings" },
                      ].map((item, i) => (
                        <Link
                          key={i}
                          href={item.href}
                          className="
                            flex items-center gap-3 px-4 py-2 
                            hover:bg-blue-100/40 transition-colors
                          "
                          onClick={() => setShowDropdown(false)}
                        >
                          <span className="text-blue-600">{item.icon}</span> {item.label}
                        </Link>
                      ))}
                    </div>

                    {/* LOGOUT */}
                    <button
                      onClick={() => {
                        logout();
                        setShowDropdown(false);
                      }}
                      className="
                        w-full flex items-center gap-3 px-4 py-2 text-sm 
                        text-red-600 hover:bg-red-100/40 transition-colors
                      "
                    >
                      🚪 {t.logout}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="
                md:hidden p-2 text-text hover:bg-blue-100/40 
                rounded-lg transition
              "
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-border animate-slideDown">
            {[
              { label: t.home, href: "/" },
              { label: t.features, href: "/features" },
              { label: t.booking, href: "/booking" },
              { label: t.myBooking, href: "/my-booking" },
              { label: t.about, href: "/about" },
              { label: t.contact, href: "/contact" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="
                  block px-4 py-2 text-text-light 
                  hover:text-blue-600 hover:bg-blue-50/40 transition
                "
              >
                {item.label}
              </Link>
            ))}

            {!isLoggedIn ? (
              <div className="px-4 mt-2">
                <Link href="/login" className="block py-2 text-blue-600 hover:underline">
                  {t.login}
                </Link>
                <Link href="/signup" className="block py-2 text-blue-600 hover:underline">
                  {t.signup}
                </Link>
              </div>
            ) : (
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-100/40 rounded-lg mt-2"
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
