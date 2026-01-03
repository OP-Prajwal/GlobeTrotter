"use client"

import { DollarSign, Map } from "lucide-react"

interface BudgetOverviewProps {
    totalSpent: number
    tripCount: number
}

export function BudgetOverview({ totalSpent, tripCount }: BudgetOverviewProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                    <DollarSign className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-white/50 font-medium">Total Spent</p>
                    <h2 className="text-3xl font-bold text-white tracking-tight">₹{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                    <Map className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-white/50 font-medium">Trips Taken</p>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{tripCount}</h2>
                </div>
            </div>
        </div>
    )
}
