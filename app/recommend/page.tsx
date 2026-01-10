"use client"

import { useState } from "react"
import { toast } from "sonner"
import { RecommendationFilters } from "@/app/components/recommend/RecommendationFilters"
import { RecommendationList } from "@/app/components/recommend/RecommendationList"
import { getRecommendations, type RecommendationItem } from "@/app/actions/recommendations"
import AppHeader from "@/components/shared/AppHeader"

export default function RecommendPage() {
    const [items, setItems] = useState<RecommendationItem[]>([])
    const [loading, setLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    const handleSearch = async (budget: number, location: string, date: string, activity: string) => {
        try {
            setLoading(true)
            setHasSearched(true)
            const results = await getRecommendations(budget, location, date, activity)
            setItems(results)

            if (results.length > 0) {
                toast.success(`Found ${results.length} recommendations!`)
            } else {
                toast.info("No exact matches found, try adjusting your budget.")
            }
        } catch (error) {
            console.error("Search error:", error)
            toast.error("Failed to fetch recommendations. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-screen bg-[#050505] text-white font-sans overflow-hidden selection:bg-indigo-500/30">
            {/* Header */}
            <AppHeader />

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
