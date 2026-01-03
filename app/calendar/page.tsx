"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Search, ChevronLeft, ChevronRight, MapPin, CalendarDays, X, Calendar as CalendarIcon, Filter, Layers, CheckCircle2, Ticket } from "lucide-react"
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isWithinInterval,
    parseISO
} from "date-fns"
import { getCalendarTrips, type CalendarTrip, type CalendarStop } from "@/app/actions/calendar"
import { GlassDropdown } from "@/app/search/GlassDropdown"

const TRIP_GRADIENTS = [
    "from-blue-500 to-indigo-600",
    "from-purple-500 to-pink-600",
    "from-orange-500 to-red-600",
    "from-emerald-500 to-teal-600",
    "from-cyan-500 to-blue-600"
]

const LEGEND_COLORS = [
    { bg: "bg-emerald-500", text: "text-emerald-500", label: "Emerald" },
    { bg: "bg-blue-500", text: "text-blue-500", label: "Blue" },
    { bg: "bg-indigo-500", text: "text-indigo-500", label: "Indigo" },
    { bg: "bg-violet-500", text: "text-violet-500", label: "Violet" },
    { bg: "bg-fuchsia-500", text: "text-fuchsia-500", label: "Fuchsia" },
    { bg: "bg-rose-500", text: "text-rose-500", label: "Rose" },
    { bg: "bg-orange-500", text: "text-orange-500", label: "Orange" },
    { bg: "bg-amber-500", text: "text-amber-500", label: "Amber" },
    { bg: "bg-cyan-500", text: "text-cyan-500", label: "Cyan" },
    { bg: "bg-teal-500", text: "text-teal-500", label: "Teal" },
    { bg: "bg-lime-500", text: "text-lime-500", label: "Lime" },
    { bg: "bg-sky-500", text: "text-sky-500", label: "Sky" },
]

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [direction, setDirection] = useState(0)
    const [trips, setTrips] = useState<CalendarTrip[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTrip, setSelectedTrip] = useState<CalendarTrip | null>(null)

    // View Controls
    const [showLegend, setShowLegend] = useState(true)
    const [groupBy, setGroupBy] = useState("None")
    const [filterBy, setFilterBy] = useState("All")
    const [sortBy, setSortBy] = useState("Date")

    // Slotting Logic for stable vertical alignment
    const [tripSlots, setTripSlots] = useState<Record<string, number>>({})
    const [maxSlots, setMaxSlots] = useState(0)
    const [tripColors, setTripColors] = useState<Record<string, string>>({})

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            const data = await getCalendarTrips()
            setTrips(data)
            setIsLoading(false)
        }
        fetchData()
    }, [])

    useEffect(() => {
        if (trips.length === 0) return

        // 1. Sort trips
        const sortedTrips = [...trips].sort((a, b) => {
            const startA = new Date(a.startDate || 0).getTime()
            const startB = new Date(b.startDate || 0).getTime()
            if (startA !== startB) return startA - startB
            return (new Date(b.endDate || 0).getTime() - new Date(b.startDate || 0).getTime()) -
                (new Date(a.endDate || 0).getTime() - new Date(a.startDate || 0).getTime())
        })

        // 2. Assign slots and Colors
        const slots: Record<string, number> = {}
        const colors: Record<string, string> = {}
        const laneEndDates: number[] = []

        sortedTrips.forEach((trip, idx) => {
            // Color Assignment (Primary Gradient)
            const gradient = TRIP_GRADIENTS[idx % TRIP_GRADIENTS.length]
            colors[trip.id] = gradient

            if (!trip.startDate || !trip.endDate) return
            const start = new Date(trip.startDate).getTime()
            const end = new Date(trip.endDate).getTime()

            let assignedLane = -1
            for (let i = 0; i < laneEndDates.length; i++) {
                if (laneEndDates[i] < start) {
                    assignedLane = i
                    laneEndDates[i] = end
                    break
                }
            }
            if (assignedLane === -1) {
                assignedLane = laneEndDates.length
                laneEndDates.push(end)
            }
            slots[trip.id] = assignedLane
        })

        setTripSlots(slots)
        setTripColors(colors)
        setMaxSlots(laneEndDates.length)

    }, [trips])

    // Calendar Date Logic
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    const nextMonth = () => {
        setDirection(1)
        setCurrentDate(addMonths(currentDate, 1))
    }
    const prevMonth = () => {
        setDirection(-1)
        setCurrentDate(subMonths(currentDate, 1))
    }

    const filteredTrips = trips.filter(trip =>
        trip.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Helper functions
    const getColorForTrip = (id: string) => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % LEGEND_COLORS.length;
        return LEGEND_COLORS[index];
    }

    const visibleTrips = filteredTrips.filter(trip => {
        if (!trip.startDate || !trip.endDate) return false;
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        return (start <= endDate && end >= startDate);
    });

    const getItemsForDay = (day: Date) => {
        let items: { type: 'stop' | 'trip', data: any, tripId: string }[] = [];

        filteredTrips.forEach(trip => {
            trip.stops?.forEach(stop => {
                const stopStart = stop.arrivalDate ? new Date(stop.arrivalDate) : null
                if (stopStart && isSameDay(stopStart, day)) {
                    items.push({ type: 'stop', data: stop, tripId: trip.id })
                }
            })
        })
        return items;
    }

    const isTripActiveOnDay = (day: Date, trip: CalendarTrip) => {
        if (!trip.startDate || !trip.endDate) return false;
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        return isWithinInterval(day, { start, end });
    }

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3, type: "spring" as const, stiffness: 300, damping: 30 }
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.2 }
        })
    }

    return (
        <div className="flex flex-col h-screen bg-[#050505] text-white font-sans overflow-hidden selection:bg-indigo-500/30 relative">
            <AnimatePresence>
                {selectedTrip && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedTrip(null)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#121212] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-bold text-white tracking-tight">{selectedTrip.title}</h3>
                                    <button onClick={() => setSelectedTrip(null)} className="p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center gap-3 text-white/70">
                                        <CalendarDays className="w-5 h-5 text-indigo-400" />
                                        <span>
                                            {selectedTrip.startDate ? format(new Date(selectedTrip.startDate), "MMM d, yyyy") : "TBD"}
                                            {" - "}
                                            {selectedTrip.endDate ? format(new Date(selectedTrip.endDate), "MMM d, yyyy") : "TBD"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/70">
                                        <div className="font-mono text-green-400 bg-green-400/10 px-2 py-0.5 rounded text-sm">
                                            Budget: {selectedTrip.budget ? `$${selectedTrip.budget}` : "Not set"}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <a href={`/trips/${selectedTrip.id}/budget`} className="flex-1 bg-white text-black font-semibold py-2.5 rounded-xl text-center hover:bg-gray-200 transition-colors">
                                        View Itinerary
                                    </a>
                                    <button onClick={() => setSelectedTrip(null)} className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-white/70">
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- App Header --- */}
            <header className="flex items-center justify-between p-4 px-6 border-b border-white/5 bg-black/60 backdrop-blur-xl shrink-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <MapPin className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white/90">GlobeTrotter</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="text"
                            placeholder="Find your adventure..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-sm focus:bg-white/10 focus:border-white/20 outline-none w-48 transition-all"
                        />
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* --- Sidebar Legend (Left) --- */}
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: showLegend ? 280 : 0, opacity: showLegend ? 1 : 0 }}
                    className="h-full border-r border-white/5 bg-[#0a0a0a] flex flex-col shrink-0 overflow-hidden relative z-20"
                >
                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-semibold text-white/80 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-indigo-400" />
                            My Trips
                        </h3>
                        <span className="text-[10px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded uppercase">
                            {visibleTrips.length} Active
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {visibleTrips.length === 0 ? (
                            <div className="text-center py-10 text-white/20 text-sm">
                                <p>No trips in this view.</p>
                            </div>
                        ) : (
                            visibleTrips.map(trip => {
                                const color = getColorForTrip(trip.id)
                                return (
                                    <div
                                        key={trip.id}
                                        onClick={() => setSelectedTrip(trip)}
                                        className="group flex flex-col gap-2 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full shrink-0 ${color.bg} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm text-white/90 truncate group-hover:text-white transition-colors">
                                                    {trip.title}
                                                </div>
                                                <div className="text-[11px] text-white/40 mt-0.5 flex items-center gap-1.5">
                                                    <CalendarIcon className="w-3 h-3" />
                                                    {trip.startDate ? format(new Date(trip.startDate), "MMM d") : "?"} - {trip.endDate ? format(new Date(trip.endDate), "MMM d") : "?"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </motion.div>

                {/* --- Main Calendar Area --- */}
                <main className="flex-1 flex flex-col min-w-0 p-6 bg-gradient-to-br from-[#050505] to-[#0a0a0a] relative">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowLegend(!showLegend)}
                                className={`p-2 rounded-lg border transition-all ${showLegend ? 'bg-white/10 border-white/10 text-white' : 'border-transparent text-white/50 hover:text-white'}`}
                                title="Toggle Legend"
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                            <h2 className="text-2xl font-bold text-white tracking-tight">
                                {format(currentDate, "MMMM yyyy")}
                            </h2>
                        </div>

                        <div className="flex items-center bg-white/5 rounded-lg border border-white/5 p-1">
                            <button onClick={prevMonth} className="p-1.5 hover:bg-white/10 rounded-md text-white/70 hover:text-white transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="w-px h-4 bg-white/10 mx-1" />
                            <button onClick={nextMonth} className="p-1.5 hover:bg-white/10 rounded-md text-white/70 hover:text-white transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
                        <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02]">
                            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => (
                                <div key={day} className="py-4 text-center text-xs font-bold text-white/30 tracking-[0.2em]">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 relative overflow-hidden">
                            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                                <motion.div
                                    key={format(currentDate, "yyyy-MM")}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    className="grid grid-cols-7 w-full h-full absolute inset-0 grid-rows-6"
                                >
                                    {calendarDays.map((day) => {
                                        const items = getItemsForDay(day)
                                        const isCurrentMonth = isSameMonth(day, monthStart)
                                        const isToday = isSameDay(day, new Date())
                                        const activeTripsOnDay = filteredTrips.filter(t => isTripActiveOnDay(day, t));

                                        return (
                                            <div
                                                key={day.toString()}
                                                className={`
                                                relative border-r border-b border-white/5 p-2 flex flex-col group
                                                ${!isCurrentMonth ? "bg-white/[0.01] opacity-50" : "bg-transparent"}
                                                hover:bg-white/[0.02] transition-colors
                                            `}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className={`
                                                        text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                                                        ${isToday ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/50" : "text-white/40"}
                                                    `}>
                                                        {format(day, "d")}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto custom-scrollbar">
                                                    {activeTripsOnDay.length > 0 && items.length === 0 && (
                                                        activeTripsOnDay.map(trip => {
                                                            const color = getColorForTrip(trip.id)
                                                            return (
                                                                <div key={trip.id} className={`h-1 w-full rounded-full ${color.bg} opacity-30`} />
                                                            )
                                                        })
                                                    )}

                                                    {items.map((item, idx) => {
                                                        const color = getColorForTrip(item.tripId)
                                                        const stop = item.data as CalendarStop;

                                                        return (
                                                            <div
                                                                key={stop.id + idx}
                                                                onClick={(e) => { e.stopPropagation(); /* Maybe show stop details? */ }}
                                                                className={`
                                                                    text-[10px] px-2 py-1 rounded w-full truncate
                                                                    border-l-2 ${color.bg.replace('bg-', 'border-')}
                                                                    bg-white/5 hover:bg-white/10 transition-colors
                                                                    text-white/80 cursor-pointer shadow-sm
                                                                `}
                                                                title={stop.title}
                                                            >
                                                                {stop.title}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </main>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    )
}
