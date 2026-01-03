"use client"

import { useState, useEffect } from "react"
import { User, MapPin } from "lucide-react"
import { getBudgetOverview, type BudgetOverviewData } from "@/app/actions/budget"
import AppHeader from "@/components/shared/AppHeader"
import { BudgetOverview } from "@/app/components/budget/BudgetOverview"
import { TimeNavigator } from "@/app/components/budget/TimeNavigator"
import { TripList } from "@/app/components/budget/TripList"
import { TripDetail } from "@/app/components/budget/TripDetail"
import { Loader2 } from "lucide-react"

export default function BudgetPage() {
    // Global State
    const [year, setYear] = useState("All")
    const [month, setMonth] = useState("All")
    const [selectedTripId, setSelectedTripId] = useState<string | null>(null)

    // Data State
    const [overviewData, setOverviewData] = useState<BudgetOverviewData | null>(null)
    const [loading, setLoading] = useState(true)

    // Load initial data and on filter change
    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const data = await getBudgetOverview("00000000-0000-0000-0000-000000000000", year, month)
            setOverviewData(data)
            setLoading(false)
        }
        fetchData()
    }, [year, month])

    return (
        <div className="flex flex-col h-screen bg-[#050505] text-white font-sans overflow-hidden selection:bg-indigo-500/30">
            {/* Header */}
            <AppHeader />

            <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="max-w-6xl mx-auto pb-20">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Budget Overview</h1>
                        <p className="text-white/50">Track and analyze your travel spending</p>
                    </div>

                    {/* Filters */}
                    <TimeNavigator
                        year={year}
                        month={month}
                        onYearChange={setYear}
                        onMonthChange={setMonth}
                    />

                    {loading || !overviewData ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-white/30" />
                        </div>
                    ) : (
                        <>
                            {/* High-level Summary */}
                            <BudgetOverview
                                totalSpent={overviewData.totalSpent}
                                tripCount={overviewData.tripCount}
                            />

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Trip List Panel */}
                                <div className="lg:col-span-1">
                                    <TripList
                                        trips={overviewData.trips}
                                        selectedTripId={selectedTripId}
                                        onSelectTrip={setSelectedTripId}
                                    />
                                </div>

                                {/* Trip Detail View */}
                                <div className="lg:col-span-2">
                                    {selectedTripId ? (
                                        <TripDetail
                                            tripId={selectedTripId}
                                            year={year}
                                            month={month}
                                        />
                                    ) : (
                                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 h-[500px] flex flex-col items-center justify-center text-center p-10">
                                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                                                <MapPin className="w-8 h-8 text-white/30" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white/80">Select a Trip</h3>
                                            <p className="text-white/40 max-w-sm mt-2">
                                                Click on a trip from the list to view detailed spending breakdown by category and day.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}
