"use client"

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "./context/LanguageContext"
import { useAuth } from "./context/AuthContext"
import { translations } from "@/lib/translations"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import { ScrollAnimations } from "@/components/ScrollAnimations"
import { AnimatedCardsGrid } from "@/components/AnimatedCards"

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
    <div className="min-h-screen bg-background dark:bg-slate-950 transition-colors duration-500">
      <ScrollAnimations />
      <Navigation />

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-surface to-background dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left side text */}
          <div data-animate="slide-left">
            <h1 className="text-4xl md:text-5xl font-bold text-text dark:text-slate-50 mb-6 leading-tight">
              {t.findParkingTitle}
            </h1>
            <p className="text-xl text-text-light dark:text-slate-300 mb-8 leading-relaxed">
              {t.findParkingDesc}
            </p>
            <div className="flex gap-4">
              <Link
                href={isLoggedIn ? "/booking" : "/login"}
                className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition transform hover:scale-105 shadow-lg"
              >
                {t.getStarted}
              </Link>
              <Link
                href="/features"
                className="px-8 py-3 border-2 border-primary text-primary dark:text-blue-400 dark:border-blue-400 rounded-lg font-semibold hover:bg-surface dark:hover:bg-blue-500/10 transition transform hover:scale-105"
              >
                {t.learnMore}
              </Link>
            </div>
          </div>

          {/* Right side image */}
          <div className="relative h-96" data-animate="slide-right">
            <Image
              src="/assets/image.png"
              alt="Smart Parking Preview"
              fill
              className="object-cover rounded-2xl shadow-lg dark:shadow-blue-500/20"
              priority
            />
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-text dark:text-slate-50 mb-12 text-center" data-animate="fade-in">
            Why Choose SmartPark?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                data-animate="slide-up"
                className="p-6 border border-border dark:border-slate-700 rounded-xl hover:shadow-lg dark:hover:shadow-blue-500/20 transition transform hover:scale-105 duration-300 bg-card dark:bg-slate-800/50 group"
              >
                <div className="text-4xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition duration-300">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-text dark:text-slate-100 mb-2">
                  {t[feature.titleKey as keyof typeof t]}
                </h3>
                <p className="text-text-light dark:text-slate-400">
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
