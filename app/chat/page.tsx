"use client"

import type React from "react"
import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { generateGroupChat, continueConversation } from "@/app/actions"
import { ThemeToggle } from "@/components/theme-toggle"
import { auth, db } from "@/lib/firebase"
import { ref as dbRef, set as dbSet, get as dbGet, update as dbUpdate, push as dbPush } from "firebase/database"
import { onAuthStateChanged } from "firebase/auth"
import { toast, Toaster } from "sonner"
import { Share2, Plus, ArrowLeft, MessageSquare, Trash2 } from "lucide-react"

interface Message {
  character: string
  content: string
  isUser?: boolean
}

interface TypingIndicatorProps {
  character: string
}

function TypingIndicator({ character }: TypingIndicatorProps) {
  return (
    <div className="flex items-start space-x-4 opacity-60">
      <div className="flex-shrink-0">
        <div className="text-sm font-semibold text-black dark:text-white">{character}</div>
      </div>
      <div className="flex space-x-1 items-center mt-1">
        <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
        <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
      </div>
    </div>
  )
}

function ChatContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const topicParam = searchParams.get("topic") || ""
  const shareId = searchParams.get("share") || ""

  const [topic, setTopic] = useState(topicParam)
  const [messages, setMessages] = useState<Message[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [characters, setCharacters] = useState<string[]>([])
  const [currentTyping, setCurrentTyping] = useState<string | null>(null)
  
  const [userName, setUserName] = useState("You")
  const [userUid, setUserUid] = useState("")
  const [chatId, setChatId] = useState<string | null>(null)
  const [isSharedView, setIsSharedView] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const activeRenderIdRef = useRef<string | null>(null)
  const activeRequestIdRef = useRef<string | null>(null)
  const initializedRef = useRef(false)
  const lastParamRef = useRef("")

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentTyping])

  // 1. Auth Validation and Redirect
  useEffect(() => {
    if (shareId) {
      setAuthLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserUid(currentUser.uid)
        
        let storedName = localStorage.getItem("discuss_user_name")
        if (!storedName) {
          try {
            const snapshot = await dbGet(dbRef(db, `users/${currentUser.uid}`))
            if (snapshot.exists() && snapshot.val().name) {
              const nameFromDb = snapshot.val().name
              localStorage.setItem("discuss_user_name", nameFromDb)
              storedName = nameFromDb
            }
          } catch (e) {
            console.error("Error fetching user name:", e)
          }
        }
        
        if (storedName) {
          setUserName(storedName)
          setAuthLoading(false)
        } else {
          router.push("/")
        }
      } else {
        router.push("/")
      }
    })

    return () => unsubscribe()
  }, [shareId, router])

  // 2. Chat setup effect (runs once auth resolves)
  useEffect(() => {
    if (authLoading) return

    const activeParam = shareId ? `share:${shareId}` : `topic:${topicParam}`
    if (lastParamRef.current !== activeParam) {
      lastParamRef.current = activeParam
      initializedRef.current = false
    }

    if (!initializedRef.current) {
      initializedRef.current = true
      setupChat()
    }

    return () => {
      activeRenderIdRef.current = null
      activeRequestIdRef.current = null
      initializedRef.current = false
    }
  }, [topicParam, shareId, authLoading])

  // Sync messages to Firebase when they update in normal mode
  useEffect(() => {
    if (chatId && messages.length > 0 && !isSharedView) {
      dbSet(dbRef(db, `chats/${chatId}`), {
        topic,
        createdBy: userUid || "guest",
        createdAt: Date.now(),
        messages,
        characters
      })
    }
  }, [messages, chatId, isSharedView, topic, userUid, characters])

  const setupChat = async () => {
    if (shareId) {
      // 1. Shared View Mode
      setIsSharedView(true)
      setIsGenerating(true)
      try {
        const snapshot = await dbGet(dbRef(db, `chats/${shareId}`))
        if (snapshot.exists()) {
          const data = snapshot.val()
          setTopic(data.topic || "Shared Chat")
          setMessages(data.messages || [])
          setCharacters(data.characters || [])
          setHasInitialized(true)
        } else {
          toast.error("Shared conversation not found.")
          router.push("/")
        }
      } catch (err) {
        console.error("Error loading shared chat:", err)
        toast.error("Failed to load shared conversation.")
        router.push("/")
      } finally {
        setIsGenerating(false)
      }
    } else {
      // 2. Normal Conversation Mode
      setIsSharedView(false)

      const cachedChatId = localStorage.getItem("discuss_active_chat_id")
      if (cachedChatId) {
        try {
          const snapshot = await dbGet(dbRef(db, `chats/${cachedChatId}`))
          if (snapshot.exists() && snapshot.val().topic === topicParam) {
            const data = snapshot.val()
            setChatId(cachedChatId)
            setMessages(data.messages || [])
            setCharacters(data.characters || [])
            setHasInitialized(true)
            return
          }
        } catch (e) {
          console.warn("Error fetching cached chat, starting new...", e)
        }
      }

      // Start a new chat session
      const newChatRef = dbPush(dbRef(db, "chats"))
      const newChatId = newChatRef.key || Math.random().toString(36).substring(2, 15)
      setChatId(newChatId)
      localStorage.setItem("discuss_active_chat_id", newChatId)

      // Write to user's chat index so home page can list it
      const uid = localStorage.getItem("discuss_user_uid")
      if (uid) {
        await dbSet(dbRef(db, `users/${uid}/chats/${newChatId}`), {
          topic: topicParam,
          createdAt: Date.now()
        })
      }

      initializeChat(newChatId)
    }
  }

  const parseGroupChatResponse = (response: string): Message[] => {
    const lines = response.split("\n").filter((line) => line.trim())
    const parsedMessages: Message[] = []

    for (const line of lines) {
      const colonMatch = line.match(/^([^:]+):\s*(.+)$/)
      const dashMatch = line.match(/^([^-]+)-\s*(.+)$/)
      const spaceMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+(.+)$/)

      if (colonMatch) {
        parsedMessages.push({
          character: colonMatch[1].trim(),
          content: colonMatch[2].trim(),
        })
      } else if (dashMatch) {
        parsedMessages.push({
          character: dashMatch[1].trim(),
          content: dashMatch[2].trim(),
        })
      } else if (spaceMatch && spaceMatch[1].length < 20) {
        parsedMessages.push({
          character: spaceMatch[1].trim(),
          content: spaceMatch[2].trim(),
        })
      }
    }

    return parsedMessages
  }

  const displayMessagesSequentially = async (newMessages: Message[]) => {
    const currentRenderId = Math.random().toString()
    activeRenderIdRef.current = currentRenderId

    for (let i = 0; i < newMessages.length; i++) {
      const message = newMessages[i]

      if (activeRenderIdRef.current !== currentRenderId) return

      setCurrentTyping(message.character)

      const delay = i === 0 ? (Math.random() * 800 + 500) : (Math.random() * 3000 + 1000)
      await new Promise((resolve) => setTimeout(resolve, delay))

      if (activeRenderIdRef.current !== currentRenderId) {
        setCurrentTyping(null)
        return
      }

      setCurrentTyping(null)
      setMessages((prev) => [...prev, message])

      if (i < newMessages.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    if (activeRenderIdRef.current === currentRenderId) {
      activeRenderIdRef.current = null
    }
  }

  const initializeChat = async (activeChatId: string) => {
    setIsGenerating(true)
    const requestId = Math.random().toString()
    activeRequestIdRef.current = requestId

    const tryGenerate = async (): Promise<Message[]> => {
      const response = await generateGroupChat(topicParam, userName)
      return parseGroupChatResponse(response)
    }

    try {
      let parsedMessages: Message[] = []
      try {
        parsedMessages = await tryGenerate()
      } catch (err: any) {
        console.warn("First initialize attempt failed, retrying...", err)
        if (activeRequestIdRef.current !== requestId) return
        toast.error(err.message || "First attempt failed, retrying...")
        await new Promise((resolve) => setTimeout(resolve, 1500))
        if (activeRequestIdRef.current !== requestId) return
        parsedMessages = await tryGenerate()
      }

      if (activeRequestIdRef.current !== requestId) return

      if (parsedMessages.length === 0) {
        console.warn("First initialize parse returned empty, retrying...")
        await new Promise((resolve) => setTimeout(resolve, 1500))
        if (activeRequestIdRef.current !== requestId) return
        parsedMessages = await tryGenerate()
      }

      if (activeRequestIdRef.current !== requestId) return

      if (parsedMessages.length > 0) {
        const uniqueCharacters = [...new Set(parsedMessages.map((m) => m.character))]
        setCharacters(uniqueCharacters)
        setIsGenerating(false)
        await displayMessagesSequentially(parsedMessages)
        setHasInitialized(true)
      } else {
        throw new Error("Failed to generate content after retry")
      }
    } catch (error: any) {
      console.error("Error generating chat, using fallback:", error)
      if (activeRequestIdRef.current !== requestId) return
      
      toast.error(error.message || "Failed to initialize discussion.")
      const fallbackChars = ["Vishwa", "Riya", "Aarav"]
      setCharacters(fallbackChars)
      const fallbackMessages: Message[] = [
        { character: "Vishwa", content: `Hey everyone, let's talk about ${topicParam || "this topic"}!` },
        { character: "Riya", content: "Great topic! What are your thoughts on this?" }
      ]
      setIsGenerating(false)
      await displayMessagesSequentially(fallbackMessages)
    } finally {
      if (activeRequestIdRef.current === requestId) {
        setIsGenerating(false)
      }
    }
  }

  const handleUserMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim() || isSharedView) return

    activeRenderIdRef.current = null
    setCurrentTyping(null)

    const requestId = Math.random().toString()
    activeRequestIdRef.current = requestId

    const userMessage: Message = {
      character: userName,
      content: userInput.trim(),
      isUser: true,
    }

    const currentShownMessages = [...messages]
    setMessages((prev) => [...prev, userMessage])
    setUserInput("")
    setIsGenerating(true)

    let chatCharacters = characters
    if (chatCharacters.length === 0 && currentShownMessages.length > 0) {
      chatCharacters = [...new Set(currentShownMessages.map((m) => m.character).filter((c) => c !== userName))]
      setCharacters(chatCharacters)
    }

    const tryContinue = async (): Promise<Message[]> => {
      const recentMessages = currentShownMessages.slice(-20)
      const formattedHistory = recentMessages.map((m) => {
        if (m.character === userName || m.isUser) {
          return `${userName}: ${m.content}`
        } else {
          return `${m.character}: ${m.content}`
        }
      })
      const newHistory = [`Topic: ${topicParam}`, ...formattedHistory, `${userName}: ${userMessage.content}`]
      const response = await continueConversation(newHistory, chatCharacters, userMessage.content, userName)
      return parseGroupChatResponse(response)
    }

    try {
      let parsedMessages: Message[] = []
      try {
        parsedMessages = await tryContinue()
      } catch (err: any) {
        console.warn("First message continue attempt failed, retrying...", err)
        if (activeRequestIdRef.current !== requestId) return
        toast.error(err.message || "Failed, retrying...")
        await new Promise((resolve) => setTimeout(resolve, 1500))
        if (activeRequestIdRef.current !== requestId) return
        parsedMessages = await tryContinue()
      }

      if (activeRequestIdRef.current !== requestId) return

      if (parsedMessages.length === 0) {
        console.warn("First message continue parse returned empty, retrying...")
        await new Promise((resolve) => setTimeout(resolve, 1500))
        if (activeRequestIdRef.current !== requestId) return
        parsedMessages = await tryContinue()
      }

      if (activeRequestIdRef.current !== requestId) return

      if (parsedMessages.length > 0) {
        setIsGenerating(false)
        await displayMessagesSequentially(parsedMessages)
      } else {
        throw new Error("Failed to continue conversation after retry")
      }
    } catch (error: any) {
      console.error("Error continuing conversation, using fallback:", error)
      if (activeRequestIdRef.current !== requestId) return

      toast.error(error.message || "Failed to continue conversation.")
      const fallbackReplies = [
        "Sorry, my internet connection is acting up. What were we saying?",
        "Wait, what? I think my connection just lagged out. Can you say that again?",
        "Whoa, lag spike! I didn't catch that, say it again?",
        "Oops, my messages are failing to send. Hold on a second."
      ]
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)]
      const randomChar = chatCharacters.length > 0 
        ? chatCharacters[Math.floor(Math.random() * chatCharacters.length)] 
        : "Vishwa"
      
      const fallbackMessages: Message[] = [
        { character: randomChar, content: randomReply }
      ]
      setIsGenerating(false)
      await displayMessagesSequentially(fallbackMessages)
    } finally {
      if (activeRequestIdRef.current === requestId) {
        setIsGenerating(false)
      }
    }
  }

  const handleNewChat = () => {
    localStorage.removeItem("discuss_active_chat_id")
    router.push("/")
  }

  const handleDeleteChat = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      setTimeout(() => setDeleteConfirm(false), 3000)
      return
    }
    if (chatId) {
      try {
        const { remove } = await import("firebase/database")
        await remove(dbRef(db, `chats/${chatId}`))
        // Also remove from user's chat index
        const uid = localStorage.getItem("discuss_user_uid") || userUid
        if (uid) {
          await remove(dbRef(db, `users/${uid}/chats/${chatId}`))
        }
      } catch (e) {
        console.error("Error deleting chat:", e)
      }
    }
    localStorage.removeItem("discuss_active_chat_id")
    router.push("/")
  }

  const handleShare = async () => {
    if (!chatId) return
    try {
      await dbUpdate(dbRef(db, `chats/${chatId}`), { isPublic: true })
      const shareUrl = `${window.location.origin}/chat?share=${chatId}`
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Share link copied to clipboard!")
    } catch (e) {
      console.error("Error sharing chat:", e)
      toast.error("Failed to generate share link.")
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center transition-colors duration-300">
        <div className="w-10 h-10 border-4 border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold tracking-wide text-black/50 dark:text-white/50 uppercase">Verifying session</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 flex flex-col relative overflow-hidden">
      <Toaster position="top-center" richColors />
      
      {/* Header Bar */}
      <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-black/70 backdrop-blur-md border-b border-black/5 dark:border-white/5 transition-all">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-xs font-semibold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors py-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          
          <span className="text-sm font-bold text-black dark:text-white tracking-tight max-w-[50%] truncate px-2">
            {topic || "Chat"}
          </span>

          <div className="flex items-center gap-2">
            {!isSharedView && chatId && (
              <>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  title="Share Chat"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDeleteChat}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    deleteConfirm
                      ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                      : "text-black/40 dark:text-white/40 hover:text-red-500 hover:bg-red-500/5"
                  }`}
                  title="Delete Chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleteConfirm && <span>Sure?</span>}
                </button>
              </>
            )}
            {!isSharedView && (
              <button
                onClick={handleNewChat}
                className="p-2 rounded-lg text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="New Chat"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            <ThemeToggle className="relative top-0 right-0 z-auto" />
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-8 pb-40">
        {isGenerating && !hasInitialized && (
          <div className="text-center py-8 opacity-60 animate-pulse">
            <p className="text-sm text-black dark:text-white">Connecting to chat...</p>
            <div className="flex justify-center mt-4 space-x-2">
              <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message, index) => {
            const isMe = message.character === userName || message.isUser
            return (
              <div
                key={index}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                }}
              >
                <div className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"} max-w-sm`}>
                  <span className="text-xs font-semibold text-black dark:text-white opacity-70">{message.character}</span>
                  <p className="text-sm leading-relaxed text-black dark:text-white">
                    {message.content}
                  </p>
                </div>
              </div>
            )
          })}

          {currentTyping && (
            <div className="flex justify-start">
              <TypingIndicator character={currentTyping} />
            </div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Input / Share Banner at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-black/70 backdrop-blur-md border-t border-black/10 dark:border-white/10 transition-all duration-300 z-40">
        <div className="max-w-2xl mx-auto px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          {isSharedView ? (
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-black dark:text-white">Viewing Shared Chat</p>
                <p className="text-xs text-black/60 dark:text-white/60">This discussion is read-only. Create your own chat!</p>
              </div>
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-black dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-md"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Start Chat
              </button>
            </div>
          ) : (
            <form onSubmit={handleUserMessage} className="w-full flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Say something..."
                className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-black text-black dark:text-white border border-black/10 dark:border-white/10 rounded focus:outline-none focus:border-black/30 dark:focus:border-white/30 transition-all placeholder:text-black/40 dark:placeholder:text-white/40"
                autoFocus
                disabled={isGenerating}
              />
              <button
                type="submit"
                disabled={!userInput.trim() || isGenerating}
                className="px-5 py-2.5 text-sm font-medium text-white bg-black dark:text-black dark:bg-white rounded disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90 cursor-pointer"
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <p className="text-sm opacity-60">Loading chat...</p>
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}
