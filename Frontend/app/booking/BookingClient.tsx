"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import { useAuth } from "@/app/context/AuthContext";
import { translations } from "@/lib/translations";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import nextDynamic from "next/dynamic";
import { fetchSlots, subscribeSlotUpdates } from "@/lib/parking/getSlots";

const MapPage = nextDynamic(() => import("../map/page"), { ssr: false });

export default function BookingClient() {
  const { language } = useLanguage();
  const { isLoggedIn } = useAuth();
  const t = translations[language];
  const router = useRouter();
  const params = useSearchParams();

  const parkingSpaceId = Number(params.get("space")) || 1;

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedFloor, setSelectedFloor] = useState<number>(32);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);
  const [charges, setCharges] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    duration: "1",
  });

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

  useEffect(() => {
    if (!selectedFloor) return;

    async function loadFloorSlots() {
      const data = await fetchSlots(selectedFloor);
      setSlots(Array.isArray(data) ? data : []);
    }

    loadFloorSlots();

    const unsub = subscribeSlotUpdates(selectedFloor, (updatedSlot) => {
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === updatedSlot.id ? updatedSlot : slot
        )
      );
    });

    return () => unsub();
  }, [selectedFloor]);

  const handleSelectSpot = (slotId: number) => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot || slot.status !== "empty") return;

    setSelectedSpot(slotId);
    const duration = parseInt(formData.duration);
    setCharges(duration * 50);
  };

  const handleProceedToPayment = () => {
    if (!selectedSpot || !selectedVehicle) return;

    router.push(
      `/payment?spot=${selectedSpot}&amount=${charges}&duration=${formData.duration}&vehicle=${selectedVehicle}`
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-3 bg-primary text-white rounded-lg"
        >
          Login to Continue
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          {t.booking}
        </h1>

        <MapPage />

        <button
          onClick={handleProceedToPayment}
          className="mt-6 px-6 py-3 bg-primary text-white rounded-lg"
        >
          Proceed to Payment
        </button>
      </div>

      <Footer />
    </div>
  );
}
