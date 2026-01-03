'use server'
// Admin Data Sync

import { db } from "@/lib/db"
import { users, trips, stops, activities } from "@/lib/db/schema"
import { desc, sql, eq } from "drizzle-orm"

export async function getAdminDashboardData() {
    // 1. Fetch Users with basic stats
    // Note: Drizzle's count() aggregation might vary by driver, so using a raw-ish approach or fetching all for now (hackathon scale).
    // For scalability, we should use count() aggregations. Here we fetch lists since the dataset is small.
    const allUsers = await db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
    })

    const allTrips = await db.query.trips.findMany({
        with: {
            stops: {
                with: {
                    activities: true
                }
            }
        }
    })

    // 2. Process Users for Table
    const usersWithStats = allUsers.map(user => {
        const userTrips = allTrips.filter(t => t.userId === user.id)
        return {
            id: user.id,
            name: `${user.firstName || 'User'} ${user.lastName || ''}`.trim() || 'Anonymous',
            email: user.email,
            status: "Active", // Default for now, as we don't have a status field
            trips: userTrips.length,
            joined: user.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            rawDate: user.createdAt
        }
    })

    // Map userId to Name for quick lookup
    const userMap = new Map(allUsers.map(u => [u.id, `${u.firstName || 'User'} ${u.lastName || ''}`.trim() || 'Anonymous']));

    // 3. Process Cities (from Stops)
    const cityCounts: Record<string, { visits: number, country: string, lastVisitor: string }> = {}

    allTrips.forEach(trip => {
        const visitorName = userMap.get(trip.userId) || "Unknown User";

        trip.stops.forEach(stop => {
            // Assume locationName might be "City, Country" or just "City"
            const rawName = stop.locationName.split(',')[0].trim()

            // Filter out non-city items (flights, hotels, generic terms)
            const lowerName = rawName.toLowerCase()
            const BLOCKLIST = ['flight', 'hotel', 'airport', 'airline', 'stay', 'accommodation', 'transport', 'train', 'bus', 'untitled section']

            if (rawName.length > 2 && !BLOCKLIST.some(term => lowerName.includes(term))) {
                if (!cityCounts[rawName]) {
                    cityCounts[rawName] = { visits: 0, country: "Unknown", lastVisitor: visitorName }
                }
                cityCounts[rawName].visits += 1;
                // Keep the most recent visitor (since we iterate trips, and trips might not be ordered by date in this loop, but acceptable for now)
                cityCounts[rawName].lastVisitor = visitorName;
            }
        })
    })

    const topCities = Object.entries(cityCounts)
        .map(([name, data]) => ({
            id: name,
            name,
            country: `Visited by ${data.lastVisitor}`, // Showing visitor name as requested
            visits: data.visits,
            trend: "+0%" // Placeholder as we don't have historical comparison easily yet
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 6)

    // 4. Process Activities
    const activityCounts: Record<string, number> = {}
    let totalActivities = 0

    allTrips.forEach(trip => {
        trip.stops.forEach(stop => {
            stop.activities.forEach(act => {
                const cat = act.category || "General"
                activityCounts[cat] = (activityCounts[cat] || 0) + 1
                totalActivities++
            })
        })
    })

    const topActivities = Object.entries(activityCounts)
        .map(([name, count], index) => ({
            id: index,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            category: "Activity",
            popularity: totalActivities > 0 ? Math.round((count / totalActivities) * 100) : 0
        }))
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 5)

    // 5. User Growth Trend (Group by Month)
    const trends: Record<string, { users: number, trips: number }> = {}

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const monthKey = d.toLocaleString('en-US', { month: 'short' })
        trends[monthKey] = { users: 0, trips: 0 }
    }

    allUsers.forEach(u => {
        const key = u.createdAt.toLocaleString('en-US', { month: 'short' })
        if (trends[key]) trends[key].users++
    })

    allTrips.forEach(t => {
        const key = t.createdAt.toLocaleString('en-US', { month: 'short' })
        if (trends[key]) trends[key].trips++
    })

    // Cumulative-ish or just monthly? Let's do monthly count for now. 
    // If we want cumulative growth, we'd need to add previous months.
    // Let's stick to "New Users/Trips per Month" which is easier to calculate correctly here.

    const trendData = Object.entries(trends).map(([name, data]) => ({
        name,
        users: data.users,
        trips: data.trips
    }))

    return {
        users: usersWithStats,
        cities: topCities,
        activities: topActivities,
        trends: trendData,
        stats: {
            totalUsers: allUsers.length,
            totalTrips: allTrips.length,
            activeTrips: allTrips.filter(t => {
                const now = new Date()
                return t.startDate && t.endDate && t.startDate <= now && t.endDate >= now
            }).length
        }
    }
}
