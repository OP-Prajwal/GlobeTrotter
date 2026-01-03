"use server"

import { db } from "@/lib/db"
import { stops, trips } from "@/lib/db/schema"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { z } from "zod"

const itinerarySchema = z.array(z.object({
    id: z.string(),
    title: z.string().optional(),
    notes: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    budget: z.string().optional(),
    // We might need order if we want to preserve it
}))

export async function saveItinerary(tripId: string, sections: any[]) {
    try {
        // Validate input
        // const parsedSections = itinerarySchema.parse(sections) 
        // (Skipping strict zod parsing for now to match flexible frontend state, but good practice)

        // Delete existing stops for this trip to avoid duplicates/complexity for this MVP re-save
        // A better approach would be to update existing and insert new, but "replace all" is safer for simple lists
        await db.delete(stops).where(eq(stops.tripId, tripId))

        // Prepare new stops
        const newStops = sections.map((section, index) => ({
            tripId: tripId,
            order: index,
            locationName: section.title || "Untitled Section",
            description: section.notes || "",
            // Parse dates only if they exist
            startDate: section.startDate ? new Date(section.startDate) : null,
            endDate: section.endDate ? new Date(section.endDate) : null,
            // Budget is a string in frontend ("123"), needs to be decimal/number or handled by DB
            budget: section.budget || "0",
            // Lat/Lon are required by schema but we don't have them yet. default to 0.
            latitude: "0",
            longitude: "0",
        }))

        if (newStops.length > 0) {
            await db.insert(stops).values(newStops)
        }

        revalidatePath(`/trips/${tripId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to save itinerary:", error)
        return { success: false, error: "Failed to save itinerary" }
    }
}
