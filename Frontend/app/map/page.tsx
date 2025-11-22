"use client";

import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { useState, useEffect, useCallback } from "react";
import { getSocket } from "@/lib/parking/getParkingData";

const containerStyle = {
  width: "100%",
  height: "500px",
};

// Default Bhopal Center
const defaultCenter = { lat: 23.2494, lng: 77.4958 };

export default function MapPage() {
  const [isClient, setIsClient] = useState(false);

  const [map, setMap] = useState<any>(null);
  const [center, setCenter] = useState(defaultCenter);

  const [parkingSpaces, setParkingSpaces] = useState<any[]>([]);
  const [selectedParking, setSelectedParking] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    fetchParkingSpaces();
    setupRealtimeUpdates();
  }, []);

  // ⭐ Load parkings from backend
  const fetchParkingSpaces = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/parking-spaces`);
      const data = await res.json();
      setParkingSpaces(data);
    } catch (err) {
      console.error("Failed to fetch parking spaces:", err);
    }
  };

  // ⭐ Real-time updates via socket.io
  const setupRealtimeUpdates = () => {
    const socket = getSocket();

    socket.on("parking:update", (updatedParking: any) => {
      setParkingSpaces((prev) =>
        prev.map((p) => (p.space_id === updatedParking.space_id ? updatedParking : p))
      );
    });
  };

  // Google Map Load Status
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const onLoad = useCallback((mapInstance: any) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!isClient) return null;
  if (loadError) return <div>Error loading map...</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="flex flex-col items-center bg-gray-50 py-10 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Smart Parking Map
      </h1>

      <div className="w-[90%] max-w-4xl h-[500px] rounded-lg border shadow-lg overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {/* ⭐ Directly show all parkings */}
          {parkingSpaces.map((p) => (
            <Marker
              key={p.space_id}
             position={{ lat: Number(p.latitude), lng: Number(p.longitude) }}

              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              }}
              onClick={() => {
                setSelectedParking(p);
                map?.panTo({ lat: p.latitude, lng: p.longitude });
              }}
            />
          ))}

          {/* ⭐ When user clicks a parking */}
          {selectedParking && (
            <InfoWindow
              position={{
                lat: selectedParking.latitude,
                lng: selectedParking.longitude,
              }}
              onCloseClick={() => setSelectedParking(null)}
            >
              <div className="p-2">
                <h2 className="font-bold text-lg">{selectedParking.name}</h2>
                <p className="text-sm">{selectedParking.address}</p>

                <p className="mt-2">
                  Total Floors:{" "}
                  <strong>{selectedParking.number_of_floors}</strong>
                </p>

                <button
                  className="mt-3 bg-blue-600 text-white px-4 py-1 rounded"
                  onClick={() =>
                    (window.location.href = `/booking?space=${selectedParking.space_id}`)
                  }
                >
                  View Slots
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
