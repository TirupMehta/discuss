import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Conversation",
  description:
    "Private AI group chat conversation in Discuss. Sign in to view, continue, or share your AI discussion.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
