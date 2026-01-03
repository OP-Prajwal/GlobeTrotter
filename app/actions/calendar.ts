"use server"

import { db } from "@/lib/db"
import { trips } from "@/lib/db/schema"

export interface CalendarTrip {
    id: string
    title: string
    startDate: Date | null
    endDate: Date | null
    budget: string | null // string because decimal comes as string often, or number
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

        return allTrips
    } catch (error) {
        console.error("Failed to fetch calendar trips:", error)
        return []
    }
}
