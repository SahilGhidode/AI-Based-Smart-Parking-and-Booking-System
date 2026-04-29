"use client"

import { useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function ScrollAnimations() {
  useEffect(() => {
    // Animate elements with data-animate attribute
    const animatedElements = document.querySelectorAll("[data-animate]")

    animatedElements.forEach((element) => {
      const animationType = element.getAttribute("data-animate")

      switch (animationType) {
        case "fade-in":
          gsap.from(element, {
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
            opacity: 0,
            duration: 0.6,
          })
          break

        case "slide-up":
          gsap.from(element, {
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
            opacity: 0,
            y: 30,
            duration: 0.6,
          })
          break

        case "slide-left":
          gsap.from(element, {
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
            opacity: 0,
            x: -50,
            duration: 0.6,
          })
          break

        case "slide-right":
          gsap.from(element, {
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
            opacity: 0,
            x: 50,
            duration: 0.6,
          })
          break

        case "scale":
          gsap.from(element, {
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
            opacity: 0,
            scale: 0.8,
            duration: 0.6,
          })
          break

        case "rotate":
          gsap.from(element, {
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
            opacity: 0,
            rotation: -10,
            scale: 0.8,
            duration: 0.6,
          })
          break

        default:
          break
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return null
}

// Hook for adding scroll animations easily
export function useScrollAnimation(ref: React.RefObject<HTMLElement>, type: string) {
  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    switch (type) {
      case "fade-in":
        gsap.from(element, {
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          opacity: 0,
          duration: 0.6,
        })
        break

      case "slide-up":
        gsap.from(element, {
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          opacity: 0,
          y: 30,
          duration: 0.6,
        })
        break

      case "parallax":
        gsap.from(element, {
          scrollTrigger: {
            trigger: element,
            start: "top center",
            end: "bottom center",
            scrub: 1,
          },
          y: -50,
        })
        break
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [ref, type])
}
