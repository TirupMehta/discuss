import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], display: "swap" })

const siteUrl = "https://discuss.tirup.in"
const siteName = "Discuss"
const defaultTitle = "Discuss — AI Group Chat Simulator"
const defaultDescription =
  "Discuss is an AI group chat simulator. Drop a topic and watch AI characters debate, brainstorm startup ideas, discuss philosophy, and chat like real people. Powered by Google Gemini."

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "light dark",
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | Discuss",
  },
  description: defaultDescription,
  applicationName: siteName,
  authors: [{ name: "Tirup Mehta", url: "https://tirup.in" }],
  creator: "Tirup Mehta",
  publisher: "Tirup Mehta",
  category: "technology",
  keywords: [
    "AI group chat",
    "AI group chat simulator",
    "AI characters",
    "AI debate",
    "AI brainstorming",
    "startup ideas AI",
    "philosophy discussion AI",
    "Gemini AI chat",
    "Google Gemini API",
    "group conversation simulator",
    "AI roleplay chat",
    "Discuss AI",
    "Tirup Mehta",
  ],
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: defaultTitle,
    description:
      "Simulate dynamic group chat conversations between customizable AI characters. Brainstorm startup ideas, debate philosophy, or chat casually.",
    url: siteUrl,
    siteName,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Discuss — AI Group Chat Simulator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description:
      "Drop a topic and watch AI characters discuss it like real people — opinions, jokes, and facts. Powered by Google Gemini.",
    creator: "@TirupMehta",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-light-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteName,
        description: defaultDescription,
        inLanguage: "en-US",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "WebApplication",
        "@id": `${siteUrl}/#app`,
        name: defaultTitle,
        url: siteUrl,
        applicationCategory: "SocialNetworkingApplication",
        operatingSystem: "Web",
        description: defaultDescription,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
        logo: `${siteUrl}/icon.svg`,
        founder: {
          "@type": "Person",
          name: "Tirup Mehta",
          url: "https://tirup.in",
        },
      },
    ],
  }

  return (
    <html lang="en" dir="ltr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
