// src/pages/Dashboard.js
"use client";
import { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";

const Dashboard = ({ user, onLogout }) => {
  const [currentLocation, setCurrentLocation] = useState({ lat: 28.6139, lng: 77.209 });
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState(1);
  const [showMap, setShowMap] = useState(false);
  const [parkingSlots, setParkingSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const dummySlots = [
    { id: 1, lat: 28.6135, lng: 77.208, status: "available" },
    { id: 2, lat: 28.6145, lng: 77.21, status: "occupied" },
    { id: 3, lat: 28.615, lng: 77.211, status: "available" },
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => alert("Unable to access location.")
      );
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!destination.trim()) return alert("Please enter a destination");
    setParkingSlots(dummySlots);
    setShowMap(true);
  };

  const handleBooking = (slotId) => {
    alert(`You booked slot ${slotId}!`);
    setParkingSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, status: "occupied" } : s))
    );
    setSelectedSlot(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-purple-600 mb-4">
        Welcome, {user?.email || "User"}!
      </h1>

      <button
        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition mb-6"
        onClick={onLogout}
      >
        Logout
      </button>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-2xl mb-4">Book a Parking Slot</h2>
        <input
          type="text"
          placeholder="Destination Location"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="border p-2 rounded w-full mb-3"
        />
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="border p-2 rounded w-full mb-3"
          min={1}
        />
        <button className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition">
          Show Nearby Parkings
        </button>
      </form>

      {showMap && (
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "500px" }}
            center={currentLocation}
            zoom={15}
          >
            <Marker position={currentLocation} label="You" />
            {parkingSlots.map((slot) => (
              <Marker
                key={slot.id}
                position={{ lat: slot.lat, lng: slot.lng }}
                label={slot.id.toString()}
                icon={{
                  url:
                    slot.status === "available"
                      ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                      : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                }}
                onClick={() => setSelectedSlot(slot)}
              />
            ))}

            {selectedSlot && (
              <InfoWindow
                position={{ lat: selectedSlot.lat, lng: selectedSlot.lng }}
                onCloseClick={() => setSelectedSlot(null)}
              >
                <div>
                  <h3>Slot #{selectedSlot.id}</h3>
                  <p>Status: {selectedSlot.status}</p>
                  {selectedSlot.status === "available" && (
                    <button
                      onClick={() => handleBooking(selectedSlot.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded mt-2"
                    >
                      Book Now
                    </button>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      )}
    </div>
  );
};

export default Dashboard;
