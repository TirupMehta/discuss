"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      className={`${
        className ? className : "fixed top-4 right-4 z-50"
      } p-2 text-black dark:text-white transition-colors duration-200 hover:opacity-60`}
      aria-label="Toggle theme"
    >
      <Sun className="w-5 h-5 stroke-[2] hidden dark:block" />
      <Moon className="w-5 h-5 stroke-[2] block dark:hidden" />
    </button>
  )
}
