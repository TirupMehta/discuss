"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signInWithPopup, signOut, onAuthStateChanged, type User } from "firebase/auth"
import { ref, get, set } from "firebase/database"
import { auth, db, googleProvider, emailToKey, getWithFallback, setWithFallback } from "@/lib/firebase"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogOut, MessageSquare, ArrowRight, Clock } from "lucide-react"

interface PreviousChat {
  id: string
  topic: string
  createdAt: number
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [topic, setTopic] = useState("")
  const [name, setName] = useState("")
  const [onboardingName, setOnboardingName] = useState("")
  const [authLoading, setAuthLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [onboardingLoading, setOnboardingLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [previousChats, setPreviousChats] = useState<PreviousChat[]>([])
  const router = useRouter()

  const loadPreviousChats = async (uid: string) => {
    try {
      const email = auth.currentUser?.email
      const emailKey = email ? emailToKey(email) : uid

      // Read both paths in parallel, swallowing errors to accommodate whatever database rules are active
      const [uidSnap, emailSnap] = await Promise.all([
        get(ref(db, `chats/${uid}`)).catch(() => null),
        emailKey !== uid ? get(ref(db, `chats/${emailKey}`)).catch(() => null) : null
      ])

      const rawUid = uidSnap && uidSnap.exists() ? uidSnap.val() : {}
      const rawEmail = emailSnap && emailSnap.exists() ? emailSnap.val() : {}

      // Merge them, giving preference to the new UID-based records if identical keys exist
      const raw = { ...rawEmail, ...rawUid }

      // Deduplicate by topic — keep only the most recent chat per topic
      const byTopic: Record<string, PreviousChat> = {}
      Object.entries(raw).forEach(([id, data]: any) => {
        const key = (data.topic || "").toLowerCase()
        if (!key) return
        if (!byTopic[key] || (data.createdAt || 0) > byTopic[key].createdAt) {
          byTopic[key] = { id, topic: data.topic, createdAt: data.createdAt || 0 }
        }
      })
      const list = Object.values(byTopic).sort((a, b) => b.createdAt - a.createdAt)
      setPreviousChats(list)
    } catch (e) {
      console.error("Error loading previous chats:", e)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        try {
          const email = currentUser.email
          const emailKey = email ? emailToKey(email) : currentUser.uid
          const snapshot = await getWithFallback(db, `users/${currentUser.uid}`, `users/${emailKey}`)
          if (snapshot.exists() && snapshot.val().name) {
            setName(snapshot.val().name)
            setNeedsOnboarding(false)
            loadPreviousChats(currentUser.uid)
          } else {
            setNeedsOnboarding(true)
          }
        } catch (error) {
          console.error("Error checking user profile:", error)
          const fallbackName = currentUser.displayName || "User"
          setName(fallbackName)
          setNeedsOnboarding(false)
        }
      } else {
        setUser(null)
        setName("")
        setPreviousChats([])
      }
      setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Reload previous chats whenever user is authenticated (handles navigating back after delete)
  useEffect(() => {
    if (user && !needsOnboarding) {
      const uid = auth.currentUser?.uid
      if (uid) loadPreviousChats(uid)
    }
  }, [user, needsOnboarding])

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
      const email = user.email
      const emailKey = email ? emailToKey(email) : user.uid
      await setWithFallback(db, `users/${user.uid}`, `users/${emailKey}`, {
        name: cleanName,
        createdAt: Date.now()
      })
      setName(cleanName)
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
    router.push(`/chat?topic=${encodeURIComponent(topic.trim())}`)
  }

  const handleOpenChat = (chat: PreviousChat) => {
    router.push(`/chat?topic=${encodeURIComponent(chat.topic)}`)
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
    <div className="min-h-screen bg-white dark:bg-black flex items-start justify-center px-6 py-16 transition-colors duration-300 relative overflow-hidden">
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

      <div className="w-full max-w-md space-y-6">
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
                placeholder="Enter your name"
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
          <>
            {/* New chat form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="text-center space-y-2">
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
                {isLoading
                  ? "Starting..."
                  : previousChats.find(c => c.topic.toLowerCase() === topic.trim().toLowerCase())
                    ? "Resume Chat"
                    : "Begin Conversation"}
              </button>
            </form>

            {/* Previous chats */}
            {previousChats.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-black/35 dark:text-white/35 uppercase tracking-widest">Previous chats</p>
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {previousChats.map(chat => (
                    <button
                      key={chat.id}
                      onClick={() => handleOpenChat(chat)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/10 dark:hover:border-white/10 transition-all group"
                    >
                      <Clock className="w-3.5 h-3.5 text-black/25 dark:text-white/25 flex-shrink-0 group-hover:text-black/50 dark:group-hover:text-white/50 transition-colors" />
                      <span className="text-sm text-black/55 dark:text-white/55 group-hover:text-black dark:group-hover:text-white transition-colors truncate flex-1">
                        {chat.topic}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
