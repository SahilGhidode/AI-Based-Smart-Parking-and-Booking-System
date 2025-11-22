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
  const [otpLoading, setOtpLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleGoogleLogin = () => {
    console.log("🔥 GOOGLE LOGIN CLICKED");
    localStorage.removeItem("token");

    const url = "http://localhost:5000/api/auth/google";
    console.log("🌐 Opening:", url);

    window.open(url, "_self");
  };

  // ------------------------- SEND OTP -------------------------
  const sendOtp = async () => {
    if (!formData.email) {
      alert("Please enter email first.");
      return;
    }

    setOtpLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/verify/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        }
      );

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

    setOtpLoading(false);
  };

  // ------------------------- VERIFY OTP -------------------------
  const verifyOtp = async () => {
    if (!formData.email || !formData.otp) {
      alert("Please enter OTP and Email.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/verify/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, otp: formData.otp }),
        }
      );

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

  // ------------------------- SUBMIT -------------------------
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("✅ Registration successful!");
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md p-8 bg-background rounded-2xl shadow-lg border border-border">
        
        <h1 className="text-3xl font-bold text-text mb-2 text-center">
          {t.signup}
        </h1>
        <p className="text-text-light text-center mb-8">{t.createAccount}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* NAME */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              {t.name}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          {/* EMAIL + SEND OTP */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              {t.email}
            </label>

            <div className="flex space-x-2">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                placeholder="your@email.com"
              />

              {/* OTP BUTTON UPDATED */}
              <button
                type="button"
                onClick={sendOtp}
                disabled={otpLoading || otpSent}
                className="px-3 py-2 bg-primary text-white rounded-lg text-sm disabled:opacity-50"
              >
                {otpLoading
                  ? "Sending..."
                  : otpSent
                  ? "Sent OTP"
                  : "Send OTP"}
              </button>
            </div>
          </div>

          {/* OTP FIELD */}
          {otpSent && !otpVerified && (
            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Enter OTP
              </label>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) =>
                    setFormData({ ...formData, otp: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Enter OTP"
                />

                <button
                  type="button"
                  onClick={verifyOtp}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
                >
                  {otpVerified ? "Verified" : "Verify"}
                </button>
              </div>
            </div>
          )}

          {/* MOBILE */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              {t.mobile}
            </label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) =>
                setFormData({ ...formData, mobile: e.target.value })
              }
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              {t.password}
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                errors.password ? "border-danger" : "border-border focus:border-primary"
              }`}
            />

            {errors.password && (
              <p className="text-danger text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              {t.confirmPassword}
            </label>

            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                errors.confirmPassword
                  ? "border-danger"
                  : "border-border focus:border-primary"
              }`}
            />

            {errors.confirmPassword && (
              <p className="text-danger text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading || !otpVerified}
            className="w-full px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50 mt-6"
          >
            {loading ? "Creating Account..." : t.createAccount}
          </button>

        </form>

        {/* GOOGLE LOGIN */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex justify-center items-center gap-3 px-4 py-3 border rounded-lg mt-4"
        >
          <img src="/google.svg" className="w-5 h-5" />
          Continue with Google
        </button>

        {/* LOGIN LINK */}
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
