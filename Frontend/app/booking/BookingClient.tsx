"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from "@/app/context/LanguageContext";
import { useAuth } from "@/app/context/AuthContext";
import { translations } from "@/lib/translations";

// Components
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

// Real slot APIs
import { fetchSlots, subscribeSlotUpdates } from "@/lib/parking/getSlots";

const MapPage = dynamic(() => import("../map/page"), { ssr: false });

export default function Booking() {
  const { language } = useLanguage();
  const { isLoggedIn } = useAuth();
  const t = translations[language];
  const router = useRouter();
  const params = useSearchParams();

  // Parking Space ID from URL (/booking?space=3)
  const parkingSpaceId = Number(params.get("space")) || 1;

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");

  // Floor dropdown (user can select)
  const [selectedFloor, setSelectedFloor] = useState<number>(32);

  // Real slots from backend
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);

  const [charges, setCharges] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    duration: "1",
  });

  // ⭐ Fetch user's registered vehicles
  const fetchVehicles = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/vehicles`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      setVehicles([]);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchVehicles();
  }, [isLoggedIn]);

  // ⭐ Load floor slots + Live updates
  useEffect(() => {
    if (!selectedFloor) return;

    async function loadFloorSlots() {
      const data = await fetchSlots(selectedFloor);
      setSlots(Array.isArray(data) ? data : []);
    }

    loadFloorSlots();

    // Real-time updates
    const unsub = subscribeSlotUpdates(selectedFloor, (updatedSlot) => {
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === updatedSlot.id ? updatedSlot : slot
        )
      );
    });

    return () => unsub();
  }, [selectedFloor]);

  // ⭐ When user selects a slot
  const handleSelectSpot = (slotId: number) => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot || slot.status !== "empty") return;

    setSelectedSpot(slotId);

    // Charges = duration × 50
    const duration = parseInt(formData.duration);
    setCharges(duration * 50);

    // No vehicle? Send to Add Vehicle
    if (vehicles.length === 0) {
      // We'll show a toast or modal instead of alert in a real app, but keeping alert for now
      // alert("No vehicles found. Please add one to continue.");
      // router.push("/AddVehicle");
      // return;
    }
  };

  // ⭐ Proceed to Payment
  const handleProceedToPayment = () => {
    if (!selectedSpot) {
      alert("Please select a parking spot.");
      return;
    }
    if (!selectedVehicle) {
      alert("Please select a vehicle.");
      return;
    }

    router.push(
      `/payment?spot=${selectedSpot}&amount=${charges}&duration=${formData.duration}&vehicle=${selectedVehicle}`
    );
  };

  // ⭐ If not logged in → ask to login
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Please Login to Continue</h1>
            <p className="text-slate-500 mb-8">You need to be signed in to book a parking spot.</p>
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg"
            >
              Login Now
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // --------------------------------------------
  // ⭐ MAIN UI START
  // --------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{t.booking}</h1>
          <p className="text-slate-500">Select your preferred spot and time.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: Booking Form */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-primary rounded-lg flex items-center justify-center text-sm">1</span>
                Booking Details
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Date</label>
                  <input
                    type="date"
                    className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Time</label>
                  <input
                    type="time"
                    className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Duration (hours)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Select Floor</label>
                  <select
                    value={selectedFloor}
                    onChange={(e) => setSelectedFloor(Number(e.target.value))}
                    className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-white"
                  >
                    <option value="32">Floor 0 (Ground)</option>
                    <option value="33">Floor 1</option>
                    <option value="34">Floor 2</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vehicle Selection Card */}
            <div className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-primary rounded-lg flex items-center justify-center text-sm">3</span>
                Vehicle & Payment
              </h2>
              
              {selectedSpot ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">Select Vehicle</label>
                    <select
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-white"
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      value={selectedVehicle}
                    >
                      <option value="">Choose vehicle</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.vehicle_number}>
                          {v.vehicle_number} ({v.vehicle_type})
                        </option>
                      ))}
                    </select>
                    {vehicles.length === 0 && (
                       <button 
                         onClick={() => router.push("/AddVehicle")}
                         className="text-sm text-primary font-semibold mt-2 hover:underline"
                       >
                         + Add a new vehicle
                       </button>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-600">Spot Price</span>
                      <span className="font-semibold">$50/hr</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-600">Duration</span>
                      <span className="font-semibold">{formData.duration} hrs</span>
                    </div>
                    <div className="border-t border-slate-200 my-2 pt-2 flex justify-between text-lg font-bold text-slate-900">
                      <span>Total</span>
                      <span>${charges}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToPayment}
                    className="w-full px-4 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Proceed to Payment
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p>Select a spot from the map to continue</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Map + Slots */}
          <div className="lg:col-span-8 space-y-8">
            <div className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm h-full">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-primary rounded-lg flex items-center justify-center text-sm">2</span>
                Select Spot
              </h2>
              
              <div className="rounded-xl overflow-hidden border border-slate-200 mb-8 shadow-inner">
                <MapPage />
              </div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Available Spots</h3>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-slate-600">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <span className="text-slate-600">Occupied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-slate-600">Selected</span>
                  </div>
                </div>
              </div>

              {/* Slots Grid */}
              {slots.length > 0 ? (
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleSelectSpot(slot.id)}
                      disabled={slot.status !== "empty"}
                      className={`
                        aspect-square rounded-xl text-sm font-bold flex items-center justify-center transition-all transform hover:scale-105
                        ${
                          selectedSpot === slot.id 
                            ? "bg-primary text-white shadow-lg ring-2 ring-primary ring-offset-2" 
                            : slot.status === "empty"
                              ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                              : "bg-red-50 text-red-300 cursor-not-allowed border border-red-100"
                        }
                      `}
                    >
                      {slot.spot_number}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-slate-500">Loading slots or no slots available...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
