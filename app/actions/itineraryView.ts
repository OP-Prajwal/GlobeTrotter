"use server"

import { db } from "@/lib/db"
import { trips, stops, activities } from "@/lib/db/schema"
import { eq, asc } from "drizzle-orm"

export type ItineraryActivity = {
    id: string
    title: string
    description: string | null
    cost: string | null
    category: string | null
    order: number
}

export type ItineraryStop = {
    id: string
    locationName: string
    order: number
    arrivalDate: Date | null
    departureDate: Date | null
    activities: ItineraryActivity[]
}

export type FullItinerary = {
    trip: {
        id: string
        title: string
        startDate: Date | null
        endDate: Date | null
        budget: string | null
    }
    stops: ItineraryStop[]
}

export async function getTripItinerary(tripId: string): Promise<FullItinerary | null> {
    try {
        // 1. Fetch Trip
        const tripResult = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1)
        if (tripResult.length === 0) return null
        const trip = tripResult[0]

        // 2. Fetch Stops
        const stopsResult = await db
            .select()
            .from(stops)
            .where(eq(stops.tripId, tripId))
            .orderBy(asc(stops.order))

        // 3. Fetch Activities for all stops
        // Note: Drizzle doesn't support deep nested include efficiently in one go without relations setup, 
        // doing manual aggregation for clarity and control.
        const fullStops: ItineraryStop[] = []

        for (const stop of stopsResult) {
            const ags = await db
                .select()
                .from(activities)
                .where(eq(activities.stopId, stop.id))
                .orderBy(asc(activities.order))

            fullStops.push({
                id: stop.id,
                locationName: stop.locationName,
                order: stop.order,
                arrivalDate: stop.arrivalDate,
                departureDate: stop.departureDate,
                activities: ags.map(a => ({
                    id: a.id,
                    title: a.title,
                    description: a.description,
                    cost: a.cost,
                    category: a.category,
                    order: a.order
                }))
            })
        }

        return {
            trip: {
                id: trip.id,
                title: trip.title,
                startDate: trip.startDate,
                endDate: trip.endDate,
                budget: trip.budget,
            },
            stops: fullStops
        }

    } catch (error) {
        console.error("Failed to fetch itinerary:", error)
        return null
    }
}
