'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Loader2, Compass } from "lucide-react"
import { getRegionFromCoordinates, getRegionalDestinations, GLOBAL_FAVORITES, Destination } from "@/lib/api/discovery"
import { cn } from "@/lib/utils"

export default function RegionalDiscovery() {
    const [destinations, setDestinations] = useState<Destination[]>(GLOBAL_FAVORITES)
    const router = useRouter()
    const [mode, setMode] = useState<'global' | 'local'>('global')
    const [loading, setLoading] = useState(false)
    const [detectedRegion, setDetectedRegion] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleDetectLocation = () => {
        setLoading(true)
        setError(null)

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser")
            setLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords

                    // 1. Reverse Geocode
                    const locationData = await getRegionFromCoordinates(latitude, longitude)
                    const regionName = locationData.region
                    setDetectedRegion(regionName)

                    // 2. Fetch Regional Areas (Cities + Images) via GeoNames
                    // Logic is now encapsulated in the API function
                    const localDestinations = await getRegionalDestinations(regionName, locationData.country);

                    if (localDestinations.length === 0) {
                        setError(`Could not find specific urban areas in ${regionName}. Showing global favorites.`);
                        setLoading(false);
                        return;
                    }

                    setDestinations(localDestinations)
                    setMode('local')
                } catch (err) {
                    console.error(err)
                    setError("Failed to fetch regional data")
                } finally {
                    setLoading(false)
                }
            },
            (error) => {
                console.error(error)
                setError("Location permission denied. Showing global favorites.")
                setLoading(false)
            }
        )
    }

    const handleReset = () => {
        setMode('global')
        setDestinations(GLOBAL_FAVORITES)
        setDetectedRegion(null)
        setError(null)
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end border-b-2 border-white/20 pb-4 mb-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {mode === 'global' ? "Global Favorites" : `Discovering: ${detectedRegion}`}
                    </h2>
                    <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 inline-block">
                        <p className="text-xs text-gray-300 font-mono uppercase tracking-widest">
                            {mode === 'global' ? "Curated Selection" : "Based on your location"}
                        </p>
                    </div>
                </div>

                <div className="mt-4 md:mt-0 flex gap-4">
                    {mode === 'local' && (
                        <button
                            onClick={handleReset}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            Reset to Global
                        </button>
                    )}
                    <button
                        onClick={() => router.push('/create-trip')}
                        className="px-4 py-2 text-sm font-bold text-black bg-white border-2 border-white rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Create Trip
                    </button>
                    <button
                        onClick={handleDetectLocation}
                        disabled={loading || mode === 'local'}
                        className={cn(
                            "group relative px-6 py-3 font-bold text-sm bg-black border-2 border-white rounded-lg overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed",
                            mode === 'local' && "opacity-50 cursor-default"
                        )}
                    >
                        <span className="relative z-10 flex items-center gap-2 text-white">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                            {mode === 'local' ? "Location Active" : "Find from Location"}
                        </span>
                    </button>
                </div>
            </div>

            {/* Glass UI Featured Banner (Top 3) */}
            {!loading && !error && (
                <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl mb-12">
                    {/* Dynamic Background Mesh */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-blue-900/40 z-0" />
                    <div className="absolute inset-0 backdrop-blur-2xl z-0" />

                    <div className="relative z-10 p-6 md:p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <h3 className="text-sm font-mono text-green-400 tracking-widest uppercase">Top Recommnedations</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {destinations.slice(0, 3).map((dest, i) => (
                                <motion.div
                                    key={`banner-${dest.id}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group relative h-48 md:h-64 rounded-2xl overflow-hidden border border-white/10 hover:border-white/40 transition-all duration-500 cursor-pointer"
                                >
                                    <img
                                        src={dest.image}
                                        alt={dest.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />

                                    {/* Glass Overlay Content */}
                                    <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                                        <h4 className="text-xl font-bold text-white mb-1">{dest.name}</h4>
                                        <p className="text-xs text-gray-200 uppercase tracking-wider">{dest.region}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6 flex items-center gap-2"
                >
                    <Compass className="w-5 h-5" />
                    {error}
                </motion.div>
            )}

            {/* Cards Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {destinations.map((dest) => (
                        <motion.div
                            key={dest.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="group relative aspect-[3/4] cursor-pointer"
                        >
                            {/* Hand-drawn style border effect */}
                            <div className="absolute inset-0 border-2 border-white rounded-xl z-20 transition-transform duration-300 group-hover:-translate-y-2 group-hover:-translate-x-2 box-border bg-transparent pointer-events-none" />

                            {/* Shadow block for depth */}
                            <div className="absolute inset-0 bg-white/10 rounded-xl z-0 transform translate-x-2 translate-y-2" />

                            {/* Content Container */}
                            <div className="absolute inset-0 bg-black rounded-xl overflow-hidden z-10 border border-white/20">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

                                <img
                                    src={dest.image}
                                    alt={dest.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                />

                                <div className="absolute bottom-0 left-0 p-4 z-20 w-full">
                                    <h3 className="text-xl font-bold text-white font-serif">{dest.name}</h3>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="w-8 h-[1px] bg-white/50 inline-block" />
                                        <span className="text-xs text-gray-300 uppercase tracking-wider">{dest.region}</span>
                                    </div>
                                </div>

                                {/* Top Badge */}
                                <div className="absolute top-4 right-4 z-20">
                                    <div className={cn(
                                        "px-2 py-1 text-[10px] font-bold border rounded uppercase bg-black",
                                        dest.matchType === 'local' ? "border-green-400 text-green-400" : "border-purple-400 text-purple-400"
                                    )}>
                                        {dest.matchType === 'local' ? "Nearby" : "Top Pick"}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
