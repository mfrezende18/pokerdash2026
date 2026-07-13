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
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-title-lg font-bold text-on-surface">Próximo Evento</h3>
      </div>
      <div className="flex flex-col gap-6">
        {events.map((event) => {
          const content = event.imageUrl ? (
            <div className="relative w-full aspect-[4/5] max-w-[400px] mx-auto rounded-3xl overflow-hidden shadow-xl border border-outline-variant/30">
              {/* Note: since Base64 strings can be large, unoptimized={true} is generally required if using Next.js Image for Data URIs to prevent errors, or just use regular img. But Next.js handles data URIs if unoptimized. */}
              {event.imageUrl.startsWith("data:") ? (
                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
              )}
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-3xl p-8 apple-shadow border border-surface-variant/20 flex flex-col gap-2 max-w-[400px] mx-auto w-full">
              <h4 className="text-headline-sm text-primary font-bold">{event.title}</h4>
              <p className="text-body-md text-secondary">{event.description}</p>
              {event.ctaText && (
                <div className="text-primary font-bold mt-4 flex items-center gap-1">
                  {event.ctaText}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              )}
            </div>
          )

          if (event.ctaUrl) {
            return (
              <Link key={event.id} href={event.ctaUrl} className="block hover:scale-[1.02] transition-transform w-full">
                {content}
              </Link>
            )
          }

          return <div key={event.id} className="w-full">{content}</div>
        })}
      </div>
    </section>
  )
}
