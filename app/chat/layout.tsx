import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Discuss - Conversation",
  robots: {
    index: false,
    follow: false,
  },
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
