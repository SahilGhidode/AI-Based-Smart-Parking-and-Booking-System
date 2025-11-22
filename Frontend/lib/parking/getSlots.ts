"use client";

import { io } from "socket.io-client";

let socket: any = null;

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000");
  }
  return socket;
}

export async function fetchSlots(floorId: number) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/slots/floor/${floorId}`
    );
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch slots:", err);
    return [];
  }
}

export function subscribeSlotUpdates(floorId: number, callback: (slot: any) => void) {
  const socket = getSocket();

  socket.emit("joinFloor", floorId);

  socket.on("slot:update", (slot: any) => {
    if (slot.floor_id === floorId) {
      callback(slot);
    }
  });

  return () => socket.off("slot:update");
}
