"use client"

import { useState } from "react"

const HeroAuth = ({ onLogin }) => {
  const [tab, setTab] = useState("signup")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")

  const handleAuth = () => {
    if (tab === "signup") {
      if (!email || !password) return alert("Enter email & password")
      onLogin({ email, phone, password, role: "user" })
      alert("Signup successful!")
    } else {
      if (!email && !phone) return alert("Enter email or phone")
      if (!password) return alert("Enter password")
      onLogin({ email, phone, password, role: "user" })
      alert("Login successful!")
    }
    setEmail("")
    setPhone("")
    setPassword("")
  }

  return (
    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fade-in-up border border-purple-100">
      <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg">
        <button
          className={`flex-1 py-3 font-semibold rounded-md transition-all duration-300 ${
            tab === "signup" ? "bg-purple-600 text-white shadow-lg" : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setTab("signup")}
        >
          Sign Up
        </button>
        <button
          className={`flex-1 py-3 font-semibold rounded-md transition-all duration-300 ${
            tab === "login" ? "bg-purple-600 text-white shadow-lg" : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setTab("login")}
        >
          Login
        </button>
      </div>

      {tab === "signup" && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
            <input
              type="text"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={handleAuth}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold mt-2"
          >
            Create Account
          </button>
        </div>
      )}

      {tab === "login" && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email or Phone</label>
            <input
              type="text"
              placeholder="you@example.com or +91 98765 43210"
              value={email || phone}
              onChange={(e) => {
                if (/\d/.test(e.target.value)) setPhone(e.target.value)
                else setEmail(e.target.value)
              }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={handleAuth}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold mt-2"
          >
            Sign In
          </button>
        </div>
      )}
    </div>
  )
}

const FrontPage = ({ onLogin }) => {
  return (
    <div className="min-h-screen font-sans bg-gradient-to-b from-white via-purple-50 to-white">
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="container mx-auto flex justify-between items-center px-6 py-4 max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🅿️</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
              SmartPark
            </h1>
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            <a href="#home" className="text-gray-700 hover:text-purple-600 transition font-medium">
              Home
            </a>
            <a href="#features" className="text-gray-700 hover:text-purple-600 transition font-medium">
              Features
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-purple-600 transition font-medium">
              Pricing
            </a>
            <a href="#about" className="text-gray-700 hover:text-purple-600 transition font-medium">
              About
            </a>
            <a href="#contact" className="text-gray-700 hover:text-purple-600 transition font-medium">
              Contact
            </a>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-white hover:border-purple-400 transition">
              <option value="en">EN</option>
              <option value="hi">HI</option>
            </select>
          </nav>
        </div>
      </header>

      <section id="home" className="min-h-screen relative pt-20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-transparent to-purple-50 opacity-60"></div>

        <div className="relative z-10 container mx-auto px-6 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Find Your Perfect{" "}
                <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  Parking Spot
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Smart Parking System makes finding and booking parking spaces effortless. Real-time availability,
                instant directions, and seamless payments.
              </p>
              <div className="flex gap-4">
                <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-lg hover:shadow-xl transition-all duration-300 font-semibold">
                  Get Started
                </button>
                <button className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-lg hover:bg-purple-50 transition-all duration-300 font-semibold">
                  Learn More
                </button>
              </div>
            </div>

            <div className="animate-slide-in-right">
              <HeroAuth onLogin={onLogin} />
              <p className="text-center text-gray-600 mt-6 text-sm">✨ Book your parking slot in seconds after login</p>
            </div>
          </div>
        </div>
      </section>

      <section id="steps" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to find your parking</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Sign Up", desc: "Create your account in seconds with email or phone" },
              { num: "02", title: "Find Spots", desc: "Browse available parking spaces near you in real-time" },
              { num: "03", title: "Book & Go", desc: "Reserve your spot and get instant directions" },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-4">
                  {step.num}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need for hassle-free parking</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "⚡", title: "Lightning Fast", desc: "Book parking in under 30 seconds" },
              { icon: "📍", title: "Real-Time Updates", desc: "Always see the latest availability" },
              { icon: "🗺️", title: "Smart Navigation", desc: "Integrated Google Maps directions" },
              { icon: "💳", title: "Easy Payments", desc: "Multiple payment options available" },
              { icon: "🔒", title: "Secure & Safe", desc: "Your data is encrypted and protected" },
              { icon: "📱", title: "Mobile First", desc: "Optimized for all devices" },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-3xl p-12 md:p-16 text-white">
            <h2 className="text-4xl font-bold mb-6">About SmartPark</h2>
            <p className="text-lg leading-relaxed opacity-95 max-w-2xl">
              We're revolutionizing urban parking with intelligent technology. Our mission is to eliminate parking
              frustration, save time, and reduce traffic congestion in busy cities worldwide. Join thousands of users
              who've already discovered the SmartPark difference.
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="text-lg font-bold mb-4">SmartPark</h3>
              <p className="text-gray-400">Making parking smarter, one spot at a time.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#home" className="hover:text-white transition">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white transition">
                    About
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <p className="text-gray-400">📧 info@smartpark.com</p>
              <p className="text-gray-400">📱 +91 9876543210</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SmartPark. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default FrontPage
