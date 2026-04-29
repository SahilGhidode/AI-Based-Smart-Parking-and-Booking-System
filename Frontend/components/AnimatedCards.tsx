"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface AnimatedCardProps {
  title: string
  description: string
  icon: string
  delay?: number
}

export function AnimatedCard({ title, description, icon, delay = 0 }: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardRef.current) {
        // Initial animation
        gsap.from(cardRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          delay,
          ease: "power3.out",
        })

        // Hover animation setup
        const card = cardRef.current
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            y: -10,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
            duration: 0.3,
            ease: "power2.out",
          })
        })

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            y: 0,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            duration: 0.3,
            ease: "power2.out",
          })
        })
      }
    }, cardRef)

    return () => ctx.revert()
  }, [delay])

  return (
    <div
      ref={cardRef}
      className="
        p-6 rounded-xl border border-border bg-card
        hover:border-primary transition-colors duration-300
        dark:bg-slate-800 dark:border-slate-700
        dark:hover:border-blue-500 shadow-sm
      "
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-card-foreground dark:text-slate-100">{title}</h3>
      <p className="text-muted-foreground dark:text-slate-400">{description}</p>
    </div>
  )
}

interface AnimatedCardsGridProps {
  cards: AnimatedCardProps[]
}

export function AnimatedCardsGrid({ cards }: AnimatedCardsGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (gridRef.current) {
        gsap.from(gridRef.current, {
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top center+=100",
            toggleActions: "play none none reverse",
          },
          opacity: 0,
          duration: 0.6,
        })
      }
    }, gridRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
    >
      {cards.map((card, i) => (
        <AnimatedCard key={i} {...card} delay={i * 0.1} />
      ))}
    </div>
  )
}
