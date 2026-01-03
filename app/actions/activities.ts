"use server"

interface SearchItem {
    id: string
    name: string
    type: "Activity" | "Attraction"
    category: string
    details: string
}

export async function searchActivities(query: string): Promise<SearchItem[]> {
    if (!query || query.length < 3) return []

    try {
        const apiKey = process.env.OPENTRIPMAP_API_KEY
        if (!apiKey) {
            console.warn("OPENTRIPMAP_API_KEY is not set.")
            return []
        }

        // Using Autosuggest for Activities/Places to be flexible with keyword search
        // But forcing kinds to filter out boring stuff if possible, or just using Autosuggest for broad activity matching
        // "Autosuggest" is best for keyword matching "Paragliding", "Museum", etc.
        const response = await fetch(
            `https://api.opentripmap.com/0.1/en/places/autosuggest?name=${encodeURIComponent(query)}&limit=10&apikey=${apiKey}`
        )

        if (!response.ok) return []
        const data = await response.json()

        // Filter OUT cities from this activity action (since we have a dedicated city action)
        const activities = data.features.filter((f: any) =>
            !f.properties.kind?.includes("city") && !f.properties.kind?.includes("town")
        )

        return activities.map((feature: any) => {
            const props = feature.properties
            return {
                id: props.xid || props.wikidata || crypto.randomUUID(),
                name: props.name,
                type: "Activity", // Labeling everything from OTM as Activity/Attraction here
                category: props.kinds ? props.kinds.split(",")[0].replace(/_/g, " ") : "Place",
                details: props.country || "World"
            }
        })

    } catch (error) {
        console.error("Activity search failed:", error)
        return []
    }
}
