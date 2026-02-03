"use server"

import { sql } from "@/lib/db"

export async function GET() {
  try {
    const testimonials = await sql`
      SELECT id, client_name, content, rating, image_url
      FROM testimonials
      WHERE is_visible = true
      ORDER BY created_at DESC
    `
    return Response.json(testimonials)
  } catch (error) {
    console.error("Failed to fetch testimonials:", error)
    return Response.json({ error: "Failed to fetch testimonials" }, { status: 500 })
  }
}
