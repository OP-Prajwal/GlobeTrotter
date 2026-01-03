"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check } from "lucide-react"

interface Option {
    label: string
    value: string
}

interface GlassDropdownProps {
    label: string
    value: string
    options: Option[]
    onChange: (value: string) => void
}

export function GlassDropdown({ label, value, options, onChange }: GlassDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const selectedLabel = options.find((opt) => opt.value === value)?.label || value

    return (
        <div ref={containerRef} className="relative z-50">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white/60 hidden sm:inline-block">{label}:</span>

                <motion.button
                    whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm text-white bg-black/40 border transition-colors rounded-lg outline-none min-w-[140px] justify-between ${isOpen ? "border-white/40" : "border-white/10"
                        }`}
                >
                    <span className="truncate">{selectedLabel}</span>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-4 h-4 text-white/50" />
                    </motion.div>
                </motion.button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-50 origin-top-right"
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value)
                                    setIsOpen(false)
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors hover:bg-white/10 ${option.value === value ? "text-white bg-white/5" : "text-white/70"
                                    }`}
                            >
                                {option.label}
                                {option.value === value && <Check className="w-3.5 h-3.5 text-white" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
