import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mobile App Authorization",
  description: "Authorize your Google account to log in to the Discuss mobile application.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function MobileAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
