import React from "react";
import { db } from "@/lib/db";
import { trips } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Calendar, DollarSign, MapPin } from "lucide-react";
import Link from "next/link";

export default async function MyTrips() {
    // Fetch trips from DB
    let allTrips = [];
    try {
        allTrips = await db.select().from(trips).orderBy(desc(trips.createdAt));
    } catch (error) {
        console.error("Failed to fetch trips:", error);
        allTrips = [];
    }

    return (
        <div className="min-h-screen w-full p-8 bg-black relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />

            <div className="relative z-10 max-w-7xl mx-auto">
                <header className="mb-12 flex justify-between items-center">
                    <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
                        All Trips
                    </h1>
                    <Link href="/create-trip">
                        <button className="glass-button px-6 py-2 rounded-full text-sm font-medium">
                            + Create New Trip
                        </button>
                    </Link>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allTrips.map((trip) => (
                        <div key={trip.id} className="glass-card overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                            {/* Cover Photo Area */}
                            <div
                                className="h-48 w-full bg-cover bg-center relative"
                                style={{
                                    // Fallback since we don't have coverPhoto in DB yet
                                    background: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
                                }}
                            >
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                <div className="absolute bottom-4 left-4">
                                    <h2 className="text-2xl font-bold text-white drop-shadow-md">{trip.title}</h2>
                                    <div className="flex items-center text-white/80 text-sm mt-1">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "TBD"}
                                    </div>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center text-white/60 text-sm">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        <span>Destination</span>
                                    </div>
                                    <div className="text-white/90 font-semibold">
                                        {trip.budget ? `$${trip.budget}` : "No Budget"}
                                    </div>
                                </div>

                                <Link href={`/trips/${trip.id}/budget`}>
                                    <button className="w-full glass-button py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/20">
                                        <DollarSign className="w-4 h-4" />
                                        Manage Trip Budget
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {allTrips.length === 0 && (
                    <div className="text-center text-white/50 mt-20">
                        <p>No trips found. Create your first trip!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
