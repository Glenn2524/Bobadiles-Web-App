import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    if (!data.bristolScale || data.bristolScale < 1 || data.bristolScale > 7) {
      return NextResponse.json(
        { error: 'bristolScale must be between 1 and 7' },
        { status: 400 }
      )
    }

    const bowelMovement = await prisma.bowelMovement.create({
      data: {
        userId: data.userId,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        bristolScale: data.bristolScale,
        notes: data.notes || null,
        photoBase64: data.photoBase64 || null
      }
    })

    return NextResponse.json(bowelMovement)
  } catch (error) {
    console.error('Failed to create bowel movement:', error)
    return NextResponse.json(
      { error: 'Failed to create bowel movement' },
      { status: 500 }
    )
  }
}

// Made with Bob
