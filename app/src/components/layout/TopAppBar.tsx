import Link from "next/link"
import Image from "next/image"

interface TopAppBarProps {
  avatarUrl?: string
  showLiveIndicator?: boolean
}

export function TopAppBar({ avatarUrl, showLiveIndicator = true }: TopAppBarProps) {
  const cleanAvatar = avatarUrl?.trim()
  const isUrl = cleanAvatar && (cleanAvatar.startsWith("http") || cleanAvatar.startsWith("/"))

  return (
    <header className="w-full top-0 sticky z-50 glass-overlay border-b border-surface-variant/50">
      <div className="flex items-center justify-between px-6 py-3 w-full max-w-[1200px] mx-auto">
        <Link href="/" className="flex items-center gap-3">
          {cleanAvatar ? (
            isUrl ? (
              <Image
                src={cleanAvatar}
                alt="Perfil"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border border-outline-variant/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-xl shadow-sm border border-outline-variant/30 overflow-hidden">
                <span className="truncate max-w-full text-xs px-1">{cleanAvatar}</span>
              </div>
            )
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-on-primary font-bold text-sm">PA</span>
            </div>
          )}
          <span className="text-headline-lg-mobile text-primary font-bold tracking-tight">
            PokerAdmin
          </span>
        </Link>
        <div className="flex items-center gap-6">
          {showLiveIndicator && (
            <span className="material-symbols-outlined text-primary text-2xl">
              sensors
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
