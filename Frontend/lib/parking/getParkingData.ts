"use client";

import { io } from "socket.io-client";

let socket: any = null;

// Initialize socket
export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000");
  }
  return socket;
}

/**
 * 📌 Fetch Parking Space info:
 * - floors
 * - total slots per floor
 * - available slots per floor
 * - location (lat, lng)
 */
export async function fetchParkingOverview(spaceId: number) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/parking-spaces/${spaceId}`
    );

    const parking = await res.json();

    return {
      space: parking.space,
      floors: parking.floors,
    };
  } catch (err) {
    console.error("Error fetching parking overview:", err);
    return null;
  }
}

/**
 * 📌 Fetch slot counts for all floors
 */
export async function fetchFloorSlotCounts(spaceId: number) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/parking-spaces/${spaceId}/slots`
    );

    const slots = await res.json();

    // Group by floor
    const floorData: any = {};

    slots.forEach((slot: any) => {
      if (!floorData[slot.floor_id]) {
        floorData[slot.floor_id] = {
          total: 0,
          available: 0,
          floor_id: slot.floor_id,
          floor_number: slot.floor_number,
        };
      }

      floorData[slot.floor_id].total++;
      if (slot.status === "empty") floorData[slot.floor_id].available++;
    });

    return Object.values(floorData);
  } catch (err) {
    console.error("Error fetching floor slot counts:", err);
    return [];
  }
}

/**
 * 📌 Subscribe to real-time slot updates for the entire parking space
 */
export function subscribeParkingRealtime(spaceId: number, onUpdate: Function) {
  const socket = getSocket();

  // Join entire space room
  socket.emit("joinSpace", spaceId);

  socket.on("slot:update", (slot: any) => {
    if (slot.space_id === spaceId) {
      onUpdate(slot);
    }
  });

  return () => socket.off("slot:update");
}
