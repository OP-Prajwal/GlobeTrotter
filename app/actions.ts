"use server";

import { db } from "@/lib/db";
import { trips, users } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTrip(formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const coverPhoto = formData.get("coverPhoto") as string;

    try {
        // 1. Get or Create a User
        // We need a user to satisfy the foreign key constraint.
        // Since we don't have auth, we'll check if any user exists.
        const existingUsers = await db.select().from(users).limit(1);
        let userId = "";

        if (existingUsers.length > 0) {
            userId = existingUsers[0].id;
        } else {
            // Create a dummy user
            const newUser = await db.insert(users).values({
                email: "demo@example.com",
                supabaseId: "demo-user-" + Math.random(), // Unique dummy ID
                firstName: "Demo",
                lastName: "User"
            }).returning({ id: users.id });
            userId = newUser[0].id;
        }

        // 2. Insert the Trip
        await db.insert(trips).values({
            title,
            description,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            budget: "0", // Default budget
            userId: userId,
            isPublic: false,
            // coverPhoto: coverPhoto // Schema doesn't have this yet, so we can't save it.
        });

        console.log("Trip saved to DB:", { title, userId });

    } catch (error) {
        console.error("Failed to save trip to DB:", error);
        // We still redirect so the user doesn't get stuck, but data won't be there.
    }

    revalidatePath("/my-trips");
    redirect("/my-trips");
}
