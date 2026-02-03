import { sql } from '@/lib/db'
import { Star, Quote } from 'lucide-react'
import Image from 'next/image'
import { TestimonialSlider } from './testimonial-slider'

interface Testimonial {
  id: number
  customer_name: string
  content: string
  image_url: string | null
  rating: number
}

async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const testimonials = await sql`
      SELECT * FROM testimonials WHERE is_approved = true ORDER BY created_at DESC LIMIT 10
    `
    return testimonials as Testimonial[]
  } catch (error) {
    console.error('Failed to fetch testimonials:', error)
    return []
  }
}

export async function Testimonials() {
  const testimonials = await getTestimonials()

  // Placeholder testimonials if none exist
  const displayTestimonials = testimonials.length > 0 ? testimonials : [
    { id: 1, customer_name: 'Priya M.', content: 'Amazing nail art! Diya is so talented and creative. My nails always look perfect after every visit.', image_url: null, rating: 5 },
    { id: 2, customer_name: 'Anita R.', content: 'Best nail salon experience in Quatre Bornes. The attention to detail is incredible!', image_url: null, rating: 5 },
    { id: 3, customer_name: 'Sophie L.', content: 'Love the cozy home-based setup. Feels so personal and relaxing. Highly recommend!', image_url: null, rating: 5 },
    { id: 4, customer_name: 'Maya K.', content: 'Diya always knows exactly what I want. The gel nails last so long and look stunning!', image_url: null, rating: 5 },
    { id: 5, customer_name: 'Nisha P.', content: 'Finally found my go-to nail artist! Professional, friendly, and incredibly skilled.', image_url: null, rating: 5 },
  ]

  return (
    <section id="testimonials" className="py-24 bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
            <Star className="w-4 h-4 fill-primary" />
            Testimonials
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-balance">
            What Our Clients Say
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what our lovely clients have to say about their experience.
          </p>
        </div>

        <TestimonialSlider testimonials={displayTestimonials} />
      </div>
    </section>
  )
}
