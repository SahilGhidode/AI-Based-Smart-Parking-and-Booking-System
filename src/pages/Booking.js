import React from "react";

const Booking = () => {
  const slots = [
    { id: 1, status: "empty" },
    { id: 2, status: "occupied" },
    { id: 3, status: "empty" },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">Book a Slot</h2>
      <div className="grid grid-cols-3 gap-6">
        {slots.map((slot) => (
          <button
            key={slot.id}
            disabled={slot.status !== "empty"}
            className={`p-6 rounded-xl text-white font-semibold ${
              slot.status === "empty" ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Slot {slot.id}
            <p className="mt-2">{slot.status === "empty" ? "Available" : "Occupied"}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Booking;
