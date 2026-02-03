import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"

export async function GET() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("admin_session_token")?.value

  if (sessionToken) {
    await sql`DELETE FROM admin_sessions WHERE token = ${sessionToken}`
    cookieStore.delete("admin_session_token")
  }

  redirect("/admin/login")
}
