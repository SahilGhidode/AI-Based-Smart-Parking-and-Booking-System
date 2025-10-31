"use client";

import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { useState, useCallback, useEffect } from "react";

// Google Map container style
const containerStyle = {
  width: "100%",
  height: "500px",
};

// Default center (New Delhi)
const center = { lat: 28.6139, lng: 77.2090 };

export default function MapPage() {
  // Prevent SSR hydration errors by ensuring it runs only on the client
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!isClient) return null; // ✅ Fix hydration mismatch
  if (loadError) return <div className="text-red-600">Error loading map: {loadError.message}</div>;
  if (!isLoaded) return <div className="text-gray-600">Loading Google Map...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Google Map View</h1>

      <div className="w-[90%] max-w-4xl h-[500px] rounded-lg overflow-hidden border border-gray-300 shadow-md">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {/* Add markers or custom overlays here */}
          <Marker position={center} />
        </GoogleMap>
      </div>
    </div>
  );
}
