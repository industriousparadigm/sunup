import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
    try {
        // Extract IP address from query parameters (passed from client-side)
        const userIp = req.nextUrl.searchParams.get("ip")
        if (!userIp) {
            console.error("Missing IP address in query parameters.")
            return new Response(
                JSON.stringify({ error: "IP address is required." }),
                { status: 400 }
            )
        }

        console.log(`Received IP: ${userIp}`) // Log IP for debugging

        // Build API request to ipapi.co
        const apiUrl = `https://ipapi.co/${userIp}/json/`
        console.log(`Fetching location data from: ${apiUrl}`)

        const response = await fetch(apiUrl)

        if (!response.ok) {
            console.error(`API Error: ${response.status} - ${response.statusText}`)
            const errorBody = await response.text()
            console.error(`API Error Body: ${errorBody}`)
            return new Response(
                JSON.stringify({ error: `External API error: ${response.statusText}` }),
                { status: response.status }
            )
        }

        const data = await response.json()
        console.log(`Location data retrieved:`, data)

        // Extract meaningful location data
        const locationName = `${data.city}, ${data.country_name}`

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
