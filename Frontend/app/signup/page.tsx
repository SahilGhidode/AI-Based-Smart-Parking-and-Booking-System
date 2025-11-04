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
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sendOtp = async () => {
    if (!formData.email) {
      alert("Please enter email first.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verify/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("OTP sent successfully to your email!");
        setOtpSent(true);
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while sending OTP.");
    }
  };

  const verifyOtp = async () => {
    if (!formData.email || !formData.otp) {
      alert("Please enter OTP and Email.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verify/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("OTP verified successfully!");
        setOtpVerified(true);
      } else {
        alert(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while verifying OTP.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpVerified) {
      alert("Please verify your OTP before registration.");
      return;
    }

    const newErrors: Record<string, string> = {};
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
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
        return;
      }

      alert("✅ Registration successful!");
      // ✅ Redirect directly to homepage instead of login
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md p-8 bg-background rounded-2xl shadow-lg border border-border">
        <h1 className="text-3xl font-bold text-text mb-2 text-center">{t.signup}</h1>
        <p className="text-text-light text-center mb-8">{t.createAccount}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">{t.name}</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* Email + OTP */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">{t.email}</label>
            <div className="flex space-x-2">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary transition"
                placeholder="your@email.com"
              />
              <button
                type="button"
                onClick={sendOtp}
                disabled={otpSent}
                className="px-3 py-2 bg-primary text-white rounded-lg text-sm disabled:opacity-50"
              >
                {otpSent ? "Sent" : "Send OTP"}
              </button>
            </div>
          </div>

          {/* OTP Field */}
          {otpSent && !otpVerified && (
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Enter OTP</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary transition"
                  placeholder="Enter OTP"
                />
                <button
                  type="button"
                  onClick={verifyOtp}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
                >
                  Verify
                </button>
              </div>
            </div>
          )}

          {/* Mobile */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">{t.mobile}</label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* Password */}
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
            />
            {errors.password && <p className="text-danger text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
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
            />
            {errors.confirmPassword && <p className="text-danger text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !otpVerified}
            className="w-full px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition mt-6 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : t.createAccount}
          </button>
        </form>

        <p className="text-center text-text-light mt-6">
          {t.alreadyHaveAccount}{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            {t.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
