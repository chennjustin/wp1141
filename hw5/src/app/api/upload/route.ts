import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, unauthorizedResponse } from '@/lib/api-helpers'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const { timestamp } = await req.json()

    if (!timestamp || typeof timestamp !== 'number') {
      return NextResponse.json({ error: 'timestamp is required' }, { status: 400 })
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary configuration missing' }, { status: 500 })
    }

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      { timestamp },
      apiSecret
    )

    return NextResponse.json({
      timestamp,
      signature,
      cloudName,
      apiKey,
    })
  } catch (error) {
    console.error('Error generating upload signature:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

