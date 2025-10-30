// src/pages/FrontPage.js
import React, { useState } from "react";

const FrontPage = ({ onLogin }) => {
  const [tab, setTab] = useState("signup");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url =
      tab === "signup"
        ? "http://localhost:5000/api/auth/register"
        : "http://localhost:5000/api/auth/login";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) {
          localStorage.setItem("token", data.token);
          onLogin(data.user || { email: formData.email });
          setMessage("✅ Success!");
        } else {
          setMessage("✅ Registration successful!");
        }
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Server error. Try again later.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-xl w-96">
        <h2 className="text-3xl font-bold text-center text-purple-600 mb-6">
          SmartPark
        </h2>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => setTab("signup")}
            className={`px-4 py-2 rounded-l-lg ${
              tab === "signup"
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setTab("login")}
            className={`px-4 py-2 rounded-r-lg ${
              tab === "login"
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === "signup" && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />

          <button
            type="submit"
            className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
          >
            {tab === "signup" ? "Sign Up" : "Login"}
          </button>
        </form>

        {message && <p className="text-center mt-4">{message}</p>}
      </div>
    </div>
  );
};

// 👇 THIS IS REQUIRED
export default FrontPage;
