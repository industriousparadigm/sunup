import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'

const playfairDisplay = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair-display',
    display: 'swap'
})

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap'
})

export const metadata: Metadata = {
    title: 'Sleep Time App',
    description: 'Calculate your ideal bedtime.'
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang='en'>
            <body
                className={`${playfairDisplay.variable} ${inter.variable} antialiased bg-gradient-to-b from-blue-200 via-yellow-100 to-white text-gray-900`}
            >
                {children}
            </body>
        </html>
    )
}
