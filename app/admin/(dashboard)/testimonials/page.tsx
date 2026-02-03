import { sql } from '@/lib/db'
import { TestimonialsManager } from './testimonials-manager'

async function getTestimonials() {
  return await sql`SELECT * FROM testimonials ORDER BY created_at DESC`
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials()

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Testimonials</h1>
        <p className="text-muted-foreground">Manage customer reviews and feedback</p>
      </div>

      <TestimonialsManager testimonials={testimonials} />
    </div>
  )
}
