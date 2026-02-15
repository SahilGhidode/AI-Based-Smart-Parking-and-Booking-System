"use client";
interface CustomJwtPayload {
  id: string;
  email: string;
  userId?: string;
}

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "@/app/context/AuthContext";

export default function GoogleSuccess() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    // 1️⃣ Extract token from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      router.push("/login");
      return;
    }

    // 2️⃣ Save token into LocalStorage
    localStorage.setItem("token", token);

    // 3️⃣ Decode Token
    const decoded = jwtDecode<CustomJwtPayload>(token);

    // 4️⃣ Update AuthContext
    login({
      id: decoded.id,
      name: decoded.email.split("@")[0],
      email: decoded.email,
      mobile: "",
    });

    // 5️⃣ Redirect to Home/Dashboard
    router.push("/");
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen text-xl">
      Logging you in...
    </div>
  );
}
