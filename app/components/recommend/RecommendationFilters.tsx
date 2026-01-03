"use client"

import { useState } from "react"
import { Search, MapPin, IndianRupee, Calendar, Sparkles } from "lucide-react"

interface RecommendationFiltersProps {
    onSearch: (budget: number, location: string, date: string, activity: string) => void
    loading: boolean
}

export function RecommendationFilters({ onSearch, loading }: RecommendationFiltersProps) {
    const [budget, setBudget] = useState<string>("")
    const [location, setLocation] = useState<string>("")
    const [date, setDate] = useState<string>("")
    const [activity, setActivity] = useState<string>("")

    const handleSearch = () => {
        if (!budget || !location) return
        onSearch(parseFloat(budget), location, date, activity)
    }

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Budget Input */}
                <div className="relative">
                    <label className="text-xs text-white/50 mb-1.5 block font-medium uppercase tracking-wide">Max Budget</label>
                    <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            placeholder="e.g. 5000"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                    </div>
                </div>

                {/* Location Input */}
                <div className="relative">
                    <label className="text-xs text-white/50 mb-1.5 block font-medium uppercase tracking-wide">Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="City or Region"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                    </div>
                </div>

                {/* Date Input */}
                <div className="relative">
                    <label className="text-xs text-white/50 mb-1.5 block font-medium uppercase tracking-wide">When?</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all [color-scheme:dark]"
                        />
                    </div>
                </div>

                {/* Activity Input */}
                <div className="relative">
                    <label className="text-xs text-white/50 mb-1.5 block font-medium uppercase tracking-wide">Interests</label>
                    <div className="relative">
                        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            value={activity}
                            onChange={(e) => setActivity(e.target.value)}
                            placeholder="e.g. Hiking, Food..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Search Button */}
            <div className="mt-4">
                <button
                    onClick={handleSearch}
                    disabled={loading || !budget || !location}
                    className="w-full h-[50px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-indigo-500/20"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Generate AI Recommendations
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
