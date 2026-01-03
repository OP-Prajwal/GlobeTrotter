"use server"

interface SearchItem {
    id: string
    name: string
    type: "City"
    category: string
    details: string
    latitude?: number
    longitude?: number
}

export async function searchDestinations(query: string): Promise<SearchItem[]> {
    if (!query || query.length < 3) return []

    try {
        const apiKey = process.env.DESTINATION_API_KEY // Dedicated Key for Cities
        if (!apiKey) {
            console.warn("DESTINATION_API_KEY is not set.")
            return []
        }

        const response = await fetch(
            `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(query)}&limit=5&sort=-population`,
            {
                headers: {
                    "X-RapidAPI-Key": apiKey,
                    "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
                },
            }
        )

        if (!response.ok) {
            console.error("Destination API Error:", response.status)
            return []
        }

        const data = await response.json()

        return data.data.map((city: any) => ({
            id: `${city.id}`,
            name: city.city,
            type: "City",
            category: city.country,
            details: `${city.region || ''}, ${city.country}`,
            latitude: city.latitude,
            longitude: city.longitude
        }))

    } catch (error) {
        console.error("Destination search failed:", error)
        return []
    }
}
