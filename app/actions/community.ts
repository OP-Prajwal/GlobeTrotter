"use server"

import { db } from "@/lib/db"
import { trips, users } from "@/lib/db/schema"
import { eq, desc, sql, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type CommunityPost = {
    id: string
    title: string
    description: string | null
    startDate: Date | null
    createdAt: Date
    location: string | null
    latitude: number | null
    longitude: number | null
    likesCount: number
    images: string[] | null
    author: {
        firstName: string | null
        lastName: string | null
        avatarUrl: string | null
    }
}

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return d
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}

export async function getCommunityPosts(searchQuery: string = "", userLat?: number, userLng?: number): Promise<CommunityPost[]> {
    try {
        const results = await db
            .select({
                tripId: trips.id,
                title: trips.title,
                description: trips.description,
                startDate: trips.startDate,
                createdAt: trips.createdAt,
                location: trips.location,
                latitude: trips.latitude,
                longitude: trips.longitude,
                likesCount: trips.likesCount,
                images: trips.images,
                firstName: users.firstName,
                lastName: users.lastName,
                avatarUrl: users.avatarUrl
            })
            .from(trips)
            .leftJoin(users, eq(trips.userId, users.id))
            .where(eq(trips.isPublic, true))
            .orderBy(desc(trips.createdAt))
            .limit(50) // Fetch more to filter locally for proximity

        let posts = results.map(row => ({
            id: row.tripId,
            title: row.title,
            description: row.description,
            startDate: row.startDate,
            createdAt: row.createdAt,
            location: row.location,
            latitude: row.latitude ? parseFloat(row.latitude) : null,
            longitude: row.longitude ? parseFloat(row.longitude) : null,
            likesCount: row.likesCount,
            images: row.images,
            author: {
                firstName: row.firstName,
                lastName: row.lastName,
                avatarUrl: row.avatarUrl
            }
        }))

        // If user provided coordinates AND we are explicitly asked to filter/sort (which is implied if they pass them for "Nearby")
        // Actually, the frontend controls the flow. If frontend says "Nearby", it passes coords.
        if (userLat != null && userLng != null) {
            // Calculate distance for each post
            const postsWithDistance = posts.map(p => {
                const dist = (p.latitude != null && p.longitude != null)
                    ? calculateDistance(userLat, userLng, p.latitude, p.longitude)
                    : Infinity
                return { ...p, distance: dist }
            })

            // Sort by distance (ascending)
            postsWithDistance.sort((a, b) => a.distance - b.distance)

            // Filter out things too far? Optional. For now just sort.
            posts = postsWithDistance
        }

        return posts

    } catch (error) {
        console.error("Failed to fetch community posts:", error)
        return []
    }
}

export async function getUserTripsForSharing() {
    try {
        const myTrips = await db.select().from(trips).orderBy(desc(trips.createdAt))
        return myTrips
    } catch (e) {
        return []
    }
}

export async function shareTrip(tripId: string, location: string, description: string, lat?: number, lng?: number, images?: string[]) {
    try {
        await db.update(trips)
            .set({
                isPublic: true,
                location: location,
                description: description,
                latitude: lat ? lat.toString() : null, // Store as decimal string
                longitude: lng ? lng.toString() : null,
                images: images || [],
                createdAt: new Date()
            })
            .where(eq(trips.id, tripId))

        revalidatePath("/community")
        return { success: true }
    } catch (error) {
        console.error("Share failed:", error)
        return { success: false }
    }
}

export async function likeTrip(tripId: string) {
    try {
        await db.update(trips)
            .set({ likesCount: sql`${trips.likesCount} + 1` })
            .where(eq(trips.id, tripId))

        revalidatePath("/community")
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}
