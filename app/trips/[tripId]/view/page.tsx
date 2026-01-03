"use client"

import { useState, useEffect, use } from "react"
import { User, Search, MapPin, Loader2, ArrowDown, Calendar, DollarSign } from "lucide-react"
import { getTripItinerary, type FullItinerary, type ItineraryStop, type ItineraryActivity } from "@/app/actions/itineraryView"
import { GlassDropdown } from "@/app/search/GlassDropdown"
import { format, differenceInCalendarDays, addDays, isSameDay } from "date-fns"

// Helper to group items by "Day X" relative to start date
// Since we have Stops and Activities, we need a flat list of events with dates to group them?
// OR, if the user requested "Day 1, Day 2", we map dates to those labels.
// Assuming Stops have `arrivalDate`. We will group stops by date. Activities belong to stops.
// If activities don't have individual dates, they inherit the Stop's date.

type DayGroup = {
    dayLabel: string // "Day 1"
    dateLabel: string // "Jan 12, 2024"
    items: (ItineraryStop | ItineraryActivity & { type: 'activity', location?: string })[]
    // Simplified: We will just show Stops and their activities nested, OR flatten them.
    // Requirement says: "Itinerary item structure ... Physical activity ... Expense".
    // "Items within the same day should appear in sequence."
    // Let's grouping by distinct Dates found in the stops.
}

export default function ItineraryViewPage({ params }: { params: Promise<{ tripId: string }> }) {
    const { tripId } = use(params)
    const [itinerary, setItinerary] = useState<FullItinerary | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Controls
    const [searchQuery, setSearchQuery] = useState("")
    const [groupBy, setGroupBy] = useState("Date")
    const [filterBy, setFilterBy] = useState("All")
    const [sortBy, setSortBy] = useState("Time")

    useEffect(() => {
        async function load() {
            setIsLoading(true)
            const data = await getTripItinerary(tripId)
            setItinerary(data)
            setIsLoading(false)
        }
        load()
    }, [tripId])

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black text-white">
                <Loader2 className="w-8 h-8 animate-spin text-white/50" />
            </div>
        )
    }

    if (!itinerary) {
        return <div className="h-screen w-full flex items-center justify-center bg-black text-white">Trip not found</div>
    }

    // --- Logic to Group by Day ---
    // We assume the trip has a startDate.
    const startDate = itinerary.trip.startDate ? new Date(itinerary.trip.startDate) : new Date()

    // 1. Flatten all relevant items (Stops) to handle them by date
    // Real implementation might need more robust handling if stops span multiple days
    // For now, grouping stops by their `arrivalDate`

    const groupedDays: Record<string, ItineraryStop[]> = {}

    itinerary.stops.forEach(stop => {
        if (!stop.arrivalDate) return
        const dateKey = format(new Date(stop.arrivalDate), "yyyy-MM-dd")
        if (!groupedDays[dateKey]) groupedDays[dateKey] = []
        groupedDays[dateKey].push(stop)
    })

    // Sort dates
    const sortedDates = Object.keys(groupedDays).sort()

    return (
        <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden selection:bg-indigo-500/30">

            {/* --- Header --- */}
            <header className="flex items-center justify-between p-4 px-6 border-b border-white/10 bg-black/60 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                        <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xl font-bold tracking-tight">GlobeTrotter</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <User className="w-5 h-5 text-white/70" />
                </div>
            </header>

            {/* --- Controls --- */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 px-6 border-b border-white/10 bg-transparent items-center justify-between shrink-0">
                <div className="flex items-center gap-3 p-2 px-4 border border-white/10 bg-white/[0.05] rounded-xl flex-1 w-full max-w-xl">
                    <Search className="w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search itinerary..."
                        className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/30"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <GlassDropdown label="Group by" value={groupBy} onChange={setGroupBy} options={[{ label: "Date", value: "Date" }]} />
                    <GlassDropdown label="Filter" value={filterBy} onChange={setFilterBy} options={[{ label: "All", value: "All" }]} />
                    <GlassDropdown label="Sort by" value={sortBy} onChange={setSortBy} options={[{ label: "Time", value: "Time" }]} />
                </div>
            </div>

            {/* --- Main Content --- */}
            <div className="flex-1 flex flex-col p-6 overflow-auto max-w-5xl mx-auto w-full">

                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-1">Itinerary for {itinerary.trip.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-white/50">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{itinerary.trip.startDate ? format(new Date(itinerary.trip.startDate), "MMM d, yyyy") : "No Date"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Budget: {itinerary.trip.budget ? `$${itinerary.trip.budget}` : "Not set"}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-8 pb-10">
                    {sortedDates.length === 0 && (
                        <div className="text-center p-10 text-white/30 border border-dashed border-white/10 rounded-xl">
                            No itinerary stops added with dates yet.
                        </div>
                    )}

                    {sortedDates.map((dateStr, idx) => {
                        const dateObj = new Date(dateStr)
                        const dayNum = startDate ? differenceInCalendarDays(dateObj, startDate) + 1 : idx + 1

                        const stopsInDay = groupedDays[dateStr]

                        return (
                            <div key={dateStr} className="flex flex-col gap-4">
                                {/* Day Header */}
                                <div className="flex items-center gap-4">
                                    <span className="text-lg font-bold text-indigo-400">Day {dayNum}</span>
                                    <div className="h-px bg-white/10 flex-1"></div>
                                    <span className="text-sm font-medium text-white/50">{format(dateObj, "EEEE, MMMM do")}</span>
                                </div>

                                {/* Itinerary Items */}
                                <div className="flex flex-col relative pl-4 border-l border-white/10 ml-2 space-y-6">
                                    {stopsInDay.map((stop) => (
                                        <div key={stop.id} className="relative group">
                                            {/* Timeline Dot */}
                                            <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-black border border-white/30 group-hover:border-indigo-500 group-hover:bg-indigo-500/20 transition-colors"></div>

                                            {/* Stop Content */}
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-start justify-between bg-white/[0.03] border border-white/5 p-4 rounded-xl hover:bg-white/[0.05] transition-colors">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-semibold text-lg">{stop.locationName}</span>
                                                        <span className="text-sm text-white/50">Location / Stop</span>
                                                    </div>
                                                    {/* Stops themselves might not have cost, but activities do. */}
                                                </div>

                                                {/* Activities for this Stop */}
                                                {stop.activities.length > 0 && (
                                                    <div className="flex flex-col gap-2 pl-4 border-l border-white/5 ml-4">
                                                        {stop.activities.map(act => (
                                                            <div key={act.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
                                                                    <span className="text-white/80">{act.title}</span>
                                                                </div>
                                                                <div className="font-mono text-white/60 text-sm">
                                                                    {act.cost ? `$${act.cost}` : "-"}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>

            </div>
        </div>
    )
}
