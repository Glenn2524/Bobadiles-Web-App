import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()

    // Check if user with this name already exists (case-insensitive)
    let user = await prisma.user.findFirst({
      where: {
        name: trimmedName
      }
    })

    // If user doesn't exist, create a new one
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: trimmedName,
        },
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

// Made with Bob
