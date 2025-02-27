'use client'
import { useState, useEffect } from 'react'
import { FiSunrise, FiMapPin } from 'react-icons/fi'
import clsx from 'clsx'

export default function SleepTimeCalculator() {
    const [location, setLocation] = useState('')
    const [sleepTime, setSleepTime] = useState('')
    const [sunriseTime, setSunriseTime] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch location and sunrise data
                const locationRes = await fetch('/api/location')
                const locationData = await locationRes.json()
                if (!locationRes.ok) throw new Error(locationData.error || 'Failed to fetch location')

                setLocation(locationData.location)

                const sunriseRes = await fetch(`/api/sunrise?lat=${locationData.lat}&lng=${locationData.lng}`)
                const sunriseData = await sunriseRes.json()
                if (!sunriseRes.ok) throw new Error(sunriseData.error || 'Failed to fetch sunrise time')

                const sunriseDate = new Date(sunriseData.sunrise)
                setSunriseTime(
                    sunriseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                )

                const wakeupDate = new Date(sunriseDate.getTime() - 15 * 60 * 1000) // 15 minutes before sunrise
                const sleepDate = new Date(wakeupDate.getTime() - 8 * 60 * 60 * 1000) // 8 hours of sleep

                setSleepTime(sleepDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }))
            } catch (err: unknown) {
                const error = err instanceof Error ? err : new Error(String(err))
                setError(error.message)
            }
        }

        fetchData()
    }, [])

    return (
        <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-300 via-pink-200 to-orange-100 text-gray-900 p-6'>
            {error ? (
                <p className='text-red-600 text-lg'>Error: {error}</p>
            ) : (
                <>
                    <div className='flex flex-col items-center gap-2 animate-fade-in'>
                        <p className='text-sm text-gray-600'>Bedtime</p>
                        <h1
                            className={clsx('text-6xl font-bold mb-4 opacity-0 transition-opacity duration-1000', {
                                'opacity-100': sleepTime
                            })}
                            style={{ minHeight: '72px' }} // Reserve space to prevent jumping
                        >
                            {sleepTime || '...'}
                        </h1>
                        <p
                            className={clsx('text-xs text-gray-500 opacity-0 transition-opacity duration-1000', {
                                'opacity-100': sunriseTime
                            })}
                            style={{ minHeight: '16px' }} // Reserve space for sunrise text
                        >
                            {sunriseTime ? `Sunrise: ${sunriseTime}` : ''}
                        </p>
                        <div
                            className={clsx(
                                'flex items-center text-lg gap-2 opacity-0 transition-opacity duration-1000',
                                { 'opacity-100': location }
                            )}
                        >
                            <FiMapPin size={24} className='text-gray-700' />
                            <span>{location || 'Fetching location...'}</span>
                        </div>
                    </div>
                    <FiSunrise size={80} className='mt-8 text-yellow-400 animate-bounce-slow' />
                </>
            )}
        </div>
    )
}
