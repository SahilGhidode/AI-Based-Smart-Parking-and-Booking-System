"use client"

import type React from "react"

import { useState } from "react"
import { useLanguage } from "@/app/context/LanguageContext"
import { translations } from "@/lib/translations"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

export default function Contact() {
  const { language } = useLanguage()
  const t = translations[language]

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Contact form submitted:", formData)
    alert("Thank you for your message! We will get back to you soon.")
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-text mb-12 text-center">{t.contactUs}</h1>

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

          <div className="p-8 bg-surface rounded-xl border border-border">
            <h2 className="text-2xl font-bold text-text mb-6">{t.sendMessage}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">{t.name}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">{t.email}</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Subject"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">{t.message}</label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
