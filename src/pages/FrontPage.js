// src/pages/FrontPage.js
import React, { useState } from "react";

// HeroAuth Component (Login/Signup)
const HeroAuth = ({ onLogin }) => {
  const [tab, setTab] = useState("signup"); // "signup" or "login"
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = () => {
    if (tab === "signup") {
      if (!email || !password) return alert("Enter email & password");
      onLogin({ email, phone, password, role: "user" });
      alert("Signup successful!");
    } else {
      if (!email && !phone) return alert("Enter email or phone");
      if (!password) return alert("Enter password");
      onLogin({ email, phone, password, role: "user" });
      alert("Login successful!");
    }
    // Reset fields
    setEmail("");
    setPhone("");
    setPassword("");
  };

  return (
    <div className="bg-purple-800 bg-opacity-90 p-6 rounded-xl w-80 shadow-xl animate-slideUp text-white">
      {/* Tabs */}
      <div className="flex justify-between mb-4">
        <button
          className={`w-1/2 py-2 font-semibold ${
            tab === "signup" ? "border-b-4 border-white" : ""
          }`}
          onClick={() => setTab("signup")}
        >
          Sign Up
        </button>
        <button
          className={`w-1/2 py-2 font-semibold ${
            tab === "login" ? "border-b-4 border-white" : ""
          }`}
          onClick={() => setTab("login")}
        >
          Login
        </button>
      </div>

      {/* Signup Form */}
      {tab === "signup" && (
        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 rounded-lg border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="text"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="p-2 rounded-lg border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 rounded-lg border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={handleAuth}
            className="bg-white text-purple-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            Sign Up
          </button>
        </div>
      )}

      {/* Login Form */}
      {tab === "login" && (
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Email or Phone"
            value={email || phone}
            onChange={(e) => {
              if (/\d/.test(e.target.value)) setPhone(e.target.value);
              else setEmail(e.target.value);
            }}
            className="p-2 rounded-lg border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 rounded-lg border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={handleAuth}
            className="bg-white text-purple-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
};

const FrontPage = ({ onLogin }) => {
  return (
    <div className="min-h-screen font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-white bg-opacity-20 backdrop-blur-md z-50">
        <div className="container mx-auto flex justify-between items-center px-8 py-4">
          <h1 className="text-2xl font-bold text-purple-600">SMART PARKING SYSTEM</h1>
          <nav className="flex gap-6 items-center">
            <a href="#home" className="hover:text-purple-600 transition">Home</a>
            <a href="#features" className="hover:text-purple-600 transition">Features</a>
            <a href="#pricing" className="hover:text-purple-600 transition">Pricing</a>
            <a href="#about" className="hover:text-purple-600 transition">About Us</a>
            <a href="#contact" className="hover:text-purple-600 transition">Contact</a>
            <select className="border rounded px-2 py-1 text-gray-700">
              <option value="en">EN</option>
              <option value="hi">HI</option>
            </select>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="h-screen relative bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1612831455547-4f682f9b67a8?auto=format&fit=crop&w=1950&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center h-full px-12 text-white gap-8 mt-16">
          {/* Parking image on left */}
          <div className="w-96 h-96 flex-shrink-0">
            <img
              src="/parking.jpg"
              alt="Parking"
              className="rounded-xl shadow-lg h-full w-full object-cover"
            />
          </div>

          {/* Login/Signup box */}
          <div className="ml-8 flex flex-col items-center">
            <HeroAuth onLogin={onLogin} />
            <div className="mt-8 text-center text-black text-lg font-semibold drop-shadow-md">
              Proceed to book your parking slot after login!
            </div>
          </div>
        </div>
      </section>

      {/* Step by Step */}
      <section id="steps" className="py-20 bg-gray-100 text-center">
        <h2 className="text-3xl font-bold mb-12">How It Works</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-8">
          <div className="bg-white rounded-xl p-8 shadow-lg flex-1 animate-slideUp">
            <div className="text-4xl mb-4">1️⃣</div>
            <h3 className="text-xl font-semibold mb-2">Sign Up / Login</h3>
            <p>Create an account or login to get started.</p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-lg flex-1 animate-slideUp">
            <div className="text-4xl mb-4">2️⃣</div>
            <h3 className="text-xl font-semibold mb-2">Find Nearby Slots</h3>
            <p>See available parking spaces sorted by distance from your location.</p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-lg flex-1 animate-slideUp">
            <div className="text-4xl mb-4">3️⃣</div>
            <h3 className="text-xl font-semibold mb-2">Book & Get Directions</h3>
            <p>Reserve your slot and get Google Maps directions instantly.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-12">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 px-8">
          <div className="p-6 bg-white rounded-xl shadow-lg animate-slideUp">
            <h3 className="text-xl font-semibold mb-2">Fast Booking</h3>
            <p>Reserve slots quickly without any hassle.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg animate-slideUp">
            <h3 className="text-xl font-semibold mb-2">Real-Time Availability</h3>
            <p>Always see up-to-date information about slot availability.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg animate-slideUp">
            <h3 className="text-xl font-semibold mb-2">Google Maps Directions</h3>
            <p>Navigate directly to your booked slot using Google Maps.</p>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-20 bg-gray-100 text-center px-8">
        <h2 className="text-3xl font-bold mb-4">About Us</h2>
        <p className="max-w-2xl mx-auto">
          Smart Parking System is designed to simplify parking in busy cities by providing real-time information, easy booking, and seamless navigation to your parking slot.
        </p>
      </section>

      {/* Footer / Contact */}
      <section id="contact" className="py-12 bg-purple-600 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
        <p>Email: info@smartparking.com | Phone: +91 9876543210</p>
      </section>
    </div>
  );
};

export default FrontPage;
