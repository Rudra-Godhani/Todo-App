import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { AuthWrapper } from "@/components/layout/auth-wrapper"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FitTracker - Your Personal Fitness Journey",
  description: "Track workouts, set goals, and monitor your fitness progress with FitTracker.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AuthWrapper>
            {children}
            <Toaster />
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
