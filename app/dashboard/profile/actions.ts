'use server'

import { sql } from '@/lib/db'
import { getUser, hashPassword, verifyPassword } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const user = await getUser()
  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const avatarUrl = formData.get('avatarUrl') as string

  if (!name || !email) {
    return { error: 'Name and email are required' }
  }

  try {
    // Check if email is already taken by another user
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()} AND id != ${user.id}
    `
    if (existing.length > 0) {
      return { error: 'Email is already in use' }
    }

    await sql`
      UPDATE users 
      SET full_name = ${name}, 
          email = ${email.toLowerCase()}, 
          phone = ${phone || null},
          avatar_url = ${avatarUrl || null},
          updated_at = NOW()
      WHERE id = ${user.id}
    `

    revalidatePath('/dashboard/profile', 'page')
    return { success: true }
  } catch (error) {
    console.error('Update profile error:', error)
    return { error: 'Failed to update profile' }
  }
}

export async function changePassword(formData: FormData) {
  const user = await getUser()
  if (!user) return { error: 'Unauthorized' }

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All fields are required' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match' }
  }

  if (newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  try {
    // Get current password hash
    const users = await sql`SELECT password_hash FROM users WHERE id = ${user.id}`
    if (users.length === 0) {
      return { error: 'User not found' }
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, users[0].password_hash)
    if (!isValid) {
      return { error: 'Current password is incorrect' }
    }

    // Update password
    const newHash = await hashPassword(newPassword)
    await sql`
      UPDATE users SET password_hash = ${newHash}, updated_at = NOW()
      WHERE id = ${user.id}
    `

    return { success: true }
  } catch (error) {
    console.error('Change password error:', error)
    return { error: 'Failed to change password' }
  }
}
