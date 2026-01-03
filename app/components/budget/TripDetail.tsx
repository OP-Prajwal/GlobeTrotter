"use client"

import { useState, useEffect } from "react"
import { getTripBudgetDetails, type TripBudgetDetails } from "@/app/actions/budget"
import { PieChart as PieIcon, Calendar, Loader2 } from "lucide-react"
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip
} from "recharts"

interface TripDetailProps {
    tripId: string
    year: string
    month: string
}

const CATEGORY_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#14b8a6"]

export function TripDetail({ tripId, year, month }: TripDetailProps) {
    const [data, setData] = useState<TripBudgetDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<"category" | "day">("category")

    useEffect(() => {
        async function load() {
            setLoading(true)
            const details = await getTripBudgetDetails(tripId, year, month)
            setData(details)
            setLoading(false)
        }
        load()
    }, [tripId, year, month])

    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-10 border border-white/10 h-[500px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
        )
    }

    if (!data) return null

    const pieData = data.byCategory.map((item, idx) => ({
        name: item.category,
        value: item.amount,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
    }))

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black/80 backdrop-blur-md border border-white/10 p-2 rounded-lg shadow-xl">
                    <p className="text-white text-sm font-medium">{payload[0].name}</p>
                    <p className="text-indigo-300 text-sm font-bold">
                        ₹{payload[0].value.toLocaleString()}
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 h-[500px] flex flex-col">
            {/* Header / Tabs */}
            <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-white/[0.02]">
                <button
                    onClick={() => setView("category")}
                    className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                        ${view === "category" ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/30" : "text-white/50 hover:bg-white/10 hover:text-white"}
                    `}
                >
                    <PieIcon className="w-4 h-4" /> By Category
                </button>
                <button
                    onClick={() => setView("day")}
                    className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                        ${view === "day" ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/30" : "text-white/50 hover:bg-white/10 hover:text-white"}
                    `}
                >
                    <Calendar className="w-4 h-4" /> By Day
                </button>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 min-h-0 flex flex-col">
                {view === "category" ? (
                    <div className="flex h-full items-center">
                        <div className="w-1/2 h-full relative">
                            {pieData.length === 0 ? (
                                <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">No Data</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="w-1/2 pl-6 overflow-y-auto custom-scrollbar h-full">
                            <h4 className="text-sm font-semibold text-white/50 mb-4 uppercase tracking-wider">Breakdown</h4>
                            <div className="space-y-3">
                                {pieData.map((entry, idx) => (
                                    <div key={idx} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                            <span className="text-sm text-white/80 capitalize">{entry.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                                            ₹{entry.value.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full">
                        {data.byDay.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-white/30">No daily data available.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.byDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="rgba(255,255,255,0.3)"
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => val.split("-").slice(1).join("/")}
                                    />
                                    <YAxis
                                        stroke="rgba(255,255,255,0.3)"
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => `₹${val}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        content={<CustomTooltip />}
                                    />
                                    <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
