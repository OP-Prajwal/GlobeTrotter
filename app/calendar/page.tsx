"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Search, ChevronLeft, ChevronRight, MapPin, CalendarDays } from "lucide-react"
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

// Predefined gradients for trips to give them variety
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

    // Dummy states for visual controls
    const [groupBy, setGroupBy] = useState("None")
    const [filterBy, setFilterBy] = useState("All")
    const [sortBy, setSortBy] = useState("Date")

    // Fetch Trips
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            const data = await getCalendarTrips()
            setTrips(data)
            setIsLoading(false)
        }
        fetchData()
    }, [])

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

    // Helper to determine trip rendering
    const filteredTrips = trips.filter(trip =>
        trip.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getTripsForDay = (day: Date) => {
        return filteredTrips.filter(trip => {
            if (!trip.startDate || !trip.endDate) return false
            const start = new Date(trip.startDate)
            const end = new Date(trip.endDate)
            const checkDay = new Date(day.getFullYear(), day.getMonth(), day.getDate())
            const tripStart = new Date(start.getFullYear(), start.getMonth(), start.getDate())
            const tripEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate())
            return checkDay >= tripStart && checkDay <= tripEnd
        })
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
            transition: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 }
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.2 }
        })
    }

    return (
        <div className="flex flex-col h-screen bg-[#050505] text-white font-sans overflow-hidden selection:bg-indigo-500/30">

            {/* --- Glass Header --- */}
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

            {/* --- Toolbar --- */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 px-6 border-b border-white/5 bg-transparent items-center justify-between shrink-0 z-10">
                {/* Search */}
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

                {/* Controls */}
                <div className="flex items-center gap-2 shrink-0">
                    <GlassDropdown label="Group by" value={groupBy} onChange={setGroupBy} options={[{ label: "None", value: "None" }]} />
                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                    <GlassDropdown label="Filter" value={filterBy} onChange={setFilterBy} options={[{ label: "All", value: "All" }]} />
                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                    <GlassDropdown label="Sort by" value={sortBy} onChange={setSortBy} options={[{ label: "Date", value: "Date" }]} />
                </div>
            </div>

            {/* --- Main Calendar --- */}
            <div className="flex-1 flex flex-col p-6 overflow-hidden max-w-[1400px] mx-auto w-full">

                {/* Top Navigation */}
                <div className="flex items-center justify-between mb-8 relative">
                    <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/50">
                            Calendar View
                        </h2>
                        <span className="text-xs font-mono text-white/30 uppercase tracking-[0.2em] mt-1">Plan Your Year</span>
                    </div>

                    <div className="flex items-center gap-6 ml-auto mr-auto mt-16 sm:mt-0 relative z-10 bg-black/40 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
                        <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-all hover:scale-110 active:scale-95 text-white/70 hover:text-white">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="w-40 text-center font-medium text-lg tracking-wide tabular-nums">
                            {format(currentDate, "MMMM yyyy")}
                        </div>
                        <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-all hover:scale-110 active:scale-95 text-white/70 hover:text-white">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid Container */}
                <div className="flex-1 flex flex-col bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl relative">

                    {/* Headers */}
                    <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02]">
                        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => (
                            <div key={day} className="py-3 text-center text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Animated Grid Body */}
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
                                    const dayTrips = getTripsForDay(day)
                                    const isCurrentMonth = isSameMonth(day, monthStart)
                                    const isToday = isSameDay(day, new Date())

                                    return (
                                        <div
                                            key={day.toString()}
                                            className={`
                                            relative border-b border-r border-white/5 p-2 transition-colors
                                            ${isCurrentMonth ? "hover:bg-white/[0.02]" : "bg-black/40 opacity-40"}
                                        `}
                                        >
                                            {/* Date Number */}
                                            <span className={`
                                            flex items-center justify-center w-7 h-7 text-xs font-medium rounded-full mb-1
                                            ${isToday
                                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 scale-110"
                                                    : "text-white/40"}
                                        `}>
                                                {format(day, "d")}
                                            </span>

                                            {/* Trip Stack */}
                                            <div className="flex flex-col gap-1 mt-1">
                                                {dayTrips.map((trip) => {
                                                    const start = new Date(trip.startDate!)
                                                    const end = new Date(trip.endDate!)
                                                    const isStart = isSameDay(day, start)
                                                    const isEnd = isSameDay(day, end)
                                                    const isMiddle = !isStart && !isEnd

                                                    // Generate a quasi-random index for color based on ID length or chars
                                                    const colorIdx = trip.id.length % TRIP_GRADIENTS.length
                                                    const gradient = TRIP_GRADIENTS[colorIdx]

                                                    return (
                                                        <motion.div
                                                            key={trip.id}
                                                            layoutId={`trip-${trip.id}-${format(day, 'yyyy-MM-dd')}`}
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`
                                                            h-6 text-[11px] flex items-center px-2 truncate relative z-10
                                                            bg-gradient-to-r ${gradient} text-white font-medium shadow-sm cursor-pointer
                                                            ${isStart ? "rounded-l-md" : ""}
                                                            ${isEnd ? "rounded-r-md" : ""}
                                                            ${isStart && isEnd ? "rounded-md" : ""}
                                                            ${isMiddle ? "mx-[-1px]" : ""}
                                                            hover:brightness-110 hover:shadow-lg hover:z-20 transition-all
                                                        `}
                                                            title={trip.title}
                                                        >
                                                            {(isStart || day.getDay() === 0) && (
                                                                <span className="truncate drop-shadow-md">{trip.title}</span>
                                                            )}
                                                        </motion.div>
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
        </div>
    )
}
