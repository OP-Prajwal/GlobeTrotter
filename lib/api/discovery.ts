// lib/api/discovery.ts

export interface Destination {
    id: string;
    name: string;
    region: string;
    image: string;
    matchType: 'global' | 'local';
}

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || 'YOUR_UNSPLASH_KEY';

// 1. Reverse Geocoding (BigDataCloud)
export async function getRegionFromCoordinates(lat: number, lng: number): Promise<{ region: string, city?: string, country?: string }> {
    try {
        const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        );
        const data = await response.json();
        const region = data.principalSubdivision || data.countryName || 'Unknown Region';
        return {
            region,
            city: data.city || data.locality,
            country: data.countryName
        };
    } catch (error) {
        console.error("Reverse Geocoding Error:", error);
        return { region: 'Unknown Region' };
    }
}

// 2. Fetch Regional Destinations (GeoNames API)
export async function getRegionalDestinations(region: string, country?: string): Promise<Destination[]> {
    const destinations: Destination[] = [];
    const GEONAMES_USERNAME = process.env.NEXT_PUBLIC_GEONAMES_USERNAME || 'demo';

    console.log(`Searching for cities in Region: ${region}, Country: ${country}`);

    try {
        const fetchCities = async (query: string, limit: number, isCountrySearch = false) => {
            let url = `http://api.geonames.org/searchJSON?q=${encodeURIComponent(query)}&featureClass=P&maxRows=${limit + 5}&orderby=population&username=${GEONAMES_USERNAME}&style=MEDIUM`;
            if (isCountrySearch) {
                url = `http://api.geonames.org/searchJSON?q=${encodeURIComponent(query)}&featureClass=P&maxRows=${limit + 5}&orderby=population&username=${GEONAMES_USERNAME}&style=MEDIUM&countryBias=${query}`;
            } else if (country) {
                url += `&countryBias=${country}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            if (data.status) {
                console.error(`GeoNames Error (${query}):`, data.status);
                return [];
            }
            return data.geonames || [];
        };

        // Parallel Fetch: Region (Primary) + Country (Secondary/Mix)
        const [regionResults, countryResults] = await Promise.all([
            fetchCities(region, 5),
            country ? fetchCities(country, 5, true) : Promise.resolve([])
        ]);

        const processedIds = new Set<string>();

        const processCity = async (city: any, type: 'local' | 'global') => {
            // Filter out actual Region/Country name matches
            if (city.name === region || city.name === country || processedIds.has(city.geonameId)) return null;

            processedIds.add(city.geonameId);
            const imageUrl = await getDestinationImage(city.name);

            return {
                id: String(city.geonameId),
                name: city.name,
                region: city.adminName1 || city.countryName,
                image: imageUrl,
                matchType: type
            } as Destination;
        };

        // Strategy: Mix 3 Regional + 2 National
        const rawRegional = regionResults.filter((c: any) => c.name !== region);
        const rawNational = countryResults.filter((c: any) => c.name !== country && c.name !== region);

        // Take top 3 Regional
        for (const city of rawRegional.slice(0, 3)) {
            const dest = await processCity(city, 'local');
            if (dest) destinations.push(dest);
        }

        // Take top 2 National (that aren't already added)
        for (const city of rawNational) {
            if (destinations.length >= 5) break;
            const dest = await processCity(city, 'local');
            if (dest) {
                destinations.push(dest);
            }
        }

        // Fill remaining slots with more Regional if needed
        for (const city of rawRegional.slice(3)) {
            if (destinations.length >= 5) break;
            const dest = await processCity(city, 'local');
            if (dest) destinations.push(dest);
        }

    } catch (error) {
        console.error("GeoNames API Error:", error);
    }

    return destinations;
}

// 3. Fetch Destination Image (Unsplash)
// Scenery/Nature fallback images if specific city search fails
const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80', // Switzerland Nature
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // Beach
    'https://images.unsplash.com/photo-1519681393798-2f13fbe68ac5?auto=format&fit=crop&w=800&q=80', // Mountain
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80', // Field
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80'  // Lake
];

export async function getDestinationImage(query: string): Promise<string> {
    const getRandomFallback = () => FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];

    try {
        // If no key, return generic scenery
        if (!process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY && UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_KEY') {
            return getRandomFallback();
        }

        const response = await fetch(
            `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query + ' travel')}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
        );
        const data = await response.json();
        return data.urls?.regular || getRandomFallback();
    } catch (error) {
        console.warn("Unsplash API Error:", error);
        return getRandomFallback();
    }
}

export const GLOBAL_FAVORITES: Destination[] = [
    { id: '1', name: 'Paris', region: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80', matchType: 'global' },
    { id: '2', name: 'Tokyo', region: 'Japan', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80', matchType: 'global' },
    { id: '3', name: 'New York', region: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80', matchType: 'global' },
    { id: '4', name: 'London', region: 'UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80', matchType: 'global' },
    { id: '5', name: 'Rome', region: 'Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80', matchType: 'global' },
];
