"use client"

import { Calendar } from "lucide-react"

interface TimeNavigatorProps {
    year: string
    month: string
    onYearChange: (year: string) => void
    onMonthChange: (month: string) => void
}

const YEARS = ["All", "2023", "2024", "2025", "2026"]
const MONTHS = [
    { value: "All", label: "All Months" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
]

export function TimeNavigator({ year, month, onYearChange, onMonthChange }: TimeNavigatorProps) {
    return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 border border-white/5">
                    <Calendar className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white/90">Time Period</h3>
                    <p className="text-xs text-white/40">Filter your spending</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <select
                    value={year}
                    onChange={(e) => onYearChange(e.target.value)}
                    className="bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none font-medium min-w-[100px] hover:border-white/20 transition-colors"
                >
                    {YEARS.map(y => <option key={y} value={y} className="bg-neutral-900">{y === "All" ? "All Years" : y}</option>)}
                </select>

                <select
                    value={month}
                    onChange={(e) => onMonthChange(e.target.value)}
                    className="bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none font-medium min-w-[140px] hover:border-white/20 transition-colors"
                >
                    {MONTHS.map(m => <option key={m.value} value={m.value} className="bg-neutral-900">{m.label}</option>)}
                </select>
            </div>
        </div>
    )
}
