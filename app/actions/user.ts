'use server'

import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

/**
 * Updates the user's current location in the database.
 * This is a fire-and-forget action from the client's perspective for performance,
 * but handles validation and errors internally.
 */
export async function updateUserLocation(
    latitude: number,
    longitude: number,
    accuracy?: number
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: "Unauthorized" }
    }

    // Basic Validation: Check for valid coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return { success: false, error: "Invalid coordinates" }
    }

    try {
        await db.update(users)
            .set({
                lastLatitude: latitude.toString(),
                lastLongitude: longitude.toString(),
                locationAccuracy: accuracy ? accuracy.toString() : null,
                lastLocationUpdatedAt: new Date(),
            })
            .where(eq(users.supabaseId, user.id))

        return { success: true }
    } catch (error) {
        console.error("Error updating user location:", error)
        // In production, we might want to log this to an external monitoring service
        return { success: false, error: "Failed to update location" }
    }
}
