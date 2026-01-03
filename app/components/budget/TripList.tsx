"use client"

import { ArrowRight, CalendarDays } from "lucide-react"
import type { BudgetTripSummary } from "@/app/actions/budget"
import { format } from "date-fns"

interface TripListProps {
    trips: BudgetTripSummary[]
    selectedTripId: string | null
    onSelectTrip: (id: string) => void
}

export function TripList({ trips, selectedTripId, onSelectTrip }: TripListProps) {
    if (trips.length === 0) {
        return (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center h-[500px] flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/5">
                    <CalendarDays className="w-6 h-6 text-white/30" />
                </div>
                <h3 className="text-white/80 font-medium">No trips found</h3>
                <p className="text-white/40 text-sm mt-1">Try changing the time filter.</p>
            </div>
        )
    }

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-white/10 bg-white/[0.02]">
                <h3 className="font-semibold text-white/80">Your Trips</h3>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
                {trips.map(trip => (
                    <div
                        key={trip.id}
                        onClick={() => onSelectTrip(trip.id)}
                        className={`
                            p-4 border-b border-white/5 cursor-pointer transition-all relative group
                            ${selectedTripId === trip.id ? "bg-white/[0.08] border-l-4 border-l-indigo-400" : "border-l-4 border-l-transparent hover:bg-white/[0.04]"}
                        `}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h4 className={`font-medium transition-colors ${selectedTripId === trip.id ? "text-white" : "text-white/80 group-hover:text-white"}`}>
                                {trip.title}
                            </h4>
                            <span className="font-bold text-white text-sm bg-white/10 px-2 py-0.5 rounded">₹{trip.totalSpent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-white/40 group-hover:text-white/60 transition-colors">
                            <span>
                                {trip.startDate ? format(new Date(trip.startDate), "MMM yyyy") : "Undated"}
                            </span>
                            {selectedTripId === trip.id && <ArrowRight className="w-3 h-3 text-indigo-400" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
