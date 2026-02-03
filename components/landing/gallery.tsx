import { sql } from '@/lib/db'
import { Camera, Sparkles } from 'lucide-react'
import { GalleryGrid } from './gallery-grid'

interface GalleryItem {
  id: number
  image_url: string
  title: string
  description: string
}

async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const items = await sql`
      SELECT * FROM gallery ORDER BY created_at DESC LIMIT 6
    `
    return items as GalleryItem[]
  } catch {
    return []
  }
}

export async function Gallery() {
  const items = await getGalleryItems()

  const placeholderItems = items.length > 0 ? items : [
    { id: 1, image_url: '/images/hero-nails.jpg', title: 'Elegant French Tips', description: 'Classic French manicure' },
    { id: 2, image_url: '/images/gallery-1.jpg', title: 'Floral Art', description: 'Hand-painted floral designs' },
    { id: 3, image_url: '/images/gallery-2.jpg', title: 'Glitter Glam', description: 'Sparkling glitter nails' },
    { id: 4, image_url: '/images/gallery-3.jpg', title: 'Minimalist Chic', description: 'Simple and elegant' },
    { id: 5, image_url: '/images/gallery-1.jpg', title: 'Bold Colors', description: 'Vibrant color combinations' },
    { id: 6, image_url: '/images/gallery-2.jpg', title: 'Gel Extensions', description: 'Beautiful gel extensions' },
  ]

  return (
    <section id="gallery" className="py-28 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Camera className="w-4 h-4" />
            Our Work
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-balance">
            Nail Art Gallery
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Browse through our collection of nail designs. Each piece is a unique creation 
            crafted with love and attention to detail.
          </p>
        </div>

        <GalleryGrid items={placeholderItems} />
      </div>
    </section>
  )
}
