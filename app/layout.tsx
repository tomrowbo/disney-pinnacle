import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Disney Pinnacle',
  description: 'Collect and trade Disney digital pins',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-disney">{children}</body>
    </html>
  )
}