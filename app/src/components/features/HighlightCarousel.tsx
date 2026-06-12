"use client"

import Image from "next/image"
import { useRef } from "react"
import { cn } from "@/lib/utils"

interface HighlightItem {
  id: string
  title: string
  subtitle: string | null
  description: string
  imageUrl: string | null
  badge: string | null
  badgeColor: string
}

interface HighlightCarouselProps {
  highlights: HighlightItem[]
}

function getBadgeClasses(color: string): string {
  switch (color) {
    case "tertiary":
      return "bg-tertiary-fixed text-on-tertiary-fixed"
    case "black":
      return "bg-black/80 backdrop-blur-md text-white"
    case "primary":
    default:
      return "bg-primary text-white"
  }
}

export function HighlightCarousel({ highlights }: HighlightCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "right" ? 324 : -324
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" })
    }
  }

  return (
    <section className="mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-headline-lg-mobile text-primary">Destaques</h3>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 flex items-center justify-center bg-surface-container rounded-full hover:bg-surface-variant transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 flex items-center justify-center bg-surface-container rounded-full hover:bg-surface-variant transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto hide-scrollbar gap-6 pb-4"
      >
        {highlights.map((highlight) => (
          <div
            key={highlight.id}
            className="flex-none w-[300px] bg-surface-container-lowest rounded-2xl overflow-hidden apple-shadow border border-surface-variant/20 transition-all hover:translate-y-[-4px]"
          >
            <div className="h-40 bg-on-surface-variant/10 relative">
              {highlight.imageUrl ? (
                <Image
                  src={highlight.imageUrl}
                  alt={highlight.title}
                  fill
                  className="object-cover opacity-90"
                />
              ) : (
                <div className="w-full h-full bg-surface-container-high" />
              )}
              {highlight.badge && (
                <div
                  className={cn(
                    "absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    getBadgeClasses(highlight.badgeColor)
                  )}
                >
                  {highlight.badge}
                </div>
              )}
            </div>
            <div className="p-6">
              {highlight.subtitle && (
                <p className="text-label-caps text-[10px] text-secondary mb-1 font-bold uppercase tracking-widest">
                  {highlight.subtitle}
                </p>
              )}
              <h4 className="text-title-md text-primary mb-1">
                {highlight.title}
              </h4>
              <p className="text-body-sm text-secondary">
                {highlight.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
