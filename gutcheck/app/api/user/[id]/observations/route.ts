import { NextRequest, NextResponse } from 'next/server'
import { generateObservations } from '@/lib/observations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const observations = await generateObservations(params.id)
    return NextResponse.json(observations)
  } catch (error) {
    console.error('Error fetching observations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch observations' },
      { status: 500 }
    )
  }
}

// Made with Bob
