import { NextRequest } from "next/server"

const cache = new Map() // In-memory cache
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export async function GET(req: NextRequest) {
    try {
        const userIp =
            req.headers.get("x-forwarded-for")?.split(",")[0] || // Extract first IP from x-forwarded-for
            req.headers.get("x-real-ip") || // Fallback for x-real-ip
            "127.0.0.1" // Default for local testing
        console.log(`Detected IP: ${userIp}`)

        // Check cache for the IP
        if (cache.has(userIp)) {
            console.log(`Cache hit for IP: ${userIp}`)
            return new Response(JSON.stringify(cache.get(userIp)), { status: 200 })
        }

        console.log(`Cache miss for IP: ${userIp}. Fetching from API.`)

        // Step 2: Use ipapi.co to get location details
        const apiUrl = `https://ipapi.co/${userIp}/json/`
        console.log(`Fetching location data from: ${apiUrl}`)
        const locationRes = await fetch(apiUrl)

        if (!locationRes.ok) {
            console.error(`Location API Error: ${locationRes.status} - ${locationRes.statusText}`)
            const errorBody = await locationRes.text()
            console.error(`Location API Error Body: ${errorBody}`)
            return new Response(
                JSON.stringify({ error: `Location API error: ${locationRes.statusText}` }),
                { status: locationRes.status }
            )
        }

        const locationData = await locationRes.json()
        console.log(`Location data retrieved:`, locationData)

        // Step 3: Format and cache location data
        const locationName = `${locationData.city}, ${locationData.country_name}`
        const cachedData = {
            location: locationName,
            lat: locationData.latitude,
            lng: locationData.longitude,
        }

        // Cache the result for 24 hours
        cache.set(userIp, cachedData)
        setTimeout(() => {
            console.log(`Cache expired for IP: ${userIp}`)
            cache.delete(userIp)
        }, CACHE_TTL)

        return new Response(JSON.stringify(cachedData), { status: 200 })
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error("Unexpected error occurred")
        console.error("Error in GET handler:", error.message)
        return new Response(
            JSON.stringify({ error: error.message || "Service unavailable" }),
            { status: 500 }
        )
    }
}
