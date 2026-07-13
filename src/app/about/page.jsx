import Footer from '@/components/footer'
import AboutClose from '@/sections/about/closer'
import AboutExperience from '@/sections/about/experience'
import AboutHero from '@/sections/about/hero'
import AboutParent from '@/sections/about/parent'
import AboutPaths from '@/sections/about/paths'
import AboutValues from '@/sections/about/values'

export const metadata = {
  title: 'About — Agency 1776',
  description:
    'Agency 1776 serves different missions, different audiences, and one standard: build websites that drive results.',
}

const AboutPage = () => {
  return (
    <main className="relative">
      <AboutHero />
      <AboutParent />
      <AboutPaths />
      <AboutExperience />
      <AboutValues />
      <AboutClose />
      <Footer />
    </main>
  )
}

export default AboutPage
