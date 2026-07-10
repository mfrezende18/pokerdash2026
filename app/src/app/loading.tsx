import { TopAppBar } from "@/components/layout/TopAppBar"
import { BottomNavBar } from "@/components/layout/BottomNavBar"

export default function Loading() {
  return (
    <>
      <TopAppBar />
      <main className="max-w-[1200px] mx-auto px-4 md:px-6 mt-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-secondary font-medium animate-pulse">Carregando dados...</p>
      </main>
      <BottomNavBar />
    </>
  )
}
