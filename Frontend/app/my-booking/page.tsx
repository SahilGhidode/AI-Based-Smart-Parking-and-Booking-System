"use client"

import { useLanguage } from "@/app/context/LanguageContext"
import { useAuth } from "@/app/context/AuthContext"
import { translations } from "@/lib/translations"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import { useRouter } from "next/navigation"

export default function MyBooking() {
  const { language } = useLanguage()
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const t = translations[language]

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-text mb-4">{t.myBookings}</h1>
          <p className="text-xl text-text-light mb-8">Please log in to view your bookings.</p>
          <button
            onClick={() => router.push("/login")}
            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
          >
            {t.login}
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  const bookings = [
    {
      id: 1,
      location: "City Center Parking",
      spotNo: 5,
      date: "2024-11-15",
      time: "10:00 AM",
      duration: 2,
      status: "upcoming",
      price: "$12.00",
    },
    {
      id: 2,
      location: "Mall Parking",
      spotNo: 12,
      date: "2024-11-10",
      time: "2:00 PM",
      duration: 3,
      status: "past",
      price: "$18.00",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-text mb-12 text-center">{t.myBookings}</h1>

          <div className="space-y-6">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-6 bg-surface border border-border rounded-xl hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-text">{booking.location}</h3>
                      <p className="text-text-light">Spot #{booking.spotNo}</p>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        booking.status === "upcoming" ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                      }`}
                    >
                      {booking.status === "upcoming" ? "Upcoming" : "Completed"}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-text-light">Date</p>
                      <p className="font-semibold text-text">{booking.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-light">Time</p>
                      <p className="font-semibold text-text">{booking.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-light">Duration</p>
                      <p className="font-semibold text-text">{booking.duration} hours</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-light">Price</p>
                      <p className="font-semibold text-primary">{booking.price}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition">
                      {t.viewDetails}
                    </button>
                    {booking.status === "upcoming" && (
                      <button className="px-4 py-2 border border-danger text-danger rounded-lg font-semibold hover:bg-danger/10 transition">
                        {t.cancel}
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 bg-surface rounded-xl border border-border text-center">
                <p className="text-lg text-text-light">{t.noBookings}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
