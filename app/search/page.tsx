"use client"

import { useSearchParams } from "next/navigation"
import { useState, useMemo, useEffect } from "react"
import { User, Search, Loader2, MapPin } from "lucide-react"
import { searchDestinations } from "@/app/actions/destinations"
import { searchActivities } from "@/app/actions/activities"
import { GlassDropdown } from "./GlassDropdown"

// --- Types ---
interface SearchItem {
    id: string
    name: string
    type: "City" | "Activity" | "Attraction"
    category: string
    details: string
}

export default function SearchScreen() {
    const searchParams = useSearchParams()
    const initialFilter = searchParams.get("filter") as "City" | "Activity" | "Attraction" | null

    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchItem[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const [filterType, setFilterType] = useState<"All" | "City" | "Activity" | "Attraction">(initialFilter && ["City", "Activity", "Attraction"].includes(initialFilter) ? initialFilter : "All")
    const [groupBy, setGroupBy] = useState<"None" | "Type" | "Category">("None")
    const [sortBy, setSortBy] = useState<"NameAsc" | "NameDesc">("NameAsc")

    // --- Real-Time Search Logic ---
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 3) {
                setIsLoading(true)
                try {
                    // Split Search: Call independent services and merge
                    const [destinations, activities] = await Promise.all([
                        searchDestinations(query),
                        searchActivities(query)
                    ])

                    // Allow helper function to normalize types if needed, or rely on Server Actions
                    setResults([...destinations, ...activities] as SearchItem[])
                } catch (err) {
                    console.error(err)
                } finally {
                    setIsLoading(false)
                }
            } else {
                setResults([])
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [query])

    // --- Logic (Client-side filtering/sorting of fetched results) ---
    const filteredAndSortedData = useMemo(() => {
        let result = results

        // 1. Filter
        if (filterType !== "All") {
            result = result.filter(item => item.type === filterType)
        }

        // 2. Sort
        result = [...result].sort((a, b) => {
            if (sortBy === "NameAsc") return a.name.localeCompare(b.name)
            if (sortBy === "NameDesc") return b.name.localeCompare(a.name)
            return 0
        })

        return result
    }, [results, filterType, sortBy])

    const groupedData = useMemo(() => {
        if (groupBy === "None") return { "All Results": filteredAndSortedData }

        // Grouping Logic
        const groups: Record<string, SearchItem[]> = {}
        filteredAndSortedData.forEach(item => {
            const key = groupBy === "Type" ? item.type : item.category
            if (!groups[key]) groups[key] = []
            groups[key].push(item)
        })
        return groups
    }, [filteredAndSortedData, groupBy])

    return (
        <div className="flex flex-col h-screen overflow-hidden font-sans bg-black text-white selection:bg-white/30">
            {/* --- Top Header Row --- */}
            <header className="flex items-center justify-between p-4 border-b border-white/10 bg-black/70 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                        <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xl font-bold tracking-tight">GlobeTrotter</div>
                </div>
                <div className="flex items-center justify-center w-10 h-10 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer">
                    <User className="w-5 h-5 text-white/80" />
                </div>
            </header>

            {/* --- Control Row --- */}
            <div className="flex gap-4 p-4 border-b border-white/10 shrink-0 bg-transparent items-center sticky top-0 z-10">
                {/* Search Bar */}
                <div className="flex items-center flex-1 gap-2 p-2 px-3 border border-white/10 bg-black/40 rounded-lg focus-within:border-white/40 transition-colors">
                    <Search className="w-4 h-4 text-white/50" />
                    <input
                        type="text"
                        placeholder="Search destination or activity..."
                        className="flex-1 bg-transparent outline-none text-white placeholder-white/40"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-white/50" />}
                </div>

                {/* Controls Container */}
                <div className="flex bg-black/40 border border-white/10 rounded-lg p-1 gap-1">
                    <GlassDropdown
                        label="Group by"
                        value={groupBy}
                        onChange={(val) => setGroupBy(val as any)}
                        options={[
                            { label: "None", value: "None" },
                            { label: "Type", value: "Type" },
                            { label: "Category", value: "Category" },
                        ]}
                    />

                    <div className="w-px bg-white/10 my-2"></div>

                    <GlassDropdown
                        label="Filter"
                        value={filterType}
                        onChange={(val) => setFilterType(val as any)}
                        options={[
                            { label: "All", value: "All" },
                            { label: "Cities", value: "City" },
                            { label: "Activities", value: "Activity" },
                        ]}
                    />

                    <div className="w-px bg-white/10 my-2"></div>

                    <GlassDropdown
                        label="Sort by"
                        value={sortBy}
                        onChange={(val) => setSortBy(val as any)}
                        options={[
                            { label: "Name (A-Z)", value: "NameAsc" },
                            { label: "Name (Z-A)", value: "NameDesc" },
                        ]}
                    />
                </div>
            </div>
            {/* --- Results Section --- */}
            <div className="flex-1 flex flex-col overflow-hidden p-6 max-w-4xl mx-auto w-full">
                <h2 className="text-lg font-bold mb-4 shrink-0 text-white/90">Results</h2>

                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {Object.keys(groupedData).length === 0 && (
                        <div className="p-8 text-center text-white/40 border border-dashed border-white/10 rounded-xl">
                            {query.length < 3 ? "Type at least 3 characters to search." : "No results found."}
                        </div>
                    )}

                    {Object.entries(groupedData).map(([groupName, items]) => (
                        <div key={groupName} className="mb-6">
                            {groupBy !== "None" && (
                                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 px-1">{groupName}</h3>
                            )}
                            <div className="flex flex-col gap-3">
                                {items.map(item => (
                                    <div key={item.id} className="group border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md p-4 rounded-xl flex flex-col gap-1 transition-all hover:scale-[1.01] hover:shadow-lg cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-lg text-white/90 group-hover:text-white transition-colors">{item.name}</span>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full text-white/90 ${item.type === 'City' ? 'bg-blue-500/20 text-blue-200' :
                                                item.type === 'Activity' ? 'bg-orange-500/20 text-orange-200' :
                                                    'bg-white/10 text-white/70'
                                                }`}>
                                                {item.type}
                                            </span>
                                        </div>
                                        <span className="text-sm text-white/60">{item.details}</span>
                                        <div className="flex gap-2 text-xs text-white/40 mt-2">
                                            <span className="uppercase tracking-widest text-[10px]">{item.category}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
