"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Only create client if URL is defined to avoid errors on build/startup if missing
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export function SupabaseRealtimeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
        },
        (payload) => {
          console.log('Realtime update:', payload)
          // Any change to public tables should trigger a soft reload to keep dashboard fresh
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  return <>{children}</>
}
