import Footer from '@/components/footer'
import Contact from '@/sections/contact'
import Forward from '@/sections/forward'
import Hero from '@/sections/hero'
import Process from '@/sections/process'
import Reality from '@/sections/reality'
import Scope from '@/sections/scope'

const HomePage = () => {
  return (
    <main className="relative">
      <Hero />
      <Forward />
      <Reality />
      <Scope />
      <Process />
      <Contact />
      <Footer />
    </main>
  )
}

export default HomePage
