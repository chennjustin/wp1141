import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, unauthorizedResponse, badRequestResponse } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorizedResponse()

    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'avatar' or 'cover'
    const userId = formData.get('userId') as string

    if (!file) return badRequestResponse('File is required')
    if (!['avatar', 'cover'].includes(type)) return badRequestResponse('Invalid type')
    if (!userId || userId !== user.id) return badRequestResponse('Invalid userId')

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'my_Xclone'
    if (!cloudName) return NextResponse.json({ error: 'Missing Cloudinary config' }, { status: 500 })

    // Convert File to base64
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const dataUri = `data:${file.type || 'image/jpeg'};base64,${base64}`

    // ⬇️ 不再傳 public_id，完全讓 Cloudinary 自動命名
    const bodyData = new FormData()
    bodyData.append('file', dataUri)
    bodyData.append('upload_preset', uploadPreset)
    bodyData.append('context', `type=${type},userId=${userId}`) // 可選：方便之後在 Cloudinary 後台查

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: bodyData,
    })

    const text = await res.text()
    if (!res.ok) {
      console.error('Cloudinary error:', text)
      return NextResponse.json({ error: text }, { status: 500 })
    }

    const json = JSON.parse(text)
    return NextResponse.json({
      secure_url: json.secure_url,
      public_id: json.public_id, // 會是 Cloudinary 自動生成的 ID
    })
  } catch (err) {
    console.error('Upload failed:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

