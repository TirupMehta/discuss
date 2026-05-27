"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signInWithPopup, signOut, onAuthStateChanged, type User } from "firebase/auth"
import { ref, get, set } from "firebase/database"
import { auth, db, googleProvider } from "@/lib/firebase"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogOut, MessageSquare, ArrowRight } from "lucide-react"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [topic, setTopic] = useState("")
  const [name, setName] = useState("")
  const [onboardingName, setOnboardingName] = useState("")
  const [authLoading, setAuthLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [onboardingLoading, setOnboardingLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        try {
          const userRef = ref(db, `users/${currentUser.uid}`)
          const snapshot = await get(userRef)
          if (snapshot.exists() && snapshot.val().name) {
            const savedName = snapshot.val().name
            setName(savedName)
            localStorage.setItem("discuss_user_name", savedName)
            localStorage.setItem("discuss_user_uid", currentUser.uid)
            setNeedsOnboarding(false)
          } else {
            setNeedsOnboarding(true)
          }
        } catch (error) {
          console.error("Error checking user profile:", error)
          const fallbackName = currentUser.displayName || "User"
          setName(fallbackName)
          localStorage.setItem("discuss_user_name", fallbackName)
          localStorage.setItem("discuss_user_uid", currentUser.uid)
          setNeedsOnboarding(false)
        }
      } else {
        setUser(null)
        setName("")
        localStorage.removeItem("discuss_user_name")
        localStorage.removeItem("discuss_user_uid")
      }
      setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      setAuthLoading(true)
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error("Sign in failed:", error)
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onboardingName.trim() || !user) return

    setOnboardingLoading(true)
    try {
      const cleanName = onboardingName.trim()
      await set(ref(db, `users/${user.uid}`), {
        name: cleanName,
        createdAt: Date.now()
      })
      setName(cleanName)
      localStorage.setItem("discuss_user_name", cleanName)
      localStorage.setItem("discuss_user_uid", user.uid)
      setNeedsOnboarding(false)
    } catch (error) {
      console.error("Failed to save name:", error)
    } finally {
      setOnboardingLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setIsLoading(true)
    localStorage.removeItem("discuss_active_chat_id")
    router.push(`/chat?topic=${encodeURIComponent(topic.trim())}`)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center transition-colors duration-300">
        <div className="w-10 h-10 border-4 border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold tracking-wide text-black/50 dark:text-white/50 uppercase">Loading session</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-6 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-[100px] -z-10 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] -z-10 animate-pulse pointer-events-none" style={{ animationDelay: "1s" }}></div>

      <ThemeToggle className="fixed top-4 right-4 md:top-6 md:right-6" />

      {user && !needsOnboarding && (
        <button
          onClick={handleSignOut}
          className="fixed top-4 left-4 md:top-6 md:left-6 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white border border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      )}

      <div className="w-full max-w-md">
        {!user ? (
          <div className="backdrop-blur-md bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-2xl rounded-2xl p-8 space-y-8 text-center transition-all duration-300">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center shadow-lg transform rotate-6">
                <MessageSquare className="w-6 h-6 text-white dark:text-black" />
              </div>
              <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">Discuss</h1>
              <p className="text-sm text-black/60 dark:text-white/60">
                Sign in with Google to start or join AI group chats.
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold border border-black/10 dark:border-white/10 bg-white dark:bg-transparent text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Sign In with Google
            </button>
          </div>
        ) : needsOnboarding ? (
          <form onSubmit={handleOnboardingSubmit} className="backdrop-blur-md bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-2xl rounded-2xl p-8 space-y-6 transition-all duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">Onboarding</h2>
              <p className="text-sm text-black/60 dark:text-white/60">
                What should we call you in the group chat?
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={onboardingName}
                onChange={(e) => setOnboardingName(e.target.value)}
                className="w-full px-4 py-3 text-sm text-black dark:text-white bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-black/30 dark:focus:border-white/30 transition-all placeholder:text-black/40 dark:placeholder:text-white/40"
                placeholder="Enter your name (e.g. Baburao)"
                disabled={onboardingLoading}
                autoFocus
                required
                maxLength={20}
              />
            </div>

            <button
              type="submit"
              disabled={!onboardingName.trim() || onboardingLoading}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-black dark:bg-white dark:text-black rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90 cursor-pointer"
            >
              {onboardingLoading ? "Saving..." : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="text-center mb-8 space-y-2">
                <h1 className="text-4xl font-extrabold text-black dark:text-white tracking-tight">Discuss</h1>
                <p className="text-sm text-black/50 dark:text-white/50">Welcome, <span className="font-semibold text-black dark:text-white">{name}</span>! Start a new discussion.</p>
              </div>
              <label htmlFor="topic" className="block text-black/75 dark:text-white/75 text-sm font-semibold tracking-wide">
                Choose a topic
              </label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 text-sm text-black dark:text-white bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-black/30 dark:focus:border-white/30 transition-all placeholder:text-black/40 dark:placeholder:text-white/40 shadow-sm"
                placeholder="Startup ideas, Artificial Intelligence, Philosophy..."
                disabled={isLoading}
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={!topic.trim() || isLoading}
              className="w-full py-3 text-sm font-semibold text-white bg-black dark:bg-white dark:text-black rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:opacity-90 shadow-lg active:scale-98 cursor-pointer"
            >
              {isLoading ? "Starting..." : "Begin Conversation"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
