'use server'

import { sql } from '@/lib/db'
import { hashPassword, createSession } from '@/lib/auth'

export async function signupAction(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!name || !email || !password) {
    return { error: 'Please fill in all required fields' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  try {
    // Check if user exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `

    if (existing.length > 0) {
      return { error: 'An account with this email already exists' }
    }

    // Create user
    const passwordHash = await hashPassword(password)
    const users = await sql`
      INSERT INTO users (email, password_hash, full_name, phone)
      VALUES (${email.toLowerCase()}, ${passwordHash}, ${name}, ${phone || null})
      RETURNING id
    `

    await createSession(users[0].id, false)
    return { success: true }
  } catch (error) {
    console.error('Signup error:', error)
    return { error: 'Something went wrong' }
  }
}
