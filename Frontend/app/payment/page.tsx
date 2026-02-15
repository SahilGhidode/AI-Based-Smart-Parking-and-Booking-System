import { Suspense } from "react";
import PaymentClient from "./PaymentClient";

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-semibold">Loading payment...</p>
    </div>}>
      <PaymentClient />
    </Suspense>
  );
}
