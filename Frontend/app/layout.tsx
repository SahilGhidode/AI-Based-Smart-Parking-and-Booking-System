import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
// import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SmartPark - Smart Parking System",
  description: "Find and book parking spaces effortlessly with SmartPark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>
        <Providers>{children}</Providers>
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
