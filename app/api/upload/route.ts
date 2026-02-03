"use server"

import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 })
    }

    const filename = `${nanoid()}-${file.name}`
    const blob = await put(filename, file, {
      access: "public",
    })

    return Response.json({ url: blob.url })
  } catch (error) {
    console.error("Upload error:", error)
    return Response.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
