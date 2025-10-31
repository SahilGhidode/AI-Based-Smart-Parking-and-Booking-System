"use client"

import { useLanguage } from "@/app/context/LanguageContext"
import { translations } from "@/lib/translations"

export default function Footer() {
  const { language } = useLanguage()
  const t = translations[language]
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-surface border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="font-bold text-lg text-text">SmartPark</span>
            </div>
            <p className="text-text-light text-sm">{t.findParkingDesc}</p>
          </div>
          <div>
            <h3 className="font-semibold text-text mb-4">{t.features}</h3>
            <ul className="space-y-2 text-text-light text-sm">
              <li>
                <a href="#" className="hover:text-primary">
                  {t.lightningFast}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  {t.realTimeUpdates}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  {t.easyPayments}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-text mb-4">{t.contactUs}</h3>
            <ul className="space-y-2 text-text-light text-sm">
              <li>{t.phone}: +1 (555) 123-4567</li>
              <li>{t.email}: support@smartpark.com</li>
              <li>{t.address}: 123 City Center, Urban Park, UP 123456</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8 text-center text-text-light text-sm">
          <p>&copy; {currentYear} SmartPark. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
