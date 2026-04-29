"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import gsap from "gsap"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const sunRef = useRef<HTMLDivElement>(null)
  const moonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)

    if (toggleRef.current) {
      // Rotate the button
      gsap.to(toggleRef.current, {
        rotation: 360,
        duration: 0.6,
        ease: "back.out",
      })

      // Animate sun/moon icons
      if (newTheme === "dark" && moonRef.current && sunRef.current) {
        gsap.fromTo(
          sunRef.current,
          { opacity: 1, scale: 1, rotateY: 0 },
          { opacity: 0, scale: 0.5, rotateY: 180, duration: 0.4, ease: "power2.inOut" }
        )
        gsap.fromTo(
          moonRef.current,
          { opacity: 0, scale: 0.5, rotateY: -180 },
          { opacity: 1, scale: 1, rotateY: 0, duration: 0.4, ease: "power2.inOut" }
        )
      } else if (newTheme === "light" && sunRef.current && moonRef.current) {
        gsap.fromTo(
          moonRef.current,
          { opacity: 1, scale: 1, rotateY: 0 },
          { opacity: 0, scale: 0.5, rotateY: 180, duration: 0.4, ease: "power2.inOut" }
        )
        gsap.fromTo(
          sunRef.current,
          { opacity: 0, scale: 0.5, rotateY: -180 },
          { opacity: 1, scale: 1, rotateY: 0, duration: 0.4, ease: "power2.inOut" }
        )
      }
    }

    // Animate page background transition
    gsap.to("html", {
      duration: 0.5,
      ease: "power2.inOut",
    })
  }

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
    )
  }

  return (
    <button
      ref={toggleRef}
      onClick={handleToggle}
      className="
        relative w-10 h-10 rounded-lg
        bg-gray-100 dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        flex items-center justify-center
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-colors duration-300
        shadow-sm hover:shadow-md
        group
      "
      aria-label="Toggle theme"
    >
      <div
        ref={sunRef}
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: "1000px" }}
      >
        <Sun className="w-5 h-5 text-yellow-500 group-hover:text-yellow-600" />
      </div>
      <div
        ref={moonRef}
        className="absolute inset-0 flex items-center justify-center opacity-0"
        style={{ perspective: "1000px" }}
      >
        <Moon className="w-5 h-5 text-blue-400 group-hover:text-blue-500" />
      </div>
    </button>
  )
}
