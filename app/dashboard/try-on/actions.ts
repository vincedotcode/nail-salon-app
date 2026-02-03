'use server'

import { sql } from '@/lib/db'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { generateText } from 'ai'
import { put } from '@vercel/blob'

const TEMPLATE_PROMPTS: Record<string, string> = {
  french: 'classic French manicure with white tips and natural nude base',
  ombre: 'soft ombre gradient from blush pink to white',
  glitter: 'glamorous gold glitter accent nails with subtle shimmer',
  floral: 'delicate hand-painted roses and leaves on nude base',
  geometric: 'modern geometric patterns with clean lines in terracotta and gold',
  marble: 'elegant white and grey marble swirl effect',
  chrome: 'mirror chrome metallic finish in rose gold',
  minimal: 'minimalist nude with single gold line accent',
}

export async function generateNailDesign({
  handImageUrl,
  template,
  customPrompt,
}: {
  handImageUrl: string
  template: string
  customPrompt: string
}) {
  const user = await getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    const designDescription = template 
      ? TEMPLATE_PROMPTS[template] || template
      : customPrompt

    // Use AI to analyze and describe how to apply the design
    const result = await generateText({
      model: 'google/gemini-2.0-flash',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: handImageUrl,
            },
            {
              type: 'text',
              text: `You are a professional nail artist. Look at this image of a hand and imagine applying this nail design: "${designDescription}". 
              
              Describe in vivid detail how the nails would look with this design applied, including:
              1. The exact colors and their placement
              2. Any patterns, gradients, or effects
              3. How the design complements the hand shape
              4. The overall aesthetic and vibe
              
              Make it sound beautiful and aspirational. Keep your response under 150 words.`,
            },
          ],
        },
      ],
    })

    // For now, return a placeholder image URL
    // In production, you would use an image generation model
    const placeholderImages = [
      '/images/hero-nails.jpg',
      '/images/gallery-1.jpg',
      '/images/gallery-2.jpg',
      '/images/gallery-3.jpg',
    ]
    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)]

    return { 
      imageUrl: randomImage,
      description: result.text,
    }
  } catch (error) {
    console.error('Generate nail design error:', error)
    return { error: 'Failed to generate design. Please try again.' }
  }
}

export async function saveDesign({
  userId,
  originalImage,
  generatedImage,
  templateName,
  notes,
}: {
  userId: number
  originalImage: string
  generatedImage: string
  templateName: string
  notes: string
}) {
  const user = await getUser()
  if (!user || user.id !== userId) return { error: 'Unauthorized' }

  try {
    await sql`
      INSERT INTO nail_designs (user_id, image_url, generated_image_url, template_name, notes)
      VALUES (${userId}, ${originalImage}, ${generatedImage}, ${templateName}, ${notes || null})
    `

    revalidatePath('/dashboard/try-on', 'page')
    return { success: true }
  } catch (error) {
    console.error('Save design error:', error)
    return { error: 'Failed to save design' }
  }
}

export async function deleteDesign(designId: number) {
  const user = await getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    await sql`
      DELETE FROM nail_designs 
      WHERE id = ${designId} AND user_id = ${user.id}
    `

    revalidatePath('/dashboard/try-on', 'page')
    return { success: true }
  } catch (error) {
    console.error('Delete design error:', error)
    return { error: 'Failed to delete design' }
  }
}
