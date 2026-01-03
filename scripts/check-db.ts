import { db } from "../lib/db";
import { trips } from "../lib/db/schema";

async function main() {
    try {
        console.log("Checking DB connection...");
        const result = await db.select().from(trips).limit(1);
        console.log("Success! Found trips:", result);
    } catch (error) {
        console.error("DB Check Failed:", error);
    }
    process.exit(0);
}

main();
