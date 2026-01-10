'use server'

import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function updateUserLocation(latitude: number, longitude: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        await db.update(users)
            .set({
                lastLatitude: latitude.toString(),
                lastLongitude: longitude.toString()
            })
            .where(eq(users.supabaseId, user.id))

        return { success: true }
    } catch (error) {
        console.error("Error updating user location:", error)
        return { success: false, error: "Failed to update location" }
    }
}
