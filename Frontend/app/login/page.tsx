"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { useAuth } from "@/app/context/AuthContext";
import { translations } from "@/lib/translations";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";


interface DecodedToken {
  id: string;
  email: string;
  exp: number;
}

export default function Login() {
  const { language } = useLanguage();
  const { login, isLoggedIn } = useAuth();
  const router = useRouter();
  const t = translations[language];

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ⬇️ GOOGLE LOGIN
  const handleGoogleLogin = () => {
    console.log("🔥 GOOGLE LOGIN CLICKED");
    localStorage.removeItem("token");

    const url = "http://localhost:5000/api/auth/google"; // ⚠️ Backend Port
    console.log("🌐 Redirecting:", url);

    window.open(url, "_self"); // Force external redirect
  };

  // 🟢 Auto redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  // 🟢 Normal Email/Password Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save JWT
      localStorage.setItem("token", data.token);

      // Decode token
      const decoded: DecodedToken = jwtDecode(data.token);

      login({
        id: decoded.id,
        name: decoded.email.split("@")[0],
        email: decoded.email,
        mobile: "",
      });

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-background flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 bg-background rounded-2xl shadow-lg border border-border">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-text mb-2 text-center">{t.login}</h1>
        <p className="text-text-light text-center mb-8">{t.welcome} to SmartPark</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              {t.email}
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary transition"
              placeholder="your@email.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              {t.password}
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary transition"
              placeholder="••••••••"
            />
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) =>
                  setFormData({ ...formData, rememberMe: e.target.checked })
                }
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm text-text-light">{t.rememberMe}</span>
            </label>
            <a href="#" className="text-sm text-primary hover:underline">
              {t.forgotPassword}
            </a>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition mt-6 ${
              loading
                ? "bg-primary/70 cursor-not-allowed"
                : "bg-primary hover:bg-primary-dark"
            }`}
          >
            {loading ? "Signing in..." : t.signIn}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-text-light">OR</span>
          </div>
        </div>

        {/* GOOGLE LOGIN BUTTON */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex justify-center items-center gap-3 px-4 py-3 border rounded-lg"
        >
          <img src="/google.svg" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="text-center text-text-light mt-6">
          {t.dontHaveAccount}{" "}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            {t.signup}
          </Link>
        </p>
      </div>
    </div>
  );
}
