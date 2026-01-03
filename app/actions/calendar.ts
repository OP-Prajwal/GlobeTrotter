"use server"

import { db } from "@/lib/db"
import { trips, stops } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export interface CalendarStop {
    id: string
    title: string // locationName
    arrivalDate: Date | null
    departureDate: Date | null
    description: string | null
}

export interface CalendarTrip {
    id: string
    title: string
    startDate: Date | null
    endDate: Date | null
    budget: string | null // string because decimal comes as string often, or number
    stops: CalendarStop[]
}

export async function getCalendarTrips(): Promise<CalendarTrip[]> {
    try {
        const allTrips = await db.select({
            id: trips.id,
            title: trips.title,
            startDate: trips.startDate,
            endDate: trips.endDate,
            budget: trips.budget,
        }).from(trips)

        const allStops = await db.select({
            id: stops.id,
            tripId: stops.tripId,
            title: stops.locationName,
            arrivalDate: stops.arrivalDate,
            departureDate: stops.departureDate,
            description: stops.description,
        }).from(stops)

        // Combine trips with their stops
        const tripsWithStops = allTrips.map(trip => {
            const tripStops = allStops
                .filter(stop => stop.tripId === trip.id)
                .map(stop => ({
                    id: stop.id,
                    title: stop.title,
                    arrivalDate: stop.arrivalDate,
                    departureDate: stop.departureDate,
                    description: stop.description
                }))

            return {
                ...trip,
                stops: tripStops
            }
        })

        return tripsWithStops
    } catch (error) {
        console.error("Failed to fetch calendar trips:", error)
        return []
    }
}
