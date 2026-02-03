import { sql } from '@/lib/db'
import { Clock, Sparkles } from 'lucide-react'
import { ServiceCard } from './service-card'

interface Service {
  id: number
  name: string
  description: string
  price: number
  duration_minutes: number
}

async function getServices(): Promise<Service[]> {
  try {
    const services = await sql`
      SELECT * FROM services WHERE is_active = true ORDER BY price ASC
    `
    return services as Service[]
  } catch {
    return []
  }
}

export async function Services() {
  const services = await getServices()

  return (
    <section id="services" className="py-28 bg-gradient-to-b from-background via-secondary/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Our Services
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-balance">
            Premium Nail Care
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From classic manicures to intricate nail art, we offer a range of services 
            tailored to your unique style.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
