'use server'

import { sql } from '@/lib/db'
import { generateToken } from '@/lib/auth'

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Please enter your email' }
  }

  try {
    const users = await sql`
      SELECT id, full_name FROM users WHERE email = ${email.toLowerCase()}
    `

    if (users.length === 0) {
      // Don't reveal if email exists
      return { success: true }
    }

    const user = users[0]
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Delete any existing tokens for this user
    await sql`DELETE FROM password_reset_tokens WHERE user_id = ${user.id}`

    // Create new token
    await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
    `

    // In production, you would send an email here
    // For now, we'll just log the reset link
    console.log(`[v0] Password reset link: /auth/reset-password?token=${token}`)

    return { success: true }
  } catch (error) {
    console.error('Password reset error:', error)
    return { error: 'Something went wrong' }
  }
}
