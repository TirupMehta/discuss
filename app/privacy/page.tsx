import type { Metadata } from "next"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the Discuss privacy policy. Learn how we handle Google sign-in data, chat history, Firebase storage, and Gemini AI processing.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | Discuss",
    description:
      "How Discuss collects, uses, and safeguards your account and chat data.",
    url: "https://discuss.tirup.in/privacy",
    siteName: "Discuss",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Discuss",
    description:
      "How Discuss collects, uses, and safeguards your account and chat data.",
  },
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-start justify-center px-6 py-16 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-[100px] -z-10 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] -z-10 animate-pulse pointer-events-none" style={{ animationDelay: "1s" }}></div>

      <ThemeToggle className="fixed top-4 right-4 md:top-6 md:right-6" />

      <Link
        href="/"
        className="fixed top-4 left-4 md:top-6 md:left-6 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white border border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </Link>

      <div className="w-full max-w-2xl space-y-6 mt-8 md:mt-0">
        <div className="backdrop-blur-md bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-2xl rounded-2xl p-8 space-y-6 transition-all duration-300">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-black/45 dark:text-white/45">Last updated: May 29, 2026</p>
          </div>

          <hr className="border-black/5 dark:border-white/10" />

          <div className="space-y-6 text-sm text-black/75 dark:text-white/75 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-black dark:text-white">1. Introduction</h2>
              <p>
                Welcome to Discuss. We are committed to protecting your privacy and providing a secure AI group chat simulation experience. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our service.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-black dark:text-white">2. Information We Collect</h2>
              <ul className="list-disc list-inside pl-2 space-y-1">
                <li>
                  <strong className="text-black dark:text-white">Account Information:</strong> When you log in with Google, we access basic public profile information (such as your name, email address, and profile photo) provided by Google.
                </li>
                <li>
                  <strong className="text-black dark:text-white">Usage Data:</strong> We store the topics, onboarding names, and group chat simulation histories you create so you can retrieve and resume them.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-black dark:text-white">3. How We Use Your Information</h2>
              <p>
                Your information is used solely to provide, operate, and maintain the chat simulator:
              </p>
              <ul className="list-disc list-inside pl-2 space-y-1">
                <li>To authenticate your identity and secure your account.</li>
                <li>To synchronize and persist your chat history across your devices.</li>
                <li>To personalize your display name inside simulated AI chat groups.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-black dark:text-white">4. Third-Party Service Providers</h2>
              <p>
                We use secure, enterprise-grade cloud services to facilitate our service:
              </p>
              <ul className="list-disc list-inside pl-2 space-y-1">
                <li>
                  <strong className="text-black dark:text-white">Firebase (Google):</strong> Used for secure user authentication (Firebase Auth) and database hosting (Firebase Realtime Database) to save your chat sessions.
                </li>
                <li>
                  <strong className="text-black dark:text-white">Google Gemini API:</strong> Used to generate the conversational simulated responses of AI characters.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-black dark:text-white">5. Data Retention & Deletion</h2>
              <p>
                Your data is stored for as long as your account exists. You can request account deletion or log out of your session at any time. Since data is tied to your Google authentication, signing out removes your local active credentials.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-black dark:text-white">6. Cookies & Local Storage</h2>
              <p>
                We use browser local storage and secure authentication session cookies solely to preserve your login session and verify your account status. We do not use cookies for tracking, marketing, or advertising.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-black dark:text-white">7. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-black dark:text-white">8. Contact Us</h2>
              <p>
                If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at{" "}
                <a href="mailto:support@tirup.in" className="underline hover:text-black dark:hover:text-white transition-colors">
                  support@tirup.in
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
