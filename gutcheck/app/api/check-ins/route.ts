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

    const checkIn = await prisma.checkIn.create({
      data: {
        userId: data.userId,
        timestamp: new Date(),
        type: data.type || 'evening',
        wellbeing: data.wellbeing,
        energy: data.energy,
        stress: data.stress,
        constipation: data.constipation || 0,
        bloating: data.bloating,
        pain: data.pain,
        sleepQuality: data.sleepQuality || null,
        unloggedSymptomsToday: data.unloggedSymptomsToday || false,
        unloggedSeverity: data.unloggedSeverity || null,
        unloggedNotes: data.unloggedNotes || null,
        notes: data.notes || null
      }
    })

    return NextResponse.json(checkIn)
  } catch (error) {
    console.error('Failed to create check-in:', error)
    return NextResponse.json(
      { error: 'Failed to create check-in' },
      { status: 500 }
    )
  }
}

// Made with Bob
