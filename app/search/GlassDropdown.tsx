"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface DropdownOption {
    label: string
    value: string
}

interface GlassDropdownProps {
    label: string
    value: string
    onChange: (value: string) => void
    options: DropdownOption[]
}

export function GlassDropdown({ label, value, onChange, options }: GlassDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const selectedOption = options.find(opt => opt.value === value)

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-black/60 border border-white/10 rounded-lg hover:bg-black/80 hover:border-white/20 transition-all text-white text-sm font-medium backdrop-blur-sm"
            >
                <span className="text-white/50 text-xs">{label}:</span>
                <span>{selectedOption?.label || value}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 right-0 min-w-[200px] bg-black border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onChange(option.value)
                                setIsOpen(false)
                            }}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors ${option.value === value
                                ? "bg-indigo-600/20 text-indigo-300 font-medium"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
