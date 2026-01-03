import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function updateDemoUsers() {
    try {
        console.log("🔄 Updating Demo users...");

        // Update all users with firstName "Demo" to "Traveler"
        const result = await db
            .update(users)
            .set({
                firstName: "Traveler"
            })
            .where(eq(users.firstName, "Demo"))
            .returning();

        console.log(`✅ Updated ${result.length} users from "Demo" to "Traveler"`);
        console.log("Updated users:", result);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error updating users:", error);
        process.exit(1);
    }
}

updateDemoUsers();
