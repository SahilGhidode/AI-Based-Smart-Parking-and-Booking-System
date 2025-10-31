"use client"

import { useLanguage } from "@/app/context/LanguageContext"
import { translations } from "@/lib/translations"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

export default function About() {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-text mb-8 text-center">{t.aboutTitle}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <p className="text-xl text-text-light leading-relaxed mb-6">{t.aboutDesc}</p>
              <p className="text-lg text-text-light leading-relaxed mb-6">
                Our platform leverages cutting-edge technology to provide real-time parking availability across major
                cities. With a user-friendly interface and seamless booking experience, we've helped thousands of
                drivers save time and reduce stress.
              </p>
            </div>
            <div className="h-96 bg-gradient-to-br from-primary to-accent rounded-2xl opacity-20"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-surface rounded-xl border border-border">
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <p className="text-text-light">Active Users</p>
            </div>
            <div className="p-8 bg-surface rounded-xl border border-border">
              <div className="text-4xl font-bold text-primary mb-2">200+</div>
              <p className="text-text-light">Parking Locations</p>
            </div>
            <div className="p-8 bg-surface rounded-xl border border-border">
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <p className="text-text-light">Uptime Guarantee</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
