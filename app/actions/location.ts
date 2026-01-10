"use server"

const APIIP_KEY = "1c7287f0-635f-45b2-84c4-a6286b8cdbb5" // User provided key

export interface LocationData {
    success: boolean
    city?: string
    region?: string
    country?: string
    latitude?: number
    longitude?: number
    error?: string
}

export async function detectLocationWithIP(): Promise<LocationData> {
    try {
        const response = await fetch(`https://apiip.net/api/check?accessKey=${APIIP_KEY}`, { cache: 'no-store' })

        if (!response.ok) {
            throw new Error(`APIIP failed with status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success === false) { // APIIP specifically returns explicit success: false on error
            throw new Error(data.message || "Unknown APIIP error")
        }

        return {
            success: true,
            city: data.city,
            region: data.regionName,
            country: data.countryName,
            latitude: data.latitude,
            longitude: data.longitude
        }

    } catch (error) {
        console.error("IP Geolocation Error:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to detect location"
        }
    }
}
