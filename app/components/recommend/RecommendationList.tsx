"use client"

import { IndianRupee, MapPin, ExternalLink, User } from "lucide-react"
import type { RecommendationItem } from "@/app/actions/recommendations"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface RecommendationListProps {
    items: RecommendationItem[]
    hasSearched: boolean
}

export function RecommendationList({ items, hasSearched }: RecommendationListProps) {
    if (!hasSearched) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards" style={{ animationDelay: '0.2s', opacity: 1 }}>
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <SearchPlaceholderIcon />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ready to explore?</h3>
                <p className="text-white/40 max-w-md">
                    Enter your budget and a location to discover what other travelers fit into their itinerary.
                </p>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-white/50">No recommendations found within this budget/location.</p>
                    <p className="text-xs text-white/30 mt-2">Try increasing the budget or checking a nearby city.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                Recommended for You
                <span className="text-xs font-normal text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{items.length} found</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <Card
                        key={item.id}
                        className="group bg-white/5 border-white/10 hover:border-indigo-500/30 overflow-hidden transition-all hover:bg-white/[0.07] hover:shadow-xl hover:-translate-y-1 relative"
                    >
                        {/* Card Content */}
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-white text-lg leading-snug group-hover:text-indigo-300 transition-colors">
                                        {item.title}
                                    </h3>
                                    {item.category && (
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 mt-1 inline-block">
                                            {item.category}
                                        </span>
                                    )}
                                </div>
                                <div className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-0.5 shrink-0">
                                    <IndianRupee className="w-3.5 h-3.5 text-white/80" />
                                    <span className="text-sm font-bold text-white">{item.cost.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-white/50 text-xs mb-6">
                                <MapPin className="w-3 h-3" />
                                <span>{item.location}</span>
                            </div>

                            {/* Footer: User Source */}
                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                                        {item.userAvatar ? (
                                            <img src={item.userAvatar} alt={item.userName} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-3 h-3 text-white/50" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-white/30 uppercase tracking-wide">From Trip</span>
                                        <span className="text-xs text-white/70 truncate max-w-[120px]">{item.tripTitle}</span>
                                    </div>
                                </div>
                                <Button
                                    variant="link"
                                    className="h-auto p-0 text-white/50 hover:text-white text-xs gap-1"
                                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.title + " " + item.location)}`, '_blank')}
                                >
                                    View <ExternalLink className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function SearchPlaceholderIcon() {
    return (
        <svg
            className="w-8 h-8 text-white/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}
