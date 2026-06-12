import Image from "next/image"
import Link from "next/link"

interface EventItem {
  id: string
  title: string
  description: string
  imageUrl: string | null
  ctaText: string | null
  ctaUrl: string | null
  eventDate: Date
}

interface EventsSectionProps {
  events: EventItem[]
}

export function EventsSection({ events }: EventsSectionProps) {
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-headline-lg-mobile text-primary">
          Próximos Eventos
        </h3>
        <button className="text-primary font-bold text-sm hover:opacity-70 transition-opacity">
          Calendário Completo
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex bg-surface-container-lowest rounded-2xl overflow-hidden apple-shadow border border-surface-variant/20 hover:scale-[1.01] transition-transform"
          >
            <div className="w-1/3 min-w-[120px] relative">
              {event.imageUrl ? (
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-secondary/30">
                    event
                  </span>
                </div>
              )}
            </div>
            <div className="p-6 flex flex-col justify-center gap-1">
              <h4 className="text-title-md text-primary text-lg">
                {event.title}
              </h4>
              <p className="text-body-sm text-secondary">
                {event.description}
              </p>
              {event.ctaText && (
                <Link
                  href={event.ctaUrl || "#"}
                  className="text-primary font-bold text-sm mt-3 flex items-center gap-1 hover:underline"
                >
                  {event.ctaText}
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
