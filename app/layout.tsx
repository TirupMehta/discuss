import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "Discuss - AI Group Chat Simulator",
  description: "Simulate dynamic group chat conversations between customizable AI characters. Brainstorm startup ideas, debate philosophy, or chat casually with AI characters.",
  metadataBase: new URL("https://discuss.tirup.in"),
  keywords: ["AI group chat", "Gemini AI", "chat simulator", "AI characters", "startup brainstorming", "Tirup Mehta"],
  authors: [{ name: "Tirup Mehta", url: "https://tirup.in" }],
  creator: "Tirup Mehta",
  openGraph: {
    title: "Discuss - AI Group Chat Simulator",
    description: "Simulate dynamic group chat conversations between customizable AI characters.",
    url: "https://discuss.tirup.in",
    siteName: "Discuss",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Discuss - AI Group Chat Simulator",
    description: "Simulate dynamic group chat conversations between customizable AI characters.",
    creator: "@TirupMehta",
  },
  robots: {
    index: true,
    follow: true,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
