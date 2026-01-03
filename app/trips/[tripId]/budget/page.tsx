import React from "react";

export default function TripBudget({ params }: { params: { tripId: string } }) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-black text-white">
            <div className="glass-card p-8">
                <h1 className="text-3xl font-bold mb-4">Trip Budget</h1>
                <p>Managing budget for Trip ID: {params.tripId}</p>
                <p className="text-white/50 mt-4">Coming soon...</p>
            </div>
        </div>
    );
}
