"use client"

import { useState } from "react"
import { User, Plus, Calendar, IndianRupee, MapPin, Save, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { saveItinerary } from "@/app/actions/itinerary"
import { toast } from "sonner"

export interface ItinerarySection {
    id: string
    title: string
    notes: string
    startDate: string
    endDate: string
    budget: string
}

const SUGGESTIONS = [
    { label: "Flight", icon: "✈️" },
    { label: "Hotel", icon: "🏨" },
    { label: "Sightseeing", icon: "🎡" },
    { label: "Transport", icon: "🚕" },
    { label: "Meal", icon: "🍽️" },
]

interface ItineraryEditorProps {
    tripId: string;
    initialSections: ItinerarySection[];
}

export function ItineraryEditor({ tripId, initialSections }: ItineraryEditorProps) {
    const [sections, setSections] = useState<ItinerarySection[]>(
        initialSections.length > 0 ? initialSections : [
            { id: crypto.randomUUID(), title: "", notes: "", startDate: "", endDate: "", budget: "" }
        ]
    )
    const [isSaving, setIsSaving] = useState(false)

    const addSection = () => {
        setSections([
            ...sections,
            { id: crypto.randomUUID(), title: "", notes: "", startDate: "", endDate: "", budget: "" },
        ])
    }

    const updateSection = (id: string, field: keyof ItinerarySection, value: string) => {
        setSections(
            sections.map((section) =>
                section.id === id ? { ...section, [field]: value } : section
            )
        )
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const result = await saveItinerary(tripId, sections)
            if (result.success) {
                toast.success("Itinerary saved successfully!")
            } else {
                toast.error("Failed to save itinerary")
            }
        } catch (error) {
            console.error(error)
            toast.error("An unexpected error occurred")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-black text-white selection:bg-white/30">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between p-4 border-b border-white/10 bg-black/70 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                        <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        GlobeTrotter
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-medium text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? "Saving..." : "Save Trip"}
                    </button>
                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-sm">
                        <User className="w-5 h-5 text-white/80" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-3xl mx-auto w-full p-6 flex flex-col gap-6">
                <AnimatePresence mode="popLayout">
                    {sections.map((section, index) => (
                        <motion.div
                            layout
                            key={section.id}
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="group relative border border-white/10 bg-white/5 hover:bg-white/[0.07] backdrop-blur-xl rounded-xl p-6 flex flex-col gap-5 shadow-xl transition-colors"
                        >
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-white/90 tracking-tight flex items-center gap-3 w-full">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-white/90 text-xs font-bold border border-white/10 shrink-0">
                                            {index + 1}
                                        </span>
                                        <input
                                            type="text"
                                            className="bg-transparent border-none p-0 text-lg font-semibold text-white/90 focus:ring-0 placeholder-white/30 w-full"
                                            placeholder="Give this section a title..."
                                            value={section.title}
                                            onChange={(e) => updateSection(section.id, "title", e.target.value)}
                                        />
                                    </h2>
                                </div>
                                <div className="flex gap-2 flex-wrap pl-9">
                                    {SUGGESTIONS.map((s) => (
                                        <button
                                            key={s.label}
                                            onClick={() => updateSection(section.id, "title", `${s.icon} ${s.label}`)}
                                            className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1 text-white/70 transition-colors"
                                        >
                                            {s.icon} {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <textarea
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-4 h-32 resize-none text-white placeholder-white/30 focus:outline-none focus:border-white/40 focus:bg-black/60 transition-all duration-200"
                                        placeholder="Describe this part of your journey..."
                                        value={section.notes}
                                        onChange={(e) => updateSection(section.id, "notes", e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">Date Range</label>
                                        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg p-1 focus-within:border-white/40 transition-colors">
                                            <div className="relative flex-1">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                                <input
                                                    type="date"
                                                    className="w-full bg-transparent border-none py-2.5 pl-9 pr-2 text-sm text-white focus:ring-0 placeholder-white/30 [color-scheme:dark]"
                                                    value={section.startDate}
                                                    onChange={(e) => updateSection(section.id, "startDate", e.target.value)}
                                                />
                                            </div>
                                            <span className="text-white/20">→</span>
                                            <div className="relative flex-1">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                                <input
                                                    type="date"
                                                    className="w-full bg-transparent border-none py-2.5 pl-9 pr-2 text-sm text-white focus:ring-0 placeholder-white/30 [color-scheme:dark]"
                                                    value={section.endDate}
                                                    onChange={(e) => updateSection(section.id, "endDate", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">Estimated Budget</label>
                                        <div className="relative group/input">
                                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/40 focus:bg-black/60 transition-all duration-200"
                                                value={section.budget}
                                                onChange={(e) => updateSection(section.id, "budget", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Add Section Button */}
                <motion.button
                    layout
                    whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                    whileTap={{ scale: 0.99 }}
                    onClick={addSection}
                    className="group flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-xl p-4 mt-2 transition-all duration-200 hover:border-white/40"
                >
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <Plus className="w-5 h-5 text-white/60 group-hover:text-white" />
                    </div>
                    <span className="font-medium text-white/60 group-hover:text-white transition-colors">Add another Travel Segment</span>
                </motion.button>
            </main>
        </div>
    )
}
