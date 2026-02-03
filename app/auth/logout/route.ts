import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"

export async function GET() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value

  if (sessionToken) {
    await sql`DELETE FROM sessions WHERE token = ${sessionToken}`
    cookieStore.delete("session_token")
  }

  redirect("/")
}
