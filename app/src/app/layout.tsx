import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getAuthSession } from "@/lib/auth";
import { ForcePasswordChangeModal } from "@/components/features/ForcePasswordChangeModal";
import { SupabaseRealtimeProvider } from "@/components/providers/SupabaseRealtimeProvider";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "PokerAdmin — Home Game Dashboard",
  description: "Plataforma de gestão de Poker Cash Game com precisão financeira, transparência e engajamento.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession();
  const requiresPasswordChange = session?.requirePasswordChange === true;

  return (
    <html
      lang="pt-BR"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-background text-on-background antialiased pb-24 relative">
        <SupabaseRealtimeProvider>
          {requiresPasswordChange && <ForcePasswordChangeModal />}
          <div className={requiresPasswordChange ? "pointer-events-none blur-sm" : ""}>
            {children}
          </div>
        </SupabaseRealtimeProvider>
      </body>
    </html>
  );
}
