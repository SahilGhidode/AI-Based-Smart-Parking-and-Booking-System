// src/App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import FrontPage from "./pages/FrontPage";
import Dashboard from "./pages/Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Auto-login using token from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({ email: payload.email });
      } catch (err) {
        console.error("Invalid token");
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    navigate("/dashboard"); // redirect after login/signup
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  const PrivateRoute = ({ children }) => {
    return user ? children : <Navigate to="/" />;
  };

  return (
    <Routes>
      <Route path="/" element={<FrontPage onLogin={handleLogin} />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard user={user} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
