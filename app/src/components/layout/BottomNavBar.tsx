"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function BottomNavBar({ role }: { role?: string }) {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Mesa", icon: "grid_view", show: true },
    { href: "/rankings", label: "Rankings", icon: "leaderboard", show: true },
    { href: "/caixa", label: "Histórico", icon: "history", show: true },
    { href: "/dashboard", label: "Meus Stats", icon: "query_stats", show: true },
    { href: "/admin", label: "Admin", icon: "admin_panel_settings", show: role === "ADMIN1" || role === "ADMIN2" },
  ].filter(item => item.show)

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 glass-overlay border-t border-surface-variant/30">
      <div className="max-w-[1200px] mx-auto flex justify-around items-center px-4 pb-6 pt-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center active:scale-90 transition-all duration-200",
                isActive
                  ? "text-primary font-bold"
                  : "text-secondary hover:text-primary"
              )}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={{
                  fontVariationSettings: isActive
                    ? "'FILL' 1"
                    : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span className="text-label-caps text-[10px] font-bold mt-1 uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
