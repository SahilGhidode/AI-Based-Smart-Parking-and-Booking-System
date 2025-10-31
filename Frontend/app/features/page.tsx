"use client"

import { useLanguage } from "@/app/context/LanguageContext"
import { translations } from "@/lib/translations"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

export default function Features() {
  const { language } = useLanguage()
  const t = translations[language]

  const featureDetails = [
    {
      icon: "⚡",
      titleKey: "lightningFast",
      descKey: "bookingTime",
      details:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      icon: "📍",
      titleKey: "realTimeUpdates",
      descKey: "liveAvailability",
      details:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      icon: "🗺️",
      titleKey: "smartNavigation",
      descKey: "googleMaps",
      details:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      icon: "💳",
      titleKey: "easyPayments",
      descKey: "paymentOptions",
      details:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      icon: "🔒",
      titleKey: "secureSafe",
      descKey: "dataEncrypted",
      details:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      icon: "📱",
      titleKey: "mobileFirst",
      descKey: "responsiveApp",
      details:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-text mb-4 text-center">{t.features}</h1>
          <p className="text-xl text-text-light text-center mb-16 max-w-2xl mx-auto">
            Discover all the powerful features that make SmartPark the best parking solution.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featureDetails.map((feature, idx) => (
              <div key={idx} className="p-8 border border-border rounded-xl hover:shadow-lg transition">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h2 className="text-2xl font-bold text-text mb-2">{t[feature.titleKey as keyof typeof t]}</h2>
                <p className="text-lg text-primary font-semibold mb-4">{t[feature.descKey as keyof typeof t]}</p>
                <p className="text-text-light leading-relaxed">{feature.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
