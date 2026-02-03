import { sql } from '@/lib/db'
import { GalleryManager } from './gallery-manager'

async function getGallery() {
  return await sql`SELECT * FROM gallery ORDER BY created_at DESC`
}

export default async function GalleryPage() {
  const gallery = await getGallery()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Gallery</h1>
        <p className="text-muted-foreground">Showcase your beautiful nail designs</p>
      </div>

      <GalleryManager gallery={gallery} />
    </div>
  )
}
