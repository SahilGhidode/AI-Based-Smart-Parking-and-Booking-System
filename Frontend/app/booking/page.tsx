"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import { useAuth } from "@/app/context/AuthContext";
import { translations } from "@/lib/translations";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

// ✅ Dynamically import the MapPage (no SSR)
const MapPage = dynamic(() => import("../map/page"), { ssr: false });

export default function Booking() {
  const { language } = useLanguage();
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const t = translations[language];

  const [formData, setFormData] = useState({
    location: "",
    date: "",
    time: "",
    duration: "1",
  });

  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);
  const [charges, setCharges] = useState<number | null>(null);

  // ✅ If user is not logged in, show message + redirect button
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-text mb-4">
            {t.booking}
          </h1>
          <p className="text-xl text-text-light mb-8">
            Please log in to book a parking slot.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
          >
            {t.login}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching Parking:", formData);
  };

  const parkingSpots = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    available: Math.random() > 0.4,
  }));

  const handleSelectSpot = (spotId: number) => {
    setSelectedSpot(spotId);
    const duration = parseInt(formData.duration) || 1;
    const calculatedCharges = duration * 50; // ₹50/hour (example)
    setCharges(calculatedCharges);
  };

  const handleProceedToPayment = () => {
    router.push(
      `/payment?spot=${selectedSpot}&amount=${charges}&duration=${formData.duration}`
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-text mb-12 text-center">
            {t.booking}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-1">
              <div className="p-8 bg-surface rounded-xl border border-border">
                <h2 className="text-2xl font-bold text-text mb-6">
                  Search Parking
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      {t.selectLocation}
                    </label>
                    <input
                      type="text"
                      placeholder="City Center"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      {t.selectDate}
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      {t.selectTime}
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      {t.duration}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
                  >
                    {t.searchParking}
                  </button>
                </form>
              </div>
            </div>

            {/* Map + Parking Spots */}
            <div className="lg:col-span-2">
              <div className="p-8 bg-surface rounded-xl border border-border">
                <h2 className="text-2xl font-bold text-text mb-4">Map View</h2>
                <div className="rounded-lg overflow-hidden border border-border mb-8">
                  <MapPage />
                </div>

                <h2 className="text-2xl font-bold text-text mb-6">
                  {t.availableSpots}
                </h2>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {parkingSpots.map((spot) => (
                    <button
                      key={spot.id}
                      onClick={() =>
                        spot.available && handleSelectSpot(spot.id)
                      }
                      disabled={!spot.available}
                      className={`aspect-square flex items-center justify-center rounded-lg font-bold text-lg transition ${
                        spot.available
                          ? selectedSpot === spot.id
                            ? "bg-primary text-white"
                            : "bg-success/20 text-success hover:bg-success/30"
                          : "bg-danger/20 text-danger cursor-not-allowed"
                      }`}
                    >
                      {spot.id}
                    </button>
                  ))}
                </div>

                {selectedSpot && (
                  <div className="mt-8 p-4 bg-primary/10 border border-primary rounded-lg">
                    <p className="text-text mb-2">
                      Selected Spot:{" "}
                      <span className="font-bold text-primary">
                        #{selectedSpot}
                      </span>
                    </p>
                    <p className="text-text mb-4">
                      Duration: {formData.duration} hr(s)
                    </p>
                    <p className="text-text mb-4">
                      Estimated Charges:{" "}
                      <span className="font-bold text-primary">
                        ₹{charges}
                      </span>
                    </p>

                    <button
                      onClick={handleProceedToPayment}
                      className="w-full px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
