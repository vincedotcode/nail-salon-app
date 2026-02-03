'use server'

import { sql } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function verifyResetToken(token: string) {
  try {
    const tokens = await sql`
      SELECT * FROM password_reset_tokens 
      WHERE token = ${token} 
        AND expires_at > NOW() 
        AND used = false
    `
    return { valid: tokens.length > 0 }
  } catch (error) {
    console.error('Token verification error:', error)
    return { valid: false }
  }
}

export async function resetPassword(token: string, formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  try {
    // Verify token
    const tokens = await sql`
      SELECT * FROM password_reset_tokens 
      WHERE token = ${token} 
        AND expires_at > NOW() 
        AND used = false
    `

    if (tokens.length === 0) {
      return { error: 'Invalid or expired token' }
    }

    const resetToken = tokens[0]

    // Update password
    const passwordHash = await hashPassword(password)
    await sql`
      UPDATE users SET password_hash = ${passwordHash}, updated_at = NOW()
      WHERE id = ${resetToken.user_id}
    `

    // Mark token as used
    await sql`
      UPDATE password_reset_tokens SET used = true WHERE id = ${resetToken.id}
    `

    return { success: true }
  } catch (error) {
    console.error('Password reset error:', error)
    return { error: 'Something went wrong' }
  }
}
