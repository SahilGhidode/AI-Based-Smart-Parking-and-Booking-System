"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";

export default function Signup() {

  

  const { language } = useLanguage();
  const router = useRouter();
  const t = translations[language];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("✅ API URL Loaded:", process.env.NEXT_PUBLIC_API_URL);

  console.log("✅ Signup component loaded");
    console.log("Submitting signup request to backend...", formData);

    setErrors({});
    setLoading(true);

    const newErrors: Record<string, string> = {};

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      alert("✅ Registration successful!");
      router.push("/login");
    } catch (error) {
      console.error("❌ Signup failed:", error);
      alert("Failed to connect to backend. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md p-8 bg-background rounded-2xl shadow-lg border border-border">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-text mb-2 text-center">{t.signup}</h1>
        <p className="text-text-light text-center mb-8">{t.createAccount}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text mb-2">{t.name}</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary transition"
              placeholder=""
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-2">{t.email}</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary transition"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-2">{t.mobile}</label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary transition"
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-2">{t.password}</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition ${
                errors.password ? "border-danger focus:border-danger" : "border-border focus:border-primary"
              }`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-danger text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-2">{t.confirmPassword}</label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition ${
                errors.confirmPassword ? "border-danger focus:border-danger" : "border-border focus:border-primary"
              }`}
              placeholder="hello"
            />
            {errors.confirmPassword && (
              <p className="text-danger text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition mt-6 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : t.createAccount}
          </button>
        </form>

        <div className="my-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-text-light">OR</span>
          </div>
        </div>

        <p className="text-center text-text-light">
          {t.alreadyHaveAccount}{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            {t.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
