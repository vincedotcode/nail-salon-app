'use server'

import { sql } from '@/lib/db'
import { verifyPassword, createSession } from '@/lib/auth'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Please fill in all fields' }
  }

  try {
    const users = await sql`
      SELECT * FROM users WHERE email = ${email.toLowerCase()}
    `

    if (users.length === 0) {
      return { error: 'Invalid email or password' }
    }

    const user = users[0]
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      return { error: 'Invalid email or password' }
    }

    await createSession(user.id, false)
    return { success: true }
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'Something went wrong' }
  }
}
