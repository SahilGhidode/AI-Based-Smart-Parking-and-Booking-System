// src/components/HeroAuth.js
import React, { useState } from "react";

const HeroAuth = ({ onAuth }) => {
  const [tab, setTab] = useState("signup"); // "signup" or "login"
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = () => {
    if (tab === "signup") {
      if (!email || !password) return alert("Enter email & password");
      onAuth({ email, phone, password, role: "user" });
      alert("Signup successful!");
    } else {
      if (!email && !phone) return alert("Enter email or phone");
      if (!password) return alert("Enter password");
      onAuth({ email, phone, password, role: "user" });
      alert("Login successful!");
    }
  };

  return (
    <div className="bg-white bg-opacity-90 p-8 rounded-xl max-w-md w-full shadow-lg">
      <div className="flex justify-between mb-4">
        <button
          className={`w-1/2 py-2 font-semibold ${tab === "signup" ? "border-b-4 border-purple-600" : ""}`}
          onClick={() => setTab("signup")}
        >
          Sign Up
        </button>
        <button
          className={`w-1/2 py-2 font-semibold ${tab === "login" ? "border-b-4 border-purple-600" : ""}`}
          onClick={() => setTab("login")}
        >
          Login
        </button>
      </div>

      {tab === "signup" && (
        <div className="flex flex-col gap-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-3 rounded-lg border" />
          <input type="text" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className="p-3 rounded-lg border" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-3 rounded-lg border" />
          <button onClick={handleAuth} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">Sign Up</button>
        </div>
      )}

      {tab === "login" && (
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Email or Phone"
            value={email || phone}
            onChange={(e) => {
              if (/\d/.test(e.target.value)) setPhone(e.target.value);
              else setEmail(e.target.value);
            }}
            className="p-3 rounded-lg border"
          />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-3 rounded-lg border" />
          <button onClick={handleAuth} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">Login</button>
        </div>
      )}
    </div>
  );
};

export default HeroAuth;
