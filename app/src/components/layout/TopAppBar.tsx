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
          <Image src="/logo.jpg" alt="Poker Dash Logo" width={160} height={28} className="h-7 w-auto object-contain drop-shadow-sm invert opacity-90 mix-blend-screen" priority />
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
