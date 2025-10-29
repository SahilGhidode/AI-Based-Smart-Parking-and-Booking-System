import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";

const Dashboard = ({ user, onLogout }) => {
  const [currentLocation, setCurrentLocation] = useState({ lat: 28.6139, lng: 77.209 });
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState(1);
  const [showMap, setShowMap] = useState(false);
  const [parkingSlots, setParkingSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Dummy parking slot data — replace later with backend API
  const dummySlots = [
    { id: 1, lat: 28.6135, lng: 77.208, status: "available" },
    { id: 2, lat: 28.6145, lng: 77.210, status: "occupied" },
    { id: 3, lat: 28.615, lng: 77.211, status: "available" },
  ];

  // Get user's live location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          alert("Unable to access your location. Using default location.");
        }
      );
    }
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setParkingSlots(dummySlots);
    setShowMap(true);
  };

  // Handle booking of slot
  const handleBooking = (slotId) => {
    alert(`You booked slot ${slotId}!`);
    setParkingSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, status: "occupied" } : s))
    );
    setSelectedSlot(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-purple-600 mb-4">
        Welcome, {user?.email || user?.phone || "User"}!
      </h1>

      <button
        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition mb-6"
        onClick={onLogout}
      >
        Logout
      </button>

      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Book a Nearby Parking Slot
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Current Location"
            value={`${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`}
            disabled
            className="p-2 border rounded bg-gray-100"
          />
          <input
            type="text"
            placeholder="Destination Location"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Duration (hours)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min={1}
            className="p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Show Nearby Parkings
          </button>
        </form>
      </div>

      {showMap && (
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "500px" }}
            center={currentLocation}
            zoom={15}
          >
            {/* Current Location Marker */}
            <Marker
              position={currentLocation}
              label="You"
              icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
            />

            {/* Parking Slot Markers */}
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

            {/* Info Window when clicking on marker */}
            {selectedSlot && (
              <InfoWindow
                position={{ lat: selectedSlot.lat, lng: selectedSlot.lng }}
                onCloseClick={() => setSelectedSlot(null)}
              >
                <div>
                  <h3 className="font-semibold">Slot #{selectedSlot.id}</h3>
                  <p>Status: {selectedSlot.status}</p>
                  {selectedSlot.status === "available" ? (
                    <button
                      onClick={() => handleBooking(selectedSlot.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded mt-2 hover:bg-green-600"
                    >
                      Book Now
                    </button>
                  ) : (
                    <p className="text-red-500 mt-2">Already Occupied</p>
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
