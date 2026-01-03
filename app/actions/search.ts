"use server"

interface SearchItem {
    id: string
    name: string
    type: "City"
    category: string
    details: string
}

export async function searchCities(query: string): Promise<SearchItem[]> {
    if (!query || query.length < 3) return []

    try {
        const apiKey = process.env.CITY_API_KEY
        if (!apiKey) {
            console.warn("CITY_API_KEY is not set.")
            return []
        }

        const response = await fetch(
            `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(query)}&limit=10&sort=-population`,
            {
                headers: {
                    "X-RapidAPI-Key": apiKey,
                    "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
                },
            }
        )

        if (!response.ok) {
            // Log detailed error for server side debugging but don't crash client
            console.error("City API Error:", response.status, await response.text())
            return []
        }

        const data = await response.json()

        // Map external API response to our internal SearchItem format
        return data.data.map((city: any) => ({
            id: `${city.id}`, // Ensure string ID
            name: city.city,
            type: "City",
            category: city.country,
            details: `${city.region || ''}, ${city.country}`,
        }))

    } catch (error) {
        console.error("Search failed:", error)
        return []
    }
}
