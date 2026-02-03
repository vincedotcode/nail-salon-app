"use server"

import { sql } from "@/lib/db"

export async function GET() {
  try {
    const services = await sql`
      SELECT id, name, description, duration_minutes, price, category, is_active
      FROM services
      WHERE is_active = true
      ORDER BY category, name
    `
    return Response.json(services)
  } catch (error) {
    console.error("Failed to fetch services:", error)
    return Response.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}
