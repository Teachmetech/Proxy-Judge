import './globals.css'

export const metadata = {
    title: 'Proxy Judge - Analyze Your Proxy',
    description: 'Analyze proxy anonymity, location, and performance',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
} 