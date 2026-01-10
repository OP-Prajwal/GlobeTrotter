'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Loader2, Compass, X, Sparkles, Navigation } from "lucide-react"
import { getRegionFromCoordinates, getRegionalDestinations, GLOBAL_FAVORITES, Destination } from "@/lib/api/discovery"
import { getLocationDetails, type LocationDetails } from "@/app/actions/gemini"
import { cn } from "@/lib/utils"

import { updateUserLocation } from "@/app/actions/user"

// ... imports

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80';

export default function RegionalDiscovery() {
    const [destinations, setDestinations] = useState<Destination[]>(GLOBAL_FAVORITES)
    const router = useRouter()
    const [mode, setMode] = useState<'global' | 'local'>('global')
    const [loading, setLoading] = useState(false)
    const [detectedRegion, setDetectedRegion] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Details Modal State
    const [selectedLocation, setSelectedLocation] = useState<Destination | null>(null)
    const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [detailsError, setDetailsError] = useState<string | null>(null)

    const handleViewDetails = async (dest: Destination) => {
        setSelectedLocation(dest)
        setLoadingDetails(true)
        setLocationDetails(null)
        setDetailsError(null)

        try {
            const result = await getLocationDetails(dest.name)
            if (result.success) {
                setLocationDetails(result.data)
            } else {
                setDetailsError(result.error)
            }
        } catch (err) {
            console.error("Failed to load details", err)
            setDetailsError("An unexpected error occurred.")
        } finally {
            setLoadingDetails(false)
        }
    }

    const handleDetectLocation = async () => {
        console.log("handleDetectLocation called") // LOGGING
        setLoading(true)
        setError(null)

        if (!navigator.geolocation) {
            console.error("Geolocation not supported")
            setError("Geolocation is not supported by your browser")
            setLoading(false)
            return
        }

        console.log("Requesting current position...")
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                await processLocation(position.coords.latitude, position.coords.longitude)
                setLoading(false)
            },
            (error) => {
                console.error(error)
                setError("Location permission denied. Showing global favorites.")
                setLoading(false)
            }
        )
    }

    const processLocation = async (latitude: number, longitude: number) => {
        try {
            // Fire and forget location update
            updateUserLocation(latitude, longitude)

            // 1. Reverse Geocode (or use IP region if available, but re-verifying is safer)
            const locationData = await getRegionFromCoordinates(latitude, longitude)
            const regionName = locationData.region
            setDetectedRegion(regionName)

            // 2. Fetch Regional Areas (Cities + Images) via GeoNames
            const localDestinations = await getRegionalDestinations(regionName, locationData.country);

            if (localDestinations.length === 0) {
                setError(`Could not find specific urban areas in ${regionName}. Showing global favorites.`);
                return;
            }

            setDestinations(localDestinations)
            setMode('local')
        } catch (err) {
            console.error(err)
            setError("Failed to fetch regional data")
        }
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
            <div className="flex flex-col md:flex-row justify-between items-end border-b-2 border-border pb-4 mb-4">
                <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
                        {mode === 'global' ? "Global Favorites" : `Discovering: ${detectedRegion}`}
                    </h2>
                    <div className="bg-secondary px-3 py-1 rounded-full border border-border inline-block">
                        <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                            {mode === 'global' ? "Curated Selection" : "Based on your location"}
                        </p>
                    </div>
                </div>

                <div className="mt-4 md:mt-0 flex gap-4">
                    {mode === 'local' && (
                        <button
                            onClick={handleReset}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Reset to Global
                        </button>
                    )}
                    <button
                        onClick={() => router.push('/create-trip')}
                        className="px-4 py-2 text-sm font-bold text-primary-foreground bg-primary border-2 border-primary rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Create Trip
                    </button>
                    <button
                        onClick={handleDetectLocation}
                        disabled={loading || mode === 'local'}
                        className={cn(
                            "group relative px-6 py-3 font-bold text-sm bg-foreground text-background border-2 border-foreground rounded-lg overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed",
                            mode === 'local' && "opacity-50 cursor-default"
                        )}
                    >
                        <span className="relative z-10 flex items-center gap-2 text-inherit">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                            {mode === 'local' ? "Location Active" : "Find from Location"}
                        </span>
                    </button>
                </div>
            </div>

            {/* Glass UI Featured Banner (Top 3) */}
            {!loading && !error && (
                <div className="relative w-full overflow-hidden rounded-3xl border border-border shadow-2xl mb-12">
                    {/* Dynamic Background Mesh */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-blue-900/40 z-0" />
                    <div className="absolute inset-0 backdrop-blur-2xl z-0" />

                    <div className="relative z-10 p-6 md:p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <h3 className="text-sm font-mono text-green-400 tracking-widest uppercase">Top Recommendations</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {destinations.slice(0, 3).map((dest, i) => (
                                <motion.div
                                    key={`banner-${dest.id}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group relative h-48 md:h-64 rounded-2xl overflow-hidden border border-border hover:border-primary/40 active:border-primary/40 transition-all duration-500 cursor-pointer"
                                    onClick={() => handleViewDetails(dest)}
                                >
                                    <img
                                        src={dest.image || FALLBACK_IMAGE}
                                        alt={dest.name}
                                        onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-active:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 group-active:bg-black/10 transition-colors duration-500" />

                                    {/* Gradient Overlay Content - Removed "white patch" */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 transition-transform duration-300">
                                        <h4 className="text-xl font-bold text-white mb-1 transform translate-y-2 group-hover:translate-y-0 group-active:translate-y-0 transition-transform duration-300">{dest.name}</h4>
                                        <p className="text-xs text-gray-300 uppercase tracking-wider transform translate-y-2 group-hover:translate-y-0 group-active:translate-y-0 transition-transform duration-300 delay-75">{dest.region}</p>
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
                            onClick={() => handleViewDetails(dest)}
                        >
                            {/* Hand-drawn style border effect */}
                            <div className="absolute inset-0 border-2 border-border rounded-xl z-20 transition-transform duration-300 group-hover:-translate-y-2 group-hover:-translate-x-2 group-active:-translate-y-2 group-active:-translate-x-2 box-border bg-transparent pointer-events-none" />

                            {/* Shadow block for depth */}
                            <div className="absolute inset-0 bg-white/10 rounded-xl z-0 transform translate-x-2 translate-y-2" />

                            {/* Content Container */}
                            <div className="absolute inset-0 bg-card rounded-xl overflow-hidden z-10 border border-border">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

                                <img
                                    src={dest.image || FALLBACK_IMAGE}
                                    alt={dest.name}
                                    onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-active:scale-110 grayscale group-hover:grayscale-0 group-active:grayscale-0"
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
                                        "px-2 py-1 text-[10px] font-bold border rounded uppercase bg-background/80 backdrop-blur-md",
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

            {/* Location Details Modal */}
            <AnimatePresence>
                {selectedLocation && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedLocation(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-3xl shadow-2xl p-6 md:p-8 custom-scrollbar"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedLocation(null)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors z-20"
                            >
                                <X className="w-5 h-5 text-foreground" />
                            </button>

                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Left Column: Image & Title */}
                                <div className="w-full md:w-1/3 space-y-4">
                                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                                        <img
                                            src={selectedLocation.image}
                                            alt={selectedLocation.name}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                        <div className="absolute bottom-6 left-6">
                                            <h2 className="text-3xl font-bold text-white">{selectedLocation.name}</h2>
                                            <p className="text-purple-400 font-mono text-sm tracking-wider uppercase">{selectedLocation.region}</p>
                                        </div>
                                    </div>

                                    {locationDetails && (
                                        <p className="text-muted-foreground leading-relaxed text-sm p-4 bg-secondary/50 rounded-xl border border-border">
                                            {locationDetails.description}
                                        </p>
                                    )}
                                </div>

                                {/* Right Column: Details & Gems */}
                                <div className="w-full md:w-2/3">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                                        <h3 className="text-xl font-bold text-foreground">Best Places to Visit</h3>
                                    </div>

                                    {loadingDetails ? (
                                        <div className="h-64 flex flex-col items-center justify-center gap-4 text-gray-400">
                                            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                                            <p>Asking Gemini for the best spots...</p>
                                        </div>
                                    ) : locationDetails ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {locationDetails.bestPlaces.map((place, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary active:border-primary transition-colors"
                                                >
                                                    <div className="h-32 overflow-hidden relative">
                                                        <img
                                                            src={place.image || FALLBACK_IMAGE}
                                                            alt={place.name}
                                                            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-active:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-black/20" />
                                                    </div>
                                                    <div className="p-4">
                                                        <h4 className="font-bold text-foreground mb-1 truncate">{place.name}</h4>
                                                        <p className="text-xs text-muted-foreground line-clamp-2">{place.description}</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-32 text-red-400 gap-2 p-4 text-center">
                                            <p className="font-bold">Failed to load details</p>
                                            <p className="text-sm opacity-80">{detailsError || "Please check your internet connection."}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
