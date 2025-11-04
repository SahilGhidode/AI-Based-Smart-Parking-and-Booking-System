"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/app/context/LanguageContext"
import { translations } from "@/lib/translations"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

// ✅ Helper function to decode JWT
function decodeToken(token: string) {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export default function Contact() {
  const { language } = useLanguage()
  const t = translations[language]

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const [status, setStatus] = useState<string>("")

  // ✅ Auto-fill email from JWT token in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token") // <-- token saved on login
    if (token) {
      const decoded = decodeToken(token)
      if (decoded?.email) {
        setFormData((prev) => ({ ...prev, email: decoded.email }))
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("Sending...")

    try {
      const res = await fetch("http://localhost:5000/api/send-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setStatus("✅ Message sent successfully! We'll get back to you soon.")
        setFormData({ name: "", email: formData.email, subject: "", message: "" })
      } else {
        setStatus("❌ Failed to send message. Please try again.")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setStatus("⚠️ Network error. Try again later.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-text mb-12 text-center">
            {t.contactUs}
          </h1>

          {/* Contact info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="p-6 bg-surface rounded-xl border border-border text-center">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="font-semibold text-text mb-2">{t.phone}</h3>
              <p className="text-text-light">+1 (555) 123-4567</p>
            </div>
            <div className="p-6 bg-surface rounded-xl border border-border text-center">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="font-semibold text-text mb-2">{t.email}</h3>
              <p className="text-text-light">support@smartpark.com</p>
            </div>
            <div className="p-6 bg-surface rounded-xl border border-border text-center">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="font-semibold text-text mb-2">{t.address}</h3>
              <p className="text-text-light">123 City Center, Urban Park</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 bg-surface rounded-xl border border-border">
            <h2 className="text-2xl font-bold text-text mb-6">
              {t.sendMessage}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  {t.email}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled // ✅ user email is auto-filled and locked
                  className="w-full px-4 py-2 border border-border rounded-lg bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Subject"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  {t.message}
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Your message..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
              >
                {t.send}
              </button>
            </form>

            {status && (
              <p className="mt-4 text-center text-sm text-text-light">{status}</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
