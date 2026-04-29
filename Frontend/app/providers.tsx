"use client"

import type React from "react"
import { ThemeProvider } from "next-themes"

import { LanguageProvider } from "./context/LanguageContext"
import { AuthProvider } from "./context/AuthContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <LanguageProvider>
        <AuthProvider>{children}</AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
