"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

export type RecommendationItem = {
    id: string
    title: string
    category: string | null
    cost: number
    location: string
    tripId: string
    tripTitle: string
    userName: string
    userAvatar: string | null
}

// --- Retry Helper (Duplicated for server action isolation) ---
const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES, delay = BASE_DELAY): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (retries > 0 && (error.message?.includes("429") || error.message?.includes("Too Many Requests") || error.status === 429)) {
            console.warn(`Rate limit hit in recommendations. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(fn, retries - 1, delay * 2);
        }
        throw error;
    }
}

export async function getRecommendations(
    budget: number,
    location: string,
    date: string,
    activityPreference: string
): Promise<RecommendationItem[]> {
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
        if (!apiKey) {
            console.error("Gemini API Key is missing")
            return []
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const prompt = `
            Act as a local travel expert.
            I need 5-8 recommendations for a trip to "${location}".
            
            Context:
            - Budget Limit: ${budget} (in local currency or generalized units)
            - Date: ${date} (consider seasonal weather/events)
            - Interests: ${activityPreference || "General sightseeing, food, hidden gems"}

            Return valid JSON array where each object has:
            - title: Name of the activity/place
            - category: One word (e.g. Food, Adventure, Culture)
            - cost: Estimated numeric cost (0 if free)
            - location: Specific neighborhood or area name

            Ensure the total cost of all items doesn't excessively exceed the budget if they are meant to be done in one day, but give variety.
            JSON Array ONLY. No markdown.
        `

        const result = await fetchWithRetry(() => model.generateContent(prompt));
        const text = result.response.text();
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const data = JSON.parse(jsonString) as Partial<RecommendationItem>[];

        return data.map((item, index) => ({
            id: `ai-${Date.now()}-${index}`,
            title: item.title || "Mystery Activity",
            category: item.category || "General",
            cost: item.cost || 0,
            location: item.location || location,
            tripId: "ai-generated",
            tripTitle: "AI Curation",
            userName: "Gemini Agent",
            userAvatar: null
        }));

    } catch (error) {
        console.error("Gemini Recommendation Error:", error);
        // Fallback to empty list so UI handles "no results" gracefully
        return [];
    }
}
