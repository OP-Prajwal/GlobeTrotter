"use server"

import { db } from "@/lib/db"
import { trips, stops, activities, users } from "@/lib/db/schema"
import { eq, and, gte, lte, sql, desc, asc } from "drizzle-orm"
import { format } from "date-fns"

export type BudgetTripSummary = {
    id: string
    title: string
    startDate: Date | null
    endDate: Date | null
    totalSpent: number
}

export type BudgetOverviewData = {
    totalSpent: number
    tripCount: number
    trips: BudgetTripSummary[]
}

export type CategoryBreakdown = {
    category: string
    amount: number
}

export type DailyBreakdown = {
    date: string
    amount: number
}

export type TripBudgetDetails = {
    byCategory: CategoryBreakdown[]
    byDay: DailyBreakdown[]
}

// Helper to check if a date falls within Year/Month
function isDateInPeriod(date: Date | null, year: string, month: string) {
    if (!date) return false
    const dYear = date.getFullYear().toString()
    const dMonth = (date.getMonth() + 1).toString() // 1-12

    if (year !== "All" && dYear !== year) return false
    if (month !== "All" && dMonth !== month) return false
    return true
}

export async function getBudgetOverview(userId: string, year: string, month: string) {
    // Helper: If userId is dummy/empty, fetch the first user from DB to make demo work
    let targetUserId = userId
    if (userId === "00000000-0000-0000-0000-000000000000") {
        const firstUser = await db.select().from(users).limit(1)
        if (firstUser.length > 0) {
            targetUserId = firstUser[0].id
        }
    }

    // 1. Fetch all trips for user
    const userTrips = await db.select().from(trips).where(eq(trips.userId, targetUserId))

    let grandTotal = 0
    let pertinentTrips: BudgetTripSummary[] = []

    for (const trip of userTrips) {
        // Get stops -> activities
        const tripStops = await db.select().from(stops).where(eq(stops.tripId, trip.id))

        let tripSpent = 0
        let hasActivityInPeriod = false

        for (const stop of tripStops) {
            if (isDateInPeriod(stop.arrivalDate, year, month)) {
                const stopActivities = await db.select().from(activities).where(eq(activities.stopId, stop.id))

                for (const act of stopActivities) {
                    if (act.cost) {
                        tripSpent += parseFloat(act.cost.toString())
                    }
                }
                hasActivityInPeriod = true
            }
        }

        if (hasActivityInPeriod || isDateInPeriod(trip.startDate, year, month)) {
            pertinentTrips.push({
                id: trip.id,
                title: trip.title,
                startDate: trip.startDate,
                endDate: trip.endDate,
                totalSpent: tripSpent
            })
            grandTotal += tripSpent
        }
    }

    // Sort trips by date descending
    pertinentTrips.sort((a, b) => {
        const dateA = a.startDate ? new Date(a.startDate).getTime() : 0
        const dateB = b.startDate ? new Date(b.startDate).getTime() : 0
        return dateB - dateA
    })

    return {
        totalSpent: grandTotal,
        tripCount: pertinentTrips.length,
        trips: pertinentTrips
    }
}

export async function getTripBudgetDetails(tripId: string, year: string, month: string) {
    const tripStops = await db.select().from(stops).where(eq(stops.tripId, tripId))

    // Aggregators
    const categoryMap: Record<string, number> = {}
    const dayMap: Record<string, number> = {}

    for (const stop of tripStops) {
        if (isDateInPeriod(stop.arrivalDate, year, month)) {
            const dateKey = stop.arrivalDate ? format(stop.arrivalDate, "yyyy-MM-dd") : "Undated"

            const stopActivities = await db.select().from(activities).where(eq(activities.stopId, stop.id))

            for (const act of stopActivities) {
                const cost = act.cost ? parseFloat(act.cost.toString()) : 0
                if (cost > 0) {
                    // Category
                    const cat = act.category || "Uncategorized"
                    categoryMap[cat] = (categoryMap[cat] || 0) + cost

                    // Day
                    dayMap[dateKey] = (dayMap[dateKey] || 0) + cost
                }
            }
        }
    }

    // Transform to arrays
    const byCategory = Object.entries(categoryMap).map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)

    const byDay = Object.entries(dayMap).map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return { byCategory, byDay }
}
