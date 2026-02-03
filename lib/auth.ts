import { sql } from './db'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(): string {
  return crypto.randomUUID() + '-' + crypto.randomUUID()
}

export async function createSession(userId: number, isAdmin: boolean = false): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  if (isAdmin) {
    await sql`
      INSERT INTO admin_sessions (admin_id, token, expires_at)
      VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
    `
  } else {
    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
    `
  }

  const cookieStore = await cookies()
  cookieStore.set(isAdmin ? 'admin_session' : 'session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })

  return token
}

export async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  const result = await sql`
    SELECT u.* FROM users u
    JOIN sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `

  return result[0] || null
}

export async function getAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value

  if (!token) return null

  const result = await sql`
    SELECT a.* FROM admins a
    JOIN admin_sessions s ON s.admin_id = a.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `

  return result[0] || null
}

export async function logout(isAdmin: boolean = false) {
  const cookieStore = await cookies()
  const tokenName = isAdmin ? 'admin_session' : 'session'
  const token = cookieStore.get(tokenName)?.value

  if (token) {
    if (isAdmin) {
      await sql`DELETE FROM admin_sessions WHERE token = ${token}`
    } else {
      await sql`DELETE FROM sessions WHERE token = ${token}`
    }
    cookieStore.delete(tokenName)
  }
}
