"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Mock Trip Type matching the schema roughly, or at least what we need for display
export type Trip = {
    id: string;
    title: string;
    description: string | null;
    startDate: Date | null;
    endDate: Date | null;
    location?: string; // Optional extra for display
};

interface TripCardProps {
    trip: Trip;
    status: "ongoing" | "upcoming" | "completed";
}

export function TripCard({ trip, status }: TripCardProps) {
    const isOngoing = status === "ongoing";
    const isUpcoming = status === "upcoming";
    const isCompleted = status === "completed";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -5, scale: 1.01 }}
            className={cn(
                "glass-card relative overflow-hidden group p-6 transition-all duration-300",
                isOngoing && "border-primary/50 shadow-[0_0_30px_rgba(var(--primary),0.2)] bg-black/50",
                isUpcoming && "hover:bg-white/5",
                isCompleted && "opacity-70 grayscale-[0.3] hover:opacity-100 hover:grayscale-0"
            )}
        >
            {/* Background decoration for ongoing */}
            {isOngoing && (
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
            )}

            <div className="flex flex-col gap-4 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {isOngoing && (
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-xs font-medium text-primary-foreground">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                    </span>
                                    Active Now
                                </span>
                            )}
                            {isUpcoming && trip.startDate && (
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    Starts in {Math.ceil((trip.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                                </span>
                            )}
                        </div>

                        <h3 className={cn("text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors", isCompleted && "text-white/80")}>
                            {trip.title}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2">
                            {trip.description || "No description provided."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-300 mt-2">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary/70" />
                        <span>
                            {trip.startDate ? format(trip.startDate, "MMM d") : "TBD"}
                            {" - "}
                            {trip.endDate ? format(trip.endDate, "MMM d, yyyy") : "TBD"}
                        </span>
                    </div>
                    {trip.location && (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-primary/70" />
                            <span>{trip.location}</span>
                        </div>
                    )}
                </div>

                {/* Action / View details hint */}
                <div className={cn(
                    "absolute bottom-6 right-6 opacity-0 transform translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0",
                    isOngoing && "opacity-100 translate-x-0" // Always show for active
                )}>
                    <div className="p-2 rounded-full bg-primary/10 border border-primary/30 text-primary">
                        <ArrowRight className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
