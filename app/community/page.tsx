"use client"

import { useState, useEffect } from "react"
import { User, Search, MapPin, Loader2, Heart, MessageCircle, Share2, Calendar, Plus, X, Navigation } from "lucide-react"
import { getCommunityPosts, getUserTripsForSharing, shareTrip, likeTrip, type CommunityPost } from "@/app/actions/community"
import { searchDestinations } from "@/app/actions/destinations"
import { GlassDropdown } from "@/app/search/GlassDropdown"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

export default function CommunityPage() {
    const [posts, setPosts] = useState<CommunityPost[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    // Create Post Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [myTrips, setMyTrips] = useState<any[]>([])
    const [selectedTripId, setSelectedTripId] = useState("")
    const [postLocation, setPostLocation] = useState("")
    const [postLat, setPostLat] = useState<number | undefined>(undefined)
    const [postLng, setPostLng] = useState<number | undefined>(undefined)
    const [postDescription, setPostDescription] = useState("")
    const [isPosting, setIsPosting] = useState(false)

    // Autocomplete State
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)

    // Controls
    const [filterBy, setFilterBy] = useState("All") // "All", "Nearby"

    async function loadPosts(lat?: number, lng?: number) {
        const data = await getCommunityPosts("", lat, lng)
        setPosts(data)
    }

    useEffect(() => {
        async function init() {
            setIsLoading(true)
            await loadPosts()
            setIsLoading(false)
            const trips = await getUserTripsForSharing()
            setMyTrips(trips)
        }
        init()
    }, [])

    // Handle "Nearby" Filter
    useEffect(() => {
        async function handleFilterChange() {
            if (filterBy === "Nearby") {
                setIsLoading(true)
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            const { latitude, longitude } = position.coords
                            await loadPosts(latitude, longitude)
                            setIsLoading(false)
                        },
                        (error) => {
                            console.error("Geolocation error:", error)
                            alert("Could not get your location. Showing all posts.")
                            setFilterBy("All")
                            setIsLoading(false)
                        }
                    )
                } else {
                    alert("Geolocation is not supported by your browser.")
                    setFilterBy("All")
                    setIsLoading(false)
                }
            } else {
                // Reset to All
                loadPosts()
            }
        }
        handleFilterChange()
    }, [filterBy])


    // Autocomplete Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (postLocation.length >= 3 && !postLat) { // Only search if we haven't selected a valid lat yet to avoid loop on selection
                const results = await searchDestinations(postLocation)
                setSuggestions(results)
                setShowSuggestions(true)
            } else {
                setSuggestions([])
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [postLocation, postLat])

    const selectSuggestion = (s: any) => {
        setPostLocation(`${s.name}, ${s.category}`)
        setPostLat(s.latitude)
        setPostLng(s.longitude)
        setShowSuggestions(false)
    }

    const handleShare = async () => {
        if (!selectedTripId) return
        setIsPosting(true)
        await shareTrip(selectedTripId, postLocation, postDescription, postLat, postLng)
        await loadPosts() // Refresh with standard sort
        setIsPosting(false)
        setIsModalOpen(false)
        // Reset
        setPostLocation("")
        setPostLat(undefined)
        setPostLng(undefined)
        setPostDescription("")
        setSelectedTripId("")
    }

    const handleLike = async (id: string) => {
        setPosts(current => current.map(p =>
            p.id === id ? { ...p, likesCount: p.likesCount + 1 } : p
        ))
        await likeTrip(id)
    }

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.firstName?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">

            {/* --- Header --- */}
            <header className="flex items-center justify-between p-4 px-6 border-b border-white/10 bg-black/60 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                        <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xl font-bold tracking-tight">GlobeTrotter</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                    <User className="w-5 h-5 text-white/70" />
                </div>
            </header>

            {/* --- Controls --- */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 px-6 border-b border-white/10 bg-transparent items-center justify-between shrink-0 relative z-10">
                <div className="flex items-center gap-3 p-2 px-4 border border-white/10 bg-white/[0.05] rounded-xl flex-1 w-full max-w-xl">
                    <Search className="w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search trips, locations..."
                        className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/30"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <GlassDropdown
                        label="Filter"
                        value={filterBy}
                        onChange={setFilterBy}
                        options={[
                            { label: "All Posts", value: "All" },
                            { label: "Nearby Me", value: "Nearby" }
                        ]}
                    />

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Share Adventure</span>
                    </button>
                </div>
            </div>

            {/* --- Feed Content --- */}
            <div className="flex-1 overflow-auto p-6 max-w-3xl mx-auto w-full custom-scrollbar">
                <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Community Feed</h2>
                    {filterBy === "Nearby" && (
                        <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full flex items-center gap-1 border border-indigo-500/30">
                            <Navigation className="w-3 h-3" /> Near You
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-6 pb-20">
                    {isLoading && (
                        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-white/50" /></div>
                    )}

                    {!isLoading && filteredPosts.length === 0 && (
                        <div className="text-center p-10 text-white/30 border border-dashed border-white/10 rounded-xl">
                            No trips found {filterBy === "Nearby" ? "near you." : "."}
                        </div>
                    )}

                    {!isLoading && filteredPosts.map(post => (
                        <div key={post.id} className="flex gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-all hover:bg-white/[0.05]">
                            <div className="shrink-0 pt-1">
                                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-200 font-bold text-lg">
                                    {(post.author.firstName?.[0] || "U")}
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-white/90">
                                            {post.author.firstName || "Anonymous"}
                                        </span>
                                        <span className="text-xs text-white/40">
                                            {format(new Date(post.createdAt), "MMM d")} • {post.location || "Unknown Location"}
                                        </span>
                                    </div>
                                    <button className="text-xs font-medium text-indigo-400 border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 rounded-full">
                                        View Itinerary
                                    </button>
                                </div>

                                <div className="mt-2 p-4 rounded-xl bg-black/40 border border-white/5 group cursor-pointer">
                                    <h3 className="text-lg font-bold group-hover:text-indigo-300 transition-colors">{post.title}</h3>
                                    {post.description && <p className="text-sm text-white/60 mt-1">{post.description}</p>}
                                </div>

                                <div className="flex items-center gap-6 mt-2 ml-1">
                                    <button
                                        onClick={() => handleLike(post.id)}
                                        className="flex items-center gap-1.5 text-white/40 hover:text-pink-400 transition-colors group"
                                    >
                                        <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs">{post.likesCount} Likes</span>
                                    </button>
                                    <button className="flex items-center gap-1.5 text-white/40 hover:text-blue-400 transition-colors">
                                        <MessageCircle className="w-4 h-4" />
                                        <span className="text-xs">Comment</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Create Post Modal --- */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative"
                        >
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                                <h3 className="text-lg font-bold">Share your trip</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="p-6 flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1">Select Trip</label>
                                    <select
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-white/30"
                                        value={selectedTripId}
                                        onChange={(e) => setSelectedTripId(e.target.value)}
                                    >
                                        <option value="">-- Choose a trip --</option>
                                        {myTrips.map(t => (
                                            <option key={t.id} value={t.id}>{t.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-white/60 mb-1">Location Tag</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-white/30 placeholder-white/20"
                                        placeholder="e.g. Mangaluru"
                                        value={postLocation}
                                        onChange={(e) => {
                                            setPostLocation(e.target.value)
                                            setPostLat(undefined) // Reset if typing new text
                                            setPostLng(undefined)
                                        }}
                                    />
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto">
                                            {suggestions.map((s: any) => (
                                                <div
                                                    key={s.id}
                                                    onClick={() => selectSuggestion(s)}
                                                    className="p-2 hover:bg-white/10 cursor-pointer text-sm text-white/90 border-b border-white/5 last:border-0"
                                                >
                                                    <div className="font-medium">{s.name}</div>
                                                    <div className="text-xs text-white/50">{s.details}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1">Description</label>
                                    <textarea
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-white/30 placeholder-white/20 h-24 resize-none"
                                        placeholder="Tell the community about your adventure..."
                                        value={postDescription}
                                        onChange={(e) => setPostDescription(e.target.value)}
                                    />
                                </div>

                                <button
                                    onClick={handleShare}
                                    disabled={!selectedTripId || isPosting || !postLocation}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all mt-2 flex justify-center items-center gap-2"
                                >
                                    {isPosting ? <Loader2 className="animate-spin w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                                    <span>Post to Community</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    )
}
