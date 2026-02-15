import { Suspense } from "react";
import BookingClient from "./BookingClient";

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg font-semibold">Loading booking...</p>
        </div>
      }
    >
      <BookingClient />
    </Suspense>
  );
}
