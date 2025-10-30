"use client"

/**
 * Dashboard Component
 * Main user dashboard for booking parking slots
 * Features: Location tracking, parking slot search, booking, and map visualization
 */

import { useState, useEffect } from "react"
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api"

const Dashboard = ({ user, onLogout }) => {
  // State management for location and parking data
  const [currentLocation, setCurrentLocation] = useState({ lat: 28.6139, lng: 77.209 })
  const [destination, setDestination] = useState("")
  const [duration, setDuration] = useState(1)
  const [showMap, setShowMap] = useState(false)
  const [parkingSlots, setParkingSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)

  /**
   * Dummy parking slot data
   * TODO: Replace with actual backend API call
   */
  const dummySlots = [
    { id: 1, lat: 28.6135, lng: 77.208, status: "available" },
    { id: 2, lat: 28.6145, lng: 77.21, status: "occupied" },
    { id: 3, lat: 28.615, lng: 77.211, status: "available" },
  ]

  /**
   * Get user's live location on component mount
   * Falls back to default location if geolocation is unavailable
   */
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        },
        () => {
          alert("Unable to access your location. Using default location.")
        },
      )
    }
  }, [])

  /**
   * Handle form submission
   * Loads parking slots and displays map
   */
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate destination input
    if (!destination.trim()) {
      alert("Please enter a destination")
      return
    }

    // Load parking slots and show map
    setParkingSlots(dummySlots)
    setShowMap(true)
  }

  /**
   * Handle parking slot booking
   * Updates slot status and shows confirmation
   */
  const handleBooking = (slotId) => {
    alert(`You booked slot ${slotId}!`)

    // Update slot status to occupied
    setParkingSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, status: "occupied" } : s)))

    // Close info window
    setSelectedSlot(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Welcome Header */}
      <h1 className="text-4xl font-bold text-purple-600 mb-4">
        Welcome, {user?.name || user?.email || user?.phone || "User"}!
      </h1>

      {/* Logout Button */}
      <button
        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition mb-6"
        onClick={onLogout}
      >
        Logout
      </button>

      {/* Booking Form Section */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Book a Nearby Parking Slot</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Current Location (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Location</label>
            <input
              type="text"
              placeholder="Current Location"
              value={`${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`}
              disabled
              className="w-full p-3 border rounded bg-gray-100 text-gray-600"
              aria-label="Current Location"
            />
          </div>

          {/* Destination Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination Location</label>
            <input
              type="text"
              placeholder="Destination Location"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Destination Location"
            />
          </div>

          {/* Duration Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
            <input
              type="number"
              placeholder="Duration (hours)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min={1}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Duration in hours"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            Show Nearby Parkings
          </button>
        </form>
      </div>

      {/* Map Section */}
      {showMap && (
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "500px", borderRadius: "12px" }}
            center={currentLocation}
            zoom={15}
          >
            {/* Current Location Marker */}
            <Marker
              position={currentLocation}
              label="You"
              icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
              title="Your current location"
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
                title={`Slot ${slot.id} - ${slot.status}`}
              />
            ))}

            {/* Info Window for Selected Slot */}
            {selectedSlot && (
              <InfoWindow
                position={{ lat: selectedSlot.lat, lng: selectedSlot.lng }}
                onCloseClick={() => setSelectedSlot(null)}
              >
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900">Slot #{selectedSlot.id}</h3>
                  <p className="text-gray-700">
                    Status:{" "}
                    <span className={selectedSlot.status === "available" ? "text-green-600" : "text-red-600"}>
                      {selectedSlot.status}
                    </span>
                  </p>
                  {selectedSlot.status === "available" ? (
                    <button
                      onClick={() => handleBooking(selectedSlot.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded mt-2 hover:bg-green-600 transition font-semibold"
                    >
                      Book Now
                    </button>
                  ) : (
                    <p className="text-red-500 mt-2 font-semibold">Already Occupied</p>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      )}
    </div>
  )
}

export default Dashboard
