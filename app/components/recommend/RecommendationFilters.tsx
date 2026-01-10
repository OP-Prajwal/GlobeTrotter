"use client"

import { useState } from "react"
import { Search, MapPin, IndianRupee, Calendar, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

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
        <Card className="mb-8 border-white/10 bg-white/5 backdrop-blur-md">
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Budget Input */}
                    <div className="relative">
                        <label className="text-xs text-white/50 mb-1.5 block font-medium uppercase tracking-wide">Max Budget</label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 z-10" />
                            <Input
                                type="number"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                placeholder="e.g. 5000"
                                className="pl-10 bg-black/40 border-white/10 focus-visible:ring-indigo-500/50"
                            />
                        </div>
                    </div>

                    {/* Location Input */}
                    <div className="relative">
                        <label className="text-xs text-white/50 mb-1.5 block font-medium uppercase tracking-wide">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 z-10" />
                            <Input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="City or Region"
                                className="pl-10 bg-black/40 border-white/10 focus-visible:ring-indigo-500/50"
                            />
                        </div>
                    </div>

                    {/* Date Input */}
                    <div className="relative">
                        <label className="text-xs text-white/50 mb-1.5 block font-medium uppercase tracking-wide">When?</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 z-10" />
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="pl-10 bg-black/40 border-white/10 focus-visible:ring-indigo-500/50 [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Activity Input */}
                    <div className="relative">
                        <label className="text-xs text-white/50 mb-1.5 block font-medium uppercase tracking-wide">Interests</label>
                        <div className="relative">
                            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 z-10" />
                            <Input
                                type="text"
                                value={activity}
                                onChange={(e) => setActivity(e.target.value)}
                                placeholder="e.g. Hiking, Food..."
                                className="pl-10 bg-black/40 border-white/10 focus-visible:ring-indigo-500/50"
                            />
                        </div>
                    </div>
                </div>

                {/* Search Button */}
                <div className="mt-4">
                    <Button
                        onClick={handleSearch}
                        disabled={loading || !budget || !location}
                        className="w-full h-[50px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Curating...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group">
                                <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>Generate AI Recommendations</span>
                            </div>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
