// src/pages/Login.js
import React, { useState } from "react";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ username, role });
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
      <div className="bg-white p-12 rounded-3xl shadow-2xl w-96">
        <h1 className="text-3xl font-bold text-center text-gray-700 mb-6">
          Welcome to Smart Parking
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button className="bg-purple-600 text-white p-3 rounded-lg font-semibold hover:bg-purple-700 transition">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
