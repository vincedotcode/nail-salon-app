'use server'

import { sql } from '@/lib/db'
import { verifyPassword, createSession, hashPassword } from '@/lib/auth'

export async function adminLoginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Please fill in all fields' }
  }

  try {
    const admins = await sql`
      SELECT * FROM admins WHERE email = ${email.toLowerCase()}
    `

    if (admins.length === 0) {
      return { error: 'Invalid credentials' }
    }

    const admin = admins[0]
    
    // Handle first login - if password_hash is placeholder, set the new password
    if (admin.password_hash === '$2b$10$placeholder') {
      const newHash = await hashPassword(password)
      await sql`UPDATE admins SET password_hash = ${newHash} WHERE id = ${admin.id}`
      await createSession(admin.id, true)
      return { success: true }
    }

    const isValid = await verifyPassword(password, admin.password_hash)
    if (!isValid) {
      return { error: 'Invalid credentials' }
    }

    await createSession(admin.id, true)
    return { success: true }
  } catch (error) {
    console.error('Admin login error:', error)
    return { error: 'Something went wrong' }
  }
}
