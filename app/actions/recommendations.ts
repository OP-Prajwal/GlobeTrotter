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

// --- EXTENSIVE HARDCODED DATASET (Fallback & Demo) ---
const STATIC_DATABASE: Record<string, Partial<RecommendationItem>[]> = {
    "delhi": [
        { title: "Street Food Tour at Chandni Chowk", category: "Food", cost: 1500, location: "Old Delhi" },
        { title: "Visit Humayun's Tomb", category: "Culture", cost: 500, location: "Nizamuddin" },
        { title: "Shopping at Khan Market", category: "Shopping", cost: 5000, location: "Khan Market" },
        { title: "Qutub Minar Complex", category: "History", cost: 600, location: "Mehrauli" },
        { title: "Hauz Khas Village Nightlife", category: "Nightlife", cost: 4000, location: "Hauz Khas" },
        { title: "National Museum Tour", category: "Museum", cost: 200, location: "Janpath" },
        { title: "Akshardham Temple Light Show", category: "Culture", cost: 300, location: "NH 24" },
        { title: "Sundar Nursery Picnic", category: "Relaxation", cost: 100, location: "Nizamuddin" },
    ],
    "mumbai": [
        { title: "Gateway of India Ferry Ride", category: "Activity", cost: 200, location: "Colaba" },
        { title: "Street Food at Juhu Beach", category: "Food", cost: 800, location: "Juhu" },
        { title: "Marine Drive Sunset Walk", category: "Relaxation", cost: 0, location: "Marine Drive" },
        { title: "Elephanta Caves Tour", category: "History", cost: 2500, location: "Elephanta Island" },
        { title: "Colaba Causeway Shopping", category: "Shopping", cost: 3000, location: "Colaba" },
        { title: "Bollywood Film City Tour", category: "Entertainment", cost: 6000, location: "Goregaon" },
    ],
    "bangalore": [
        { title: "Cubbon Park Morning Walk", category: "Nature", cost: 0, location: "Central Bangalore" },
        { title: "Microbrewery Hopping", category: "Nightlife", cost: 3500, location: "Indiranagar" },
        { title: "Tech Park Visit", category: "Business", cost: 0, location: "Electronic City" },
        { title: "Nandi Hills Sunrise", category: "Adventure", cost: 1500, location: "Nandi Hills" },
        { title: "Bangalore Palace Tour", category: "History", cost: 500, location: "Vasanth Nagar" },
    ],
    "paris": [
        { title: "Eiffel Tower Summit", category: "Sightseeing", cost: 8500, location: "Champ de Mars" },
        { title: "Louvre Museum Guided Tour", category: "Art", cost: 4500, location: "Rue de Rivoli" },
        { title: "Seine River Cruise", category: "Romance", cost: 2000, location: "Port de la Bourdonnais" },
        { title: "Montmartre Food Walk", category: "Food", cost: 6000, location: "18th Arrondissement" },
        { title: "Versailles Palace Day Trip", category: "History", cost: 9000, location: "Versailles" },
    ],
    "tokyo": [
        { title: "Shibuya Crossing Photo Op", category: "Sightseeing", cost: 0, location: "Shibuya" },
        { title: "Senso-ji Temple Visit", category: "Culture", cost: 0, location: "Asakusa" },
        { title: "Sushi Breakfast at Toyosu", category: "Food", cost: 4000, location: "Toyosu Market" },
        { title: "TeamLab Planets", category: "Art", cost: 3500, location: "Toyosu" },
        { title: "Akihabara Anime Shopping", category: "Shopping", cost: 5000, location: "Akihabara" },
    ],
    "dubai": [
        { title: "Burj Khalifa At the Top", category: "Sightseeing", cost: 4500, location: "Downtown Dubai" },
        { title: "Desert Safari & BBQ", category: "Adventure", cost: 6500, location: "Dubai Desert" },
        { title: "Dubai Mall Aquarium", category: "Family", cost: 3000, location: "Dubai Mall" },
        { title: "Old Dubai Souk Tour", category: "Culture", cost: 1500, location: "Deira" },
        { title: "Marina Dhow Cruise", category: "Dining", cost: 5000, location: "Dubai Marina" },
    ]
}

// Generic fallback if city not in database
const GENERIC_ACTIVITIES = [
    { title: "City Center Heritage Walk", category: "Culture", cost: 500 },
    { title: "Local Market Exploration", category: "Shopping", cost: 1500 },
    { title: "Famous Museum Visit", category: "History", cost: 1000 },
    { title: "Botanical Garden Picnic", category: "Nature", cost: 300 },
    { title: "Downtown Food Crawl", category: "Food", cost: 2000 },
    { title: "Panoramic City View", category: "Sightseeing", cost: 1200 },
    { title: "Sunset River/Lake Walk", category: "Relaxation", cost: 0 },
    { title: "Art Gallery Hopping", category: "Art", cost: 800 },
]

export async function getRecommendations(
    budget: number,
    location: string,
    date: string,
    activityPreference: string
): Promise<RecommendationItem[]> {
    // Simulate API delay for realism
    await new Promise(resolve => setTimeout(resolve, 800))

    const searchKey = location.toLowerCase().trim()
    let rawItems: Partial<RecommendationItem>[] = []

    // 1. Precise City Match
    if (STATIC_DATABASE[searchKey]) {
        rawItems = STATIC_DATABASE[searchKey]
    } else {
        // 2. Fuzzy Match (e.g. "New Delhi" matches "delhi")
        const foundKey = Object.keys(STATIC_DATABASE).find(k => searchKey.includes(k) || k.includes(searchKey))
        if (foundKey) {
            rawItems = STATIC_DATABASE[foundKey]
        } else {
            // 3. Generic Fallback adapted to location
            rawItems = GENERIC_ACTIVITIES.map(item => ({
                ...item,
                location: `${location} ${item.title.split(" ").pop()}` // e.g. "London Walk"
            }))
        }
    }

    // Filter by Budget
    let filtered = rawItems.filter(item => (item.cost || 0) <= budget)

    // Filter by Activity (simple string check)
    if (activityPreference && activityPreference.length > 2) {
        const pref = activityPreference.toLowerCase()
        // Boost relevance: items matching preference go to top
        filtered = filtered.sort((a, b) => {
            const aMatch = (a.category?.toLowerCase().includes(pref) || a.title?.toLowerCase().includes(pref)) ? 1 : 0
            const bMatch = (b.category?.toLowerCase().includes(pref) || b.title?.toLowerCase().includes(pref)) ? 1 : 0
            return bMatch - aMatch
        })
    }

    // Ensure we send something if strict budget filtered everything out
    if (filtered.length === 0 && rawItems.length > 0) {
        // Return cheapest items
        filtered = rawItems.sort((a, b) => (a.cost || 0) - (b.cost || 0)).slice(0, 3)
    }

    return filtered.map((item, index) => ({
        id: `static-${index}-${Date.now()}`,
        title: item.title || "Unknown Activity",
        category: item.category || "General",
        cost: item.cost || 0,
        location: item.location || location,
        tripId: "static-data",
        tripTitle: "Curated Guide",
        userName: "GlobeTrotter Guide",
        userAvatar: null
    }))
}
