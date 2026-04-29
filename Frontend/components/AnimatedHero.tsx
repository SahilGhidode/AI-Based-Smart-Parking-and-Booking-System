"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function AnimatedHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stagger title letters animation
      if (titleRef.current) {
        const letters = titleRef.current.querySelectorAll("span")
        gsap.from(letters, {
          opacity: 0,
          y: 20,
          stagger: 0.05,
          duration: 0.8,
          ease: "power3.out",
        })
      }

      // Animate subtitle
      if (subtitleRef.current) {
        gsap.from(subtitleRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          delay: 0.4,
          ease: "power3.out",
        })
      }

      // Animate buttons
      if (buttonsRef.current) {
        const buttons = buttonsRef.current.querySelectorAll("button, a")
        gsap.from(buttons, {
          opacity: 0,
          y: 20,
          stagger: 0.1,
          duration: 0.8,
          delay: 0.6,
          ease: "power3.out",
        })
      }

      // Float animation for background
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          y: 20,
          duration: 6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      }

      // Parallax effect on scroll
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
            end: "bottom center",
            scrub: 1,
          },
          opacity: 0.5,
          y: 100,
        })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Animated background */}
      <div
        ref={bgRef}
        className="absolute inset-0 -z-10 opacity-30"
      >
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl dark:bg-blue-900"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl dark:bg-purple-900"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl dark:bg-pink-900"></div>
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1
          ref={titleRef}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-foreground"
        >
          {"Smart Parking at Your Fingertips".split("").map((char, i) => (
            <span key={i} className="inline-block">
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>

        <p
          ref={subtitleRef}
          className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
        >
          Find, book, and manage your parking spaces effortlessly with advanced AI-powered recommendations
        </p>

        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-lg">
            Book Now
          </button>
          <button className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-all transform hover:scale-105">
            Learn More
          </button>
        </div>
      </div>
    </div>
  )
}
