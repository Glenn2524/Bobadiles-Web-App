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

    if (!data.symptomType) {
      return NextResponse.json(
        { error: 'symptomType is required' },
        { status: 400 }
      )
    }

    const acuteSymptom = await prisma.acuteSymptom.create({
      data: {
        userId: data.userId,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        symptomType: data.symptomType,
        severity: data.severity,
        notes: data.notes || null
      }
    })

    return NextResponse.json(acuteSymptom)
  } catch (error) {
    console.error('Failed to create acute symptom:', error)
    return NextResponse.json(
      { error: 'Failed to create acute symptom' },
      { status: 500 }
    )
  }
}

// Made with Bob
