"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";

export default function AddVehiclePage() {
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Vehicle number format: MP04AS2939
  const vehicleRegex = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;

  const handleVehicleNumberChange = (value) => {
    const formatted = value.toUpperCase().replace(/\s/g, "");
    setVehicleNumber(formatted);

    if (formatted && !vehicleRegex.test(formatted)) {
      setError("Invalid format. Example: MP04AS2939");
    } else {
      setError("");
    }
  };

  // Decode userId from JWT stored in localStorage
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const payload = JSON.parse(atob(token.split(".")[1])); // decode token

      return payload.id || payload.userId;
    } catch (error) {
      console.error("Token decode error:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = getUserIdFromToken();

    if (!userId) {
      alert("User not logged in");
      return;
    }

    if (!vehicleType.trim() || !vehicleNumber.trim()) {
      alert("Please fill in all fields");
      return;
    }

    if (!vehicleRegex.test(vehicleNumber)) {
      alert("❌ Please enter a valid vehicle number (e.g., MP04AS2939)");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/vehicles/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          vehicleNumber,
          vehicleType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to add vehicle");
        return;
      }

      alert("✅ Vehicle added successfully!");

      setVehicleType("");
      setVehicleNumber("");
    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <section className="max-w-xl mx-auto p-6 mt-24 sm:mt-32">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Add Your Vehicle
          </h1>
          <p className="text-muted-foreground">
            Enter your vehicle details below
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm"
        >
          {/* Vehicle Type */}
          <div className="space-y-2">
            <label
              htmlFor="vehicleType"
              className="block text-sm font-medium text-foreground"
            >
              Vehicle Type
            </label>
            <select
              id="vehicleType"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Vehicle Type</option>
              <option value="Car">Car</option>
              <option value="Bike">Bike</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="SUV">SUV</option>
            </select>
          </div>

          {/* Vehicle Number */}
          <div className="space-y-2">
            <label
              htmlFor="vehicleNumber"
              className="block text-sm font-medium text-foreground"
            >
              Vehicle Number
            </label>
            <input
              id="vehicleNumber"
              type="text"
              placeholder="e.g., MP04AS2939"
              value={vehicleNumber}
              onChange={(e) => handleVehicleNumberChange(e.target.value)}
              maxLength={10}
              className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-input focus:ring-primary"
              }`}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold transition-all ${
              loading
                ? "bg-primary/70 text-white cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {loading ? "Adding..." : "Add Vehicle"}
          </button>
        </form>

        <div className="mt-8 p-4 bg-secondary rounded-lg border border-border text-sm text-secondary-foreground text-center">
          Vehicle number must be in format like <strong>MP04AS2939</strong>.
          <br />
          You can edit details later from your <strong>Profile</strong>.
        </div>
      </section>
    </main>
  );
}
