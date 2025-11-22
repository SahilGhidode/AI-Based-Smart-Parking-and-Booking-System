"use client"

import { useLanguage } from "@/app/context/LanguageContext"
import { useAuth } from "@/app/context/AuthContext"
import { translations } from "@/lib/translations"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import { useRouter } from 'next/navigation'
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCar } from "react-icons/fa"

export default function MyBooking() {
  const { language } = useLanguage()
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const t = translations[language]

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">{t.myBookings}</h1>
            <p className="text-slate-500 mb-8">Please log in to view your bookings.</p>
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg"
            >
              {t.login}
            </button>
          </div>
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
      vehicle: "ABC-123"
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
      vehicle: "XYZ-789"
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">{t.myBookings}</h1>
            <p className="text-slate-500 mt-2">Manage your upcoming and past parking reservations.</p>
          </div>
          <button 
            onClick={() => router.push('/booking')}
            className="hidden md:block px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
          >
            + New Booking
          </button>
        </div>

        <div className="space-y-6">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center text-xl
                      ${booking.status === "upcoming" ? "bg-blue-50 text-primary" : "bg-slate-100 text-slate-500"}
                    `}>
                      <FaCar />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{booking.location}</h3>
                      <p className="text-slate-500 flex items-center gap-2 mt-1">
                        <span className="font-medium text-slate-700">Spot #{booking.spotNo}</span>
                        <span>•</span>
                        <span>{booking.vehicle}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div
                    className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide self-start ${
                      booking.status === "upcoming" 
                        ? "bg-green-100 text-green-700 border border-green-200" 
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {booking.status === "upcoming" ? "Upcoming" : "Completed"}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                    <p className="font-semibold text-slate-900 flex items-center gap-2">
                      <FaCalendarAlt className="text-slate-400" /> {booking.date}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                    <p className="font-semibold text-slate-900 flex items-center gap-2">
                      <FaClock className="text-slate-400" /> {booking.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Duration</p>
                    <p className="font-semibold text-slate-900">{booking.duration} hours</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Price</p>
                    <p className="font-bold text-primary text-lg">{booking.price}</p>
                  </div>
                </div>

                <div className="flex gap-4 mt-6 justify-end">
                  <button className="px-6 py-2.5 text-slate-600 font-semibold hover:text-primary hover:bg-blue-50 rounded-lg transition-colors">
                    {t.viewDetails}
                  </button>
                  {booking.status === "upcoming" && (
                    <button className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg font-semibold hover:bg-red-100 transition-colors">
                      {t.cancel}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 bg-white rounded-2xl border border-dashed border-slate-300 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 text-3xl">
                <FaCar />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t.noBookings}</h3>
              <p className="text-slate-500 mb-8">You haven't made any parking reservations yet.</p>
              <button 
                onClick={() => router.push('/booking')}
                className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg"
              >
                Book a Spot Now
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
