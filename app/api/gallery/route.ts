"use server"

import { sql } from "@/lib/db"

export async function GET() {
  try {
    const gallery = await sql`
      SELECT id, image_url, title, description, category
      FROM gallery
      ORDER BY created_at DESC
      LIMIT 20
    `
    return Response.json(gallery)
  } catch (error) {
    console.error("Failed to fetch gallery:", error)
    return Response.json({ error: "Failed to fetch gallery" }, { status: 500 })
  }
}
