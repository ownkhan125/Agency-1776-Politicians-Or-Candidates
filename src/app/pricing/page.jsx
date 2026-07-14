import Footer from '@/components/footer'
import PricingCalculator from '@/sections/pricing/calculator'
import PricingCommit from '@/sections/pricing/commit'
import PricingHero from '@/sections/pricing/hero'

export const metadata = {
  title: 'Pricing — Agency 1776',
  description:
    'Find the right digital build for your campaign. Use the calculator to identify the website, campaign assets, and launch path that best fit your race.',
}

const PricingPage = () => {
  return (
    <main className="relative">
      <PricingHero />
      <PricingCalculator />
      <PricingCommit />
      <Footer />
    </main>
  )
}

export default PricingPage
