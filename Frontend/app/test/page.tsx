"use client";

import { useEffect } from "react";

export default function TestPage() {
  useEffect(() => {
    console.log("Environment variable test:");
    console.log("API URL =", process.env.NEXT_PUBLIC_API_URL);
  }, []);

  return <h1>Check the browser console (F12)</h1>;
}
