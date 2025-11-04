"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 shadow-md">
      <div className="flex items-center justify-between">
        {/* Left: Logo */}
        <h1 className="text-2xl font-bold">Smart Parking</h1>

        {/* Menu button (for mobile) */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Right: Menu Items */}
        <ul
          className={`md:flex md:space-x-6 font-medium ${
            open ? "block mt-3" : "hidden md:block"
          }`}
        >
          <li>
            <Link href="/profile" className="hover:text-gray-200">
              Profile
            </Link>
          </li>
          <li>
            <Link href="/add-vehicle" className="hover:text-gray-200">
              Add Vehicle
            </Link>
          </li>
          <li>
            <Link href="/payment-history" className="hover:text-gray-200">
              Payment History
            </Link>
          </li>
          <li>
            <Link href="/settings" className="hover:text-gray-200">
              Settings
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
