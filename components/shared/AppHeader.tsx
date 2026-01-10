"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Calendar, Map, Activity, Search, User, Users, Home, Plus, DollarSign, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { createPortal } from "react-dom"
import { ThemeToggle } from "@/components/theme-toggle"

interface AppHeaderProps {
    userEmail?: string | null
}

const MENU_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Calendar", href: "/calendar", icon: Calendar },
    { label: "My Trips", href: "/my-trips", icon: Map },
    { label: "Create Trip", href: "/create-trip", icon: Plus },
    { label: "User Budget", href: "/user-budget", icon: DollarSign },
    { label: "Recommend", href: "/recommend", icon: Sparkles },
    { label: "Community", href: "/community", icon: Users },
    { label: "Search", href: "/search", icon: Search },
    { label: "Profile", href: "/profile", icon: User },
]

export default function AppHeader({ userEmail: initialEmail }: AppHeaderProps) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [userEmail, setUserEmail] = useState(initialEmail)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Fetch user email if not provided
        if (!initialEmail) {
            const supabase = createClient()
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user) {
                    setUserEmail(user.email)
                }
            })
        }
    }, [initialEmail])

    // ... return logic

    return (
        <>
            <header className="border-b border-border p-4 sticky top-0 bg-background/80 backdrop-blur-md z-50 shrink-0">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    {/* Left: Logo and Hamburger */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsOpen(true)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
                            aria-label="Open menu"
                        >
                            <Menu className="w-6 h-6 text-foreground" />
                        </button>
                        <Link href="/dashboard" className="font-bold text-2xl tracking-tighter bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                            GlobeTrotter
                        </Link>
                    </div>



                    {/* Right: Profile */}
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link href="/profile" className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
                            <span className="text-sm text-muted-foreground hidden md:block">Hello, {userEmail?.split('@')[0] || 'Traveler'}</span>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border border-border flex items-center justify-center">
                                <User className="w-4 h-4 text-white/50" />
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Portal for Hamburger Menu */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
                            />

                            {/* Slide-out Menu */}
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                style={{ backgroundColor: "var(--background)" }}
                                className="fixed top-0 left-0 h-full w-64 bg-background border-r border-border z-[100] p-6 flex flex-col gap-8 shadow-2xl overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-background z-[-1]" />
                                <div className="flex justify-between items-center relative z-10">
                                    <span className="font-bold text-xl text-foreground">Menu</span>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-secondary/50 rounded-full transition-colors"
                                        aria-label="Close menu"
                                    >
                                        <X className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                </div>

                                <nav className="flex flex-col gap-2 relative z-10">
                                    {MENU_ITEMS.map((item) => {
                                        const isActive = pathname === item.href
                                        return (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className={`
                                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                                                    ${isActive
                                                        ? "bg-secondary text-foreground shadow-lg shadow-purple-900/10 border border-border"
                                                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                                    }
                                                `}
                                            >
                                                <item.icon className={`w-5 h-5 ${isActive ? "text-purple-400" : ""}`} />
                                                <span className="font-medium">{item.label}</span>
                                            </Link>
                                        )
                                    })}
                                </nav>

                                <div className="mt-auto pt-6 border-t border-border relative z-10">
                                    <p className="text-xs text-muted-foreground text-center">
                                        © 2026 GlobeTrotter Inc.
                                    </p>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    )
}
