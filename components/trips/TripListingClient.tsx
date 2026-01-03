"use client";

import { useState } from "react";
import { Trip, TripCard } from "@/components/trips/TripCard";
import { Search, Filter, ArrowUpDown, Layers } from "lucide-react";

interface TripListingClientProps {
    initialTrips: Trip[];
}

export default function TripListingClient({ initialTrips }: TripListingClientProps) {
    const [searchTerm, setSearchTerm] = useState("");

    // Categorization Logic
    const today = new Date();

    // Filter trips based on search
    const filteredTrips = initialTrips.filter(trip =>
        trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trip.description && trip.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const ongoingTrips = filteredTrips.filter(trip =>
        trip.startDate && trip.endDate && trip.startDate <= today && trip.endDate >= today
    );

    const upcomingTrips = filteredTrips.filter(trip =>
        trip.startDate && trip.startDate > today
    ).sort((a, b) => (a.startDate!.getTime() - b.startDate!.getTime())); // Sort by soonest

    const completedTrips = filteredTrips.filter(trip =>
        trip.endDate && trip.endDate < today
    ).sort((a, b) => (b.endDate!.getTime() - a.endDate!.getTime())); // Sort by most recent

    return (
        <div className="min-h-screen bg-[#05050A] text-white relative selection:bg-primary/30">

            {/* Background Ambient Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] animate-blob" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 py-8 pb-32">

                {/* Glass Header */}
                <header className="sticky top-4 z-50 mb-12">
                    <div className="glass rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <Layers className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight">My Trips</h1>
                        </div>

                        <div className="flex-1 w-full md:max-w-md relative group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search your adventures..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <button className="glass-button p-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium flex-1 md:flex-none">
                                <Filter className="w-4 h-4" />
                                <span className="hidden md:inline">Filter</span>
                            </button>
                            <button className="glass-button p-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium flex-1 md:flex-none">
                                <ArrowUpDown className="w-4 h-4" />
                                <span className="hidden md:inline">Sort</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Sections */}
                <div className="space-y-16">

                    {/* Ongoing Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-8 rounded-full bg-gradient-to-b from-primary to-transparent" />
                                Ongoing Trips
                            </h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                        </div>
                        {ongoingTrips.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {ongoingTrips.map(trip => (
                                    <TripCard key={trip.id} trip={trip} status="ongoing" />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 rounded-2xl border border-dashed border-primary/20 bg-primary/5">
                                <p className="text-primary/60">No ongoing trips. Your next adventure awaits!</p>
                            </div>
                        )}
                    </section>

                    {/* Upcoming Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-xl font-bold text-white/90">Upcoming Adventures</h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                        </div>
                        {upcomingTrips.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {upcomingTrips.map(trip => (
                                    <TripCard key={trip.id} trip={trip} status="upcoming" />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 rounded-2xl border border-dashed border-white/10">
                                <p className="text-white/40">No upcoming trips planned.</p>
                            </div>
                        )}
                    </section>

                    {/* Completed Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-xl font-bold text-white/60">Past Memories</h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
                        </div>
                        {completedTrips.length > 0 ? (
                            <div className="space-y-4">
                                {completedTrips.map(trip => (
                                    <TripCard key={trip.id} trip={trip} status="completed" />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-white/40">Your travel history is empty.</p>
                            </div>
                        )}
                    </section>

                </div>

            </div>
        </div>
    );
}
