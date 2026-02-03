import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { PwaInstallCard } from '@/components/pwa-install-card'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20 bg-gradient-to-b from-secondary/40 to-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                DS Nails App
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-balance">
                Install the DS Nails app in seconds
              </h1>
              <p className="mt-4 text-muted-foreground text-lg">
                Book appointments, manage invoices, and keep your nail routine on track right from your home screen.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg">
                  <Link href="/auth/signup">
                    Book an Appointment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent">
                  <Link href="/#services">Explore Services</Link>
                </Button>
              </div>
            </div>
            <PwaInstallCard />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border/60 p-6 bg-card/80">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">Instant access</h3>
              <p className="text-sm text-muted-foreground">
                Launch the app from your home screen without opening a browser.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 p-6 bg-card/80">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">Secure & private</h3>
              <p className="text-sm text-muted-foreground">
                Your bookings and invoices stay protected with secure sessions.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 p-6 bg-card/80">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">Designed for mobile</h3>
              <p className="text-sm text-muted-foreground">
                The app adapts perfectly to every screen size, on any device.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
