import React from "react";
import { db } from "@/lib/db";
export const dynamic = 'force-dynamic';
import { trips } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Calendar, DollarSign, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import AppHeader from "@/components/shared/AppHeader";

export default async function MyTrips() {
    // Fetch trips from DB
    let allTrips: any[] = [];
    try {
        allTrips = await db.select().from(trips).orderBy(desc(trips.createdAt));
    } catch (error) {
        console.error("Failed to fetch trips:", error);
        allTrips = [];
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <AppHeader />

            <div className="relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />

                <div className="relative z-10 max-w-7xl mx-auto p-8">
                    <header className="mb-12 flex justify-between items-center">
                        <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
                            My Trips
                        </h1>
                        <Link href="/create-trip">
                            <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-6 py-3 rounded-full text-sm font-medium transition-all shadow-lg shadow-purple-500/20">
                                <Plus className="w-4 h-4" />
                                Create New Trip
                            </button>
                        </Link>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allTrips.map((trip) => (
                            <div key={trip.id} className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden group hover:scale-[1.02] hover:bg-white/[0.05] transition-all duration-300">
                                {/* Cover Photo Area */}
                                <div
                                    className="h-48 w-full bg-cover bg-center relative"
                                    style={{
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
                                            {(Number(trip.budget) > 0)
                                                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(trip.budget))
                                                : "No Budget"}
                                        </div>
                                    </div>

                                    <Link href={`/trips/${trip.id}/budget`}>
                                        <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                                            <DollarSign className="w-4 h-4" />
                                            Manage Trip Budget
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {allTrips.length === 0 && (
                        <div className="text-center text-white/50 mt-20 p-12 border border-dashed border-white/10 rounded-2xl">
                            <p className="text-lg mb-4">No trips found. Create your first trip!</p>
                            <Link href="/create-trip">
                                <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-6 py-3 rounded-full text-sm font-medium transition-all">
                                    Create Trip
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
