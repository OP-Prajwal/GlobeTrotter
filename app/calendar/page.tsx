"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Search, ChevronLeft, ChevronRight, MapPin, CalendarDays, X } from "lucide-react"
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
} from "date-fns"
import { getCalendarTrips, type CalendarTrip } from "@/app/actions/calendar"
import { GlassDropdown } from "@/app/search/GlassDropdown"

const TRIP_GRADIENTS = [
    "from-blue-500 to-indigo-600",
    "from-purple-500 to-pink-600",
    "from-orange-500 to-red-600",
    "from-emerald-500 to-teal-600",
    "from-cyan-500 to-blue-600"
]

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [direction, setDirection] = useState(0) // -1 for prev, 1 for next
    const [trips, setTrips] = useState<CalendarTrip[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTrip, setSelectedTrip] = useState<CalendarTrip | null>(null)

    // Dummy states for visual controls
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

        // 1. Sort trips by start date, then duration
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
            // Color Assignment
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

    // Filter Logic
    const filteredTrips = trips.filter(trip =>
        trip.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getTripForSlot = (day: Date, slotIndex: number) => {
        const trip = filteredTrips.find(t => {
            if (tripSlots[t.id] !== slotIndex) return false
            if (!t.startDate || !t.endDate) return false

            const start = new Date(t.startDate)
            const end = new Date(t.endDate)
            // Normalize to start of day for comparison
            const sysStart = new Date(start.getFullYear(), start.getMonth(), start.getDate())
            const sysEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate())
            const checkDay = new Date(day.getFullYear(), day.getMonth(), day.getDate())

            return checkDay >= sysStart && checkDay <= sysEnd
        })
        return trip
    }

    // Animation Variants
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
                    <>
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
                                        <button
                                            onClick={() => setSelectedTrip(null)}
                                            className="p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                                        >
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
                                        <a
                                            href={`/trips/${selectedTrip.id}/budget`}
                                            className="flex-1 bg-white text-black font-semibold py-2.5 rounded-xl text-center hover:bg-gray-200 transition-colors"
                                        >
                                            View Itinerary
                                        </a>
                                        <button
                                            onClick={() => setSelectedTrip(null)}
                                            className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-white/70"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* --- Header (Dark) --- */}
            <header className="flex items-center justify-between p-4 px-6 border-b border-white/5 bg-black/60 backdrop-blur-xl shrink-0 z-20">
                <div className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-colors">
                        <MapPin className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        GlobeTrotter
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer ring-1 ring-transparent hover:ring-white/10">
                    <User className="w-5 h-5 text-white/70" />
                </div>
            </header>

            {/* --- Toolbar (Dark) --- */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 px-6 border-b border-white/5 bg-transparent items-center justify-between shrink-0 z-10 transition-all">
                <div className="flex items-center gap-3 p-2.5 px-4 border border-white/10 bg-white/[0.03] rounded-xl focus-within:bg-white/[0.05] focus-within:border-white/20 transition-all w-full max-w-xl group shadow-sm hover:shadow-md hover:shadow-indigo-500/5">
                    <Search className="w-4 h-4 text-white/40 group-focus-within:text-white/70 transition-colors" />
                    <input
                        type="text"
                        placeholder="Find your adventure..."
                        className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/30"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <GlassDropdown label="Group by" value={groupBy} onChange={setGroupBy} options={[{ label: "None", value: "None" }]} />
                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                    <GlassDropdown label="Filter" value={filterBy} onChange={setFilterBy} options={[{ label: "All", value: "All" }]} />
                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                    <GlassDropdown label="Sort by" value={sortBy} onChange={setSortBy} options={[{ label: "Date", value: "Date" }]} />
                </div>
            </div>

            {/* --- Content Area: Split View --- */}
            <div className="flex-1 flex overflow-hidden">

                {/* 1. Main Calendar Area */}
                <div className="flex-1 flex flex-col p-6 overflow-hidden max-w-[1400px] mx-auto w-full">

                    {/* Top Navigation (Dark Text for Title) */}
                    <div className="flex items-center justify-between mb-6 relative shrink-0">
                        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/50">
                                Calendar View
                            </h2>
                            <span className="text-xs font-mono text-white/30 uppercase tracking-[0.2em] mt-1">Plan Your Year</span>
                        </div>
                        <div className="flex items-center gap-6 relative z-10 bg-black/40 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
                            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-all hover:scale-110 active:scale-95 text-white/70 hover:text-white">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="w-40 text-center font-medium text-lg tracking-wide tabular-nums text-white">
                                {format(currentDate, "MMMM yyyy")}
                            </div>
                            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-all hover:scale-110 active:scale-95 text-white/70 hover:text-white">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* --- Calendar Grid (DARK) --- */}
                    <div className="flex-1 flex flex-col bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl relative">
                        <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02]">
                            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => (
                                <div key={day} className="py-3 text-center text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
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
                                    className="grid grid-cols-7 grid-rows-6 h-full w-full absolute inset-0"
                                >
                                    {calendarDays.map((day, dayIdx) => {
                                        const isCurrentMonth = isSameMonth(day, monthStart)
                                        const isToday = isSameDay(day, new Date())
                                        return (
                                            <div
                                                key={day.toString()}
                                                className={`
                                                relative border-b border-r border-white/5 transition-colors flex flex-col
                                                ${isCurrentMonth ? "hover:bg-white/[0.02]" : "bg-black/40 opacity-40"}
                                            `}
                                            >
                                                <div className="flex justify-end mb-1 p-1">
                                                    <span className={`
                                                    flex items-center justify-center w-6 h-6 text-[10px] font-medium rounded-full
                                                    ${isToday ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40" : "text-white/30"}
                                                `}>
                                                        {format(day, "d")}
                                                    </span>
                                                </div>
                                                <div className="flex-1 flex flex-col gap-[2px] overflow-hidden w-full">
                                                    {Array.from({ length: Math.min(maxSlots + 1, 6) }).map((_, slotIdx) => {
                                                        const trip = getTripForSlot(day, slotIdx)
                                                        if (!trip) return <div key={`empty-${slotIdx}`} className="h-4 w-full" />

                                                        const start = new Date(trip.startDate!)
                                                        const end = new Date(trip.endDate!)
                                                        const isStart = isSameDay(day, start)
                                                        const isEnd = isSameDay(day, end)
                                                        const isMiddle = !isStart && !isEnd

                                                        const gradient = tripColors[trip.id] || TRIP_GRADIENTS[0]

                                                        return (
                                                            <motion.div
                                                                key={trip.id}
                                                                layoutId={`trip-${trip.id}-${format(day, 'yyyy-MM-dd')}`}
                                                                onClick={(e) => { e.stopPropagation(); setSelectedTrip(trip) }}
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                className={`
                                                                h-4 flex items-center relative z-10 cursor-pointer
                                                                bg-gradient-to-r ${gradient} shadow-sm
                                                                ${isStart ? "ml-1 rounded-l-full" : ""}
                                                                ${isEnd ? "mr-1 rounded-r-full" : ""}
                                                                ${isMiddle ? "w-[calc(100%+1px)]" : ""} 
                                                                hover:brightness-125 transition-all
                                                            `}
                                                            />
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
                </div>


                {/* 2. Legend Sidebar (Dark) */}
                <div className="w-80 bg-[#0A0A0A] border-l border-white/10 flex flex-col p-6 overflow-y-auto shrink-0 z-20 shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-6">Trips</h3>
                    <div className="space-y-3">
                        {trips.map(trip => {
                            const gradient = tripColors[trip.id] || TRIP_GRADIENTS[0]
                            return (
                                <div
                                    key={trip.id}
                                    onClick={() => setSelectedTrip(trip)}
                                    className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${gradient} shadow-sm ring-1 ring-white/10`} />
                                        <span className="font-semibold text-sm text-white/90 truncate">{trip.title}</span>
                                    </div>
                                    <div className="text-xs text-white/50 pl-6 flex flex-col gap-1">
                                        <span>
                                            {trip.startDate ? format(new Date(trip.startDate), "MMM d") : "?"} -
                                            {trip.endDate ? format(new Date(trip.endDate), "MMM d, yyyy") : "?"}
                                        </span>
                                        {trip.budget && (
                                            <span className="text-white/30 font-mono text-[10px]">${trip.budget}</span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                        {trips.length === 0 && (
                            <div className="text-white/30 text-center py-10 text-sm italic">
                                No trips found.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
