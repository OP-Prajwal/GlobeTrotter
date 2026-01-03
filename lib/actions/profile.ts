'use server'

import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { users, trips } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getUserProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Try to find user in DB
    const dbUser = await db.query.users.findFirst({
        where: eq(users.supabaseId, user.id)
    })

    if (dbUser) return dbUser

    // If not found, create them based on Auth metadata (Lazy Sync)
    // This handles cases where signup didn't sync or it's a legacy user
    const newUser = await db.insert(users).values({
        supabaseId: user.id,
        email: user.email!,
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        avatarUrl: user.user_metadata?.avatar_url || '',
    }).returning()

    return newUser[0]
}

export async function updateUserProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const bio = formData.get("bio") as string // Note: Schema doesn't have bio yet, we might need to add it or store in metadata. 
    // Schema check: users table has firstName, lastName, avatarUrl. No bio. 
    // I will add bio to the schema update task if needed, or just skip it for now.
    // Wait, the wireframe showed bio. I should probably add it to the schema.

    try {
        await db.update(users)
            .set({
                firstName,
                lastName,
                bio,
            })
            .where(eq(users.supabaseId, user.id))

        revalidatePath('/profile')
        return { success: true }
    } catch (error) {
        return { error: "Failed to update profile" }
    }
}

export async function getUserTrips() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const dbUser = await db.query.users.findFirst({
        where: eq(users.supabaseId, user.id)
    })

    if (!dbUser) return []

    const userTrips = await db.query.trips.findMany({
        where: eq(trips.userId, dbUser.id),
        orderBy: (trips, { desc }) => [desc(trips.createdAt)],
    })

    return userTrips
}
