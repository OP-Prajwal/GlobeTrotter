"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { getDestinationImage } from "@/lib/api/discovery"

export interface LocationDetails {
    description: string
    bestPlaces: {
        name: string
        description: string
        image: string
    }[]
}

export type GeminiResponse =
    | { success: true; data: LocationDetails }
    | { success: false; error: string }

// --- Caching Mechanism ---
const locationCache = new Map<string, LocationDetails>();

// --- Retry Helper ---
const MAX_RETRIES = 5;
const BASE_DELAY = 2000; // Start with 2 seconds

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES, delay = BASE_DELAY): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (retries > 0 && (error.message?.includes("429") || error.message?.includes("Too Many Requests") || error.status === 429)) {
            let waitTime = delay;

            // Try to parse "retry in X s" from error message
            const match = error.message?.match(/retry in (\d+(\.\d+)?)s/);
            if (match && match[1]) {
                const parsedWait = Math.ceil(parseFloat(match[1]) * 1000);
                console.log(`API requested wait of ${parsedWait}ms`);
                // Add a small buffer (1s) to be safe
                waitTime = parsedWait + 1000;
            }

            console.warn(`Rate limit hit. Retrying in ${waitTime}ms... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, waitTime));

            // If we extracted a specific wait time, use it for the next delay check too (or reset to base)
            // But exponential backoff is safer if we didn't find a match.
            const nextDelay = match ? waitTime * 1.5 : delay * 2;

            return fetchWithRetry(fn, retries - 1, nextDelay);
        }
        throw error;
    }
}

export async function getLocationDetails(locationName: string): Promise<GeminiResponse> {
    try {
        // 1. Check Cache
        if (locationCache.has(locationName)) {
            console.log(`Cache hit for ${locationName}`);
            return { success: true, data: locationCache.get(locationName)! };
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
        if (!apiKey) {
            console.warn("Gemini API Key is missing")
            return { success: false, error: "Configuration Error: Gemini API Key is missing. Please add GEMINI_API_KEY to your .env file." }
        }

        // List models to debug "Model not found" error
        try {
            const listModelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
            const listModelsData = await listModelsResponse.json()
            console.log("Available Gemini Models:", JSON.stringify(listModelsData, null, 2))
        } catch (e) {
            console.error("Failed to list models:", e)
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        // Switching to gemini-2.5-flash as it is available and 1.5 is missing/deprecated
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const prompt = `
            Give me a travel guide for ${locationName}.
            Return ONLY a valid JSON object with this structure:
            {
                "description": "A short, engaging description of the city (max 2 sentences).",
                "bestPlaces": [
                    { "name": "Place Name 1", "description": "Short description of place 1" },
                    { "name": "Place Name 2", "description": "Short description of place 2" },
                    { "name": "Place Name 3", "description": "Short description of place 3" },
                    { "name": "Place Name 4", "description": "Short description of place 4" }
                ]
            }
        `

        const result = await fetchWithRetry(() => model.generateContent(prompt));
        const response = await result.response
        const text = response.text()

        // Clean up markdown code blocks if present
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim()

        const data = JSON.parse(jsonString) as { description: string, bestPlaces: { name: string, description: string }[] }

        // Fetch images for each place in parallel
        const placesWithImages = await Promise.all(
            data.bestPlaces.map(async (place) => {
                const imageUrl = await getDestinationImage(`${place.name} ${locationName}`)
                return {
                    ...place,
                    image: imageUrl
                }
            })
        )

        const responseData = {
            description: data.description,
            bestPlaces: placesWithImages
        };

        // 3. Populate Cache
        locationCache.set(locationName, responseData);

        return {
            success: true,
            data: responseData
        }

    } catch (error) {
        console.error("Gemini API Error:", error)
        let errorMessage = "Failed to generate content."
        if (error instanceof Error) {
            console.error("Gemini Error Message:", error.message)
            errorMessage = error.message
        }
        return { success: false, error: errorMessage }
    }
}
