import Footer from '@/components/footer'
import Audiences from '@/sections/solutions/audiences'
import Capabilities from '@/sections/solutions/capabilities'
import Closer from '@/sections/solutions/closer'
import Hero from '@/sections/solutions/hero'
import Outcomes from '@/sections/solutions/outcomes'
import Packages from '@/sections/solutions/packages'

export const metadata = {
  title: 'Campaign Solutions — Agency 1776',
  description:
    'From website strategy and campaign messaging to social assets, landing pages, and supporter action paths, we build the tools that help your campaign move.',
}

const SolutionsPage = () => {
  return (
    <main className="relative">
      <Hero />
      <Audiences />
      <Capabilities />
      <Packages />
      <Outcomes />
      <Closer />
      <Footer />
    </main>
  )
}

export default SolutionsPage
