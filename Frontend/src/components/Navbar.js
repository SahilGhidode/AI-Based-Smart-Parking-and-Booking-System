// src/components/Navbar.js
import React from "react";

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center px-8 py-4">
        <h1 className="text-2xl font-bold text-purple-600">SMART PARKING SYSTEM</h1>
        <div className="flex gap-6 items-center">
          <a href="#home" className="hover:text-purple-600 transition">Home</a>
          <a href="#about" className="hover:text-purple-600 transition">About Us</a>
          <a href="#features" className="hover:text-purple-600 transition">Features</a>
          <a href="#pricing" className="hover:text-purple-600 transition">Pricing</a>
          <a href="#contact" className="hover:text-purple-600 transition">Contact</a>
          {user ? (
            <>
              <span className="font-semibold text-gray-700">{user.email || user.phone}</span>
              <button onClick={onLogout} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                Logout
              </button>
            </>
          ) : (
            <a href="#signup" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">Sign Up / Login</a>
          )}
          <select className="border rounded px-2 py-1 text-gray-700">
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
          </select>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
