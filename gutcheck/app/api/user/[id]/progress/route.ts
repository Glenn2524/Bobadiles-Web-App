import { NextRequest, NextResponse } from 'next/server'
import { getTrackingProgress } from '@/lib/observations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const progress = await getTrackingProgress(params.id)
    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

// Made with Bob
