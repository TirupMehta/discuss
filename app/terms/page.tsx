import type { Metadata } from "next"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the Discuss terms of service. Rules for using the AI group chat simulator, acceptable use, AI content disclaimer, and liability.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service | Discuss",
    description:
      "Rules for using Discuss, the AI group chat simulator powered by Google Gemini.",
    url: "https://discuss.tirup.in/terms",
    siteName: "Discuss",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service | Discuss",
    description:
      "Rules for using Discuss, the AI group chat simulator powered by Google Gemini.",
  },
  robots: { index: true, follow: true },
}

export default function TermsPage() {
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
            <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">Terms of Service</h1>
            <p className="text-xs text-black/45 dark:text-white/45">Last updated: May 29, 2026</p>
          </div>

          <hr className="border-black/5 dark:border-white/10" />

          <div className="space-y-6 text-sm text-black/75 dark:text-white/75 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-black dark:text-white">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Discuss (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the Service.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-black dark:text-white">2. Description of Service</h2>
              <p>
                Discuss is a web-based AI group chat simulation platform. It allows users to log in via Google, customize a display name, choose topics of discussion, and observe or participate in generated chat simulations powered by Google Gemini AI.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-black dark:text-white">3. User Conduct & Responsibilities</h2>
              <p>
                As a user, you agree to use the Service only for lawful purposes. You are solely responsible for the inputs, topics, and names you enter. You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside pl-2 space-y-1">
                <li>Submit abusive, defamatory, harassing, or illegal content.</li>
                <li>Attempt to bypass API constraints, exploit database security, or spam the Service.</li>
                <li>Impersonate individuals or organizations maliciously.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-black dark:text-white">4. Intellectual Property & AI Content</h2>
              <p>
                The chat simulations are generated programmatically by artificial intelligence. Discuss does not claim ownership of the AI-generated outputs. You are free to copy, share, or use the generated text for personal, educational, or creative purposes, subject to Google Gemini AI&apos;s terms of use.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-black dark:text-white">5. Disclaimer of Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
              </p>
              <p>
                Discuss makes no warranties regarding the accuracy, truthfulness, or appropriateness of the AI-generated chat messages. AI outputs are programmatically simulated and do not reflect factual statements, real opinions, or views of Discuss.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-black dark:text-white">6. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Discuss and its creator (Tirup Mehta) shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of, or inability to use, the Service.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-black dark:text-white">7. Modification of Service & Terms</h2>
              <p>
                We reserve the right to modify or discontinue the Service at any time without notice. We also reserve the right to amend these Terms of Service. Your continued use of the Service following any changes constitutes acceptance of those changes.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-black dark:text-white">8. Governing Law</h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws applicable in your jurisdiction, without regard to its conflict of law provisions.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
