"use client"

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "./context/LanguageContext"
import { useAuth } from "./context/AuthContext"
import { translations } from "@/lib/translations"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

export default function Home() {
  const { language } = useLanguage()
  const { isLoggedIn } = useAuth()
  const t = translations[language]

  const features = [
    {
      icon: "⚡",
      titleKey: "lightningFast",
      descKey: "bookingTime",
    },
    {
      icon: "📍",
      titleKey: "realTimeUpdates",
      descKey: "liveAvailability",
    },
    {
      icon: "🗺️",
      titleKey: "smartNavigation",
      descKey: "googleMaps",
    },
    {
      icon: "💳",
      titleKey: "easyPayments",
      descKey: "paymentOptions",
    },
    {
      icon: "🔒",
      titleKey: "secureSafe",
      descKey: "dataEncrypted",
    },
    {
      icon: "📱",
      titleKey: "mobileFirst",
      descKey: "responsiveApp",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-surface to-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left side text */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-text mb-6 leading-tight">
              {t.findParkingTitle}
            </h1>
            <p className="text-xl text-text-light mb-8 leading-relaxed">
              {t.findParkingDesc}
            </p>
            <div className="flex gap-4">
              <Link
                href={isLoggedIn ? "/booking" : "/login"}
                className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
              >
                {t.getStarted}
              </Link>
              <Link
                href="/features"
                className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-surface transition"
              >
                {t.learnMore}
              </Link>
            </div>
          </div>

          {/* Right side image */}
          <div className="relative h-96">
            <Image
              src="/assets/image.png"
              alt="Smart Parking Preview"
              fill
              className="object-cover rounded-2xl shadow-lg"
              priority
            />
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-text mb-12 text-center">
            Why Choose SmartPark?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 border border-border rounded-xl hover:shadow-lg transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-text mb-2">
                  {t[feature.titleKey as keyof typeof t]}
                </h3>
                <p className="text-text-light">
                  {t[feature.descKey as keyof typeof t]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
