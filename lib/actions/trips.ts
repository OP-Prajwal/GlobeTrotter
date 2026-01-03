'use server'

import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { users, trips } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function getTrips(): Promise<any[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const dbUser = await db.query.users.findFirst({
        where: eq(users.supabaseId, user.id)
    })

    if (!dbUser) return []

    // Fetch trips for the user
    // Note: The schema defines 'trips' table. We use query builder.
    const userTrips = await db.query.trips.findMany({
        where: eq(trips.userId, dbUser.id),
        orderBy: (trips, { desc }) => [desc(trips.createdAt)],
    })

    return userTrips
}
