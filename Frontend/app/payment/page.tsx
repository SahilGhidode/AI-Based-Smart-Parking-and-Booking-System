import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const spot = searchParams.get("spot");
  const amount = searchParams.get("amount");
  const duration = searchParams.get("duration");

  // Simulate payment success
  useEffect(() => {
    const timer = setTimeout(() => {
      alert("✅ Payment Successful!");
      router.push("/my-booking");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold text-text mb-4">Payment Processing</h1>
        <p className="text-lg text-text-light mb-6">
          Spot #{spot} | Duration: {duration} hr(s)
        </p>
        <p className="text-2xl font-semibold text-primary mb-8">
          Amount: ₹{amount}
        </p>

        {/* Fake QR Code */}
        <div className="w-48 h-48 bg-gray-300 flex items-center justify-center rounded-lg mb-6">
          <span className="text-gray-600 font-bold">FAKE QR</span>
        </div>

        <p className="text-text-light mb-4">
          Scan the fake QR to complete your payment
        </p>

        <p className="text-sm text-gray-500 italic">
          Redirecting to your bookings after payment...
        </p>
      </div>

      <Footer />
    </div>
  );
}
