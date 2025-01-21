import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
    try {
        // Step 1: Fetch user's IP using ipify.org
        console.log("Fetching user IP...")
        const ipRes = await fetch("https://api.ipify.org?format=json")
        if (!ipRes.ok) {
            console.error(`Failed to fetch client IP: ${ipRes.statusText}`)
            return new Response(
                JSON.stringify({ error: "Unable to determine client IP." }),
                { status: 500 }
            )
        }
        const ipData = await ipRes.json()
        const userIp = ipData.ip
        console.log(`User IP fetched: ${userIp}`)

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

        // Step 3: Format and return location data
        const locationName = `${locationData.city}, ${locationData.country_name}`
        return new Response(
            JSON.stringify({ location: locationName, lat: locationData.latitude, lng: locationData.longitude }),
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
