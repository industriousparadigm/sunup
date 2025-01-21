import { NextRequest } from "next/server"

const cache = new Map()

export async function GET(req: NextRequest) {
    try {
        // Extract IP address (handle headers correctly)
        const ip =
            req.headers.get('x-forwarded-for')?.split(',')[0] || // If multiple IPs, take the first one
            req.headers.get('x-real-ip') ||
            '127.0.0.1' // Fallback to localhost for development

        console.log(`Extracted IP: ${ip}`) // Log the IP for debugging

        // Handle localhost or development environment
        if (ip === '127.0.0.1' || ip === '::1') {
            console.log('Using mock data for localhost')
            return new Response(
                JSON.stringify({
                    location: 'Maragogi, Brazil',
                    lat: -8.98323158618796,
                    lng: -35.18994999999999
                }),
                { status: 200 }
            )
        }

        // Check cache
        if (cache.has(ip)) {
            console.log(`Cache hit for IP: ${ip}`)
            return new Response(JSON.stringify(cache.get(ip)), { status: 200 })
        }

        console.log(`Cache miss for IP: ${ip}. Fetching from API.`)

        // Fetch location from external API
        const response = await fetch('https://ipapi.co/json/')

        if (!response.ok) {
            console.error(`API Error: ${response.status} - ${response.statusText}`)
            return new Response(
                JSON.stringify({ error: `External API error: ${response.statusText}` }),
                { status: response.status }
            )
        }

        const data = await response.json()
        console.log(`API Response for IP ${ip}:`, data)

        const locationName = `${data.city}, ${data.country_name}`

        // Cache the result for 24 hours
        cache.set(ip, { location: locationName, lat: data.latitude, lng: data.longitude })
        setTimeout(() => {
            console.log(`Cache cleared for IP: ${ip}`)
            cache.delete(ip)
        }, 24 * 60 * 60 * 1000) // Remove after 24 hours

        return new Response(JSON.stringify({ location: locationName, lat: data.latitude, lng: data.longitude }), { status: 200 })
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('An unexpected error occurred')
        console.error(`Error processing request: ${error.message}`, error)
        return new Response(JSON.stringify({ error: error.message || 'Service unavailable' }), { status: 500 })
    }
}
