import { Inter } from 'next/font/google'

import CustomCursor from '@/components/custom-cursor'
import Navbar from '@/components/navbar'
import SmoothScrollProvider from '@/components/smooth-scroll-provider'
import TopBrandBar from '@/components/top-brand-bar'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: 'Agency 1776',
  description: 'Premium campaign sites for politicians and candidates.',
}

const RootLayout = ({ children }) => {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {/* Fixed chrome — MUST live outside the smooth-scroll wrapper. */}
        <CustomCursor />
        <TopBrandBar />
        <Navbar />

        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  )
}

export default RootLayout
