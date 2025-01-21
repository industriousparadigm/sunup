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

        // Handle local or bogon IPs
        if (userIp === "::1" || userIp === "127.0.0.1") {
            console.log("Using mock data for localhost or loopback IP.")
            return new Response(
                JSON.stringify({
                    location: "Maragogi, Brazil",
                    lat: -8.98323158618796,
                    lng: -35.18994999999999,
                }),
                { status: 200 }
            )
        }

        // Check cache for the IP
        if (cache.has(userIp)) {
            console.log(`Cache hit for IP: ${userIp}`)
            return new Response(JSON.stringify(cache.get(userIp)), { status: 200 })
        }

        console.log(`Cache miss for IP: ${userIp}. Fetching from IPinfo API.`)

        // Fetch location data from IPinfo
        const apiUrl = `https://ipinfo.io/${userIp}?token=aa8fd5d8f657aa`
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

        // Handle missing or invalid location data
        if (!locationData.loc) {
            console.error("Location data is invalid or incomplete.")
            return new Response(
                JSON.stringify({ error: "Invalid location data received from API." }),
                { status: 500 }
            )
        }

        // Extract location details
        const [latitude, longitude] = locationData.loc.split(",")
        const locationName = `${locationData.city}, ${locationData.country}`
        const cachedData = {
            location: locationName,
            lat: parseFloat(latitude),
            lng: parseFloat(longitude),
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
