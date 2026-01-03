"use client"

import { useState } from "react"
import { Sparkles, User } from "lucide-react"
import { RecommendationFilters } from "@/app/components/recommend/RecommendationFilters"
import { RecommendationList } from "@/app/components/recommend/RecommendationList"
import { getRecommendations, type RecommendationItem } from "@/app/actions/recommendations"

export default function RecommendPage() {
    const [items, setItems] = useState<RecommendationItem[]>([])
    const [loading, setLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    const handleSearch = async (budget: number, location: string, date: string, activity: string) => {
        setLoading(true)
        setHasSearched(true)
        const results = await getRecommendations(budget, location, date, activity)
        setItems(results)
        setLoading(false)
    }

    return (
        <div className="flex flex-col h-screen bg-[#050505] text-white font-sans overflow-hidden selection:bg-indigo-500/30">
            {/* Header */}
            <header className="flex items-center justify-between p-4 px-6 border-b border-white/10 bg-black/60 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center border border-white/10">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">GlobeTrotter AI</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                    <User className="w-5 h-5 text-white/70" />
                </div>
            </header>

            <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="max-w-6xl mx-auto pb-20">
                    <div className="mb-8 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
                            AI-Powered Travel Agent
                        </h1>
                        <p className="text-white/50 max-w-xl">
                            Tell us where, when, and what you love. Gemini AI will curate perfect experiences fitting your budget.
                        </p>
                    </div>

                    <RecommendationFilters onSearch={handleSearch} loading={loading} />

                    <RecommendationList items={items} hasSearched={hasSearched} />
                </div>
            </main>
        </div>
    )
}
