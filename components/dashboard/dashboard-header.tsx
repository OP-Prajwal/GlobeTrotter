"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Calendar, Map, Activity, Search, User, Users } from "lucide-react"

interface DashboardHeaderProps {
    userEmail?: string | null
}

const MENU_ITEMS = [
    { label: "Calendar", href: "/calendar", icon: Calendar },
    { label: "My Trips", href: "/trips", icon: Map },
    { label: "Community", href: "/community", icon: Users },
    { label: "Activity", href: "/search?filter=Activity", icon: Activity },
    { label: "City Search", href: "/search?filter=City", icon: Search },
]

export default function DashboardHeader({ userEmail }: DashboardHeaderProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <header className="border-b border-white/10 p-4 sticky top-0 bg-black/80 backdrop-blur-md z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Left: Logo and Hamburger */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
                    >
                        <Menu className="w-6 h-6 text-white" />
                    </button>
                    <div className="font-bold text-2xl tracking-tighter bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        GlobeTrotter
                    </div>
                </div>

                {/* Right: Profile */}
                <Link href="/profile" className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
                    <span className="text-sm text-gray-400 hidden md:block">Hello, {userEmail?.split('@')[0]}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border border-white/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-white/50" />
                    </div>
                </Link>
            </div>

            {/* Hamburger Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />

                        {/* Slide-out Menu */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 h-full w-64 bg-zinc-950 border-r border-white/10 z-50 p-6 flex flex-col gap-8 shadow-2xl"
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-xl text-white">Menu</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-white/70" />
                                </button>
                            </div>

                            <nav className="flex flex-col gap-2">
                                {MENU_ITEMS.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                ))}
                            </nav>

                            <div className="mt-auto pt-6 border-t border-white/10">
                                <p className="text-xs text-white/30 text-center">
                                    © 2026 GlobeTrotter Inc.
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    )
}
