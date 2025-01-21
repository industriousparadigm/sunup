import { NextRequest } from "next/server"

const cache = new Map()

export async function GET(req: NextRequest) {
    try {
        const userIp =
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            "127.0.0.1" // Default to localhost

        if (userIp === "127.0.0.1" || userIp === "::1") {
            console.error("Using mock data for localhost")
            return new Response(
                JSON.stringify({
                    location: "Maragogi, Brazil",
                    lat: -8.98323158618796,
                    lng: -35.18994999999999,
                }),
                { status: 200 }
            )
        }

        if (cache.has(userIp)) {
            return new Response(JSON.stringify(cache.get(userIp)), { status: 200 })
        }

        const apiUrl = `https://ipapi.co/${userIp}/json/`
        const response = await fetch(apiUrl)

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`)
        }

        const data = await response.json()
        const locationName = `${data.city}, ${data.country_name}`

        // Cache result for 24 hours
        cache.set(userIp, { location: locationName, lat: data.latitude, lng: data.longitude })
        setTimeout(() => cache.delete(userIp), 24 * 60 * 60 * 1000)

        return new Response(
            JSON.stringify({ location: locationName, lat: data.latitude, lng: data.longitude }),
            { status: 200 }
        )
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error("Unexpected error occurred")
        console.error("Error in GET handler:", error.message)
        return new Response(
            JSON.stringify({ error: error.message || "Service unavailable" }),
            { status: 500 }
        )
    }
}
