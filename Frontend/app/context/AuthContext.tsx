"use client"

import { createContext, useState, useContext, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  mobile: string
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (user: User) => void
  logout: () => void
  signup: (userData: Omit<User, "id">) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
  }

  const signup = (userData: Omit<User, "id">) => {
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
    }
    setUser(newUser)
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout, signup }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
