"use client"

import { useState } from "react"
import API from "../api"

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "", // changed from 'name' to 'username' to match backend
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("") // Clear error when user starts typing
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await API.post("/auth/signup", formData)
      alert("✅ Signup successful!")
      console.log(res.data)
      setFormData({ username: "", email: "", password: "" })
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Signup failed!"
      setError(errorMessage)
      console.error("Signup error:", error.response?.data || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Signup</h1>
      {error && <div className="text-red-600 mb-4 p-2 bg-red-100 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-80">
        <input
          type="text"
          name="username" // changed from 'name' to 'username'
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 disabled:bg-gray-400"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  )
}

export default Signup
