export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
  
    try {
      const response = await fetch(
        `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`
      )
      const data = await response.json()
      if (!response.ok || data.status !== 'OK') throw new Error('Failed to fetch sunrise data')
  
      return new Response(JSON.stringify({ sunrise: data.results.sunrise }), { status: 200 })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
  }
  