import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Hero } from '@/components/landing/hero'
import { Services } from '@/components/landing/services'
import { Gallery } from '@/components/landing/gallery'
import { Testimonials } from '@/components/landing/testimonials'
import { Contact } from '@/components/landing/contact'
import { getUser } from '@/lib/auth'

export default async function HomePage() {
  const user = await getUser()

  return (
    <main className="min-h-screen">
      <Header isLoggedIn={!!user} />
      <Hero />
      <Services />
      <Gallery />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  )
}
