import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, dishName, ingredients, irritantTags, source, notes, photoBase64 } = await request.json()

    // Validation
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!dishName || typeof dishName !== 'string') {
      return NextResponse.json(
        { error: 'Dish name is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'At least one ingredient is required' },
        { status: 400 }
      )
    }

    if (!source || !['barcode', 'search', 'manual'].includes(source)) {
      return NextResponse.json(
        { error: 'Valid source is required (barcode, search, or manual)' },
        { status: 400 }
      )
    }

    // Create the meal
    const meal = await prisma.meal.create({
      data: {
        userId,
        timestamp: new Date(),
        source,
        dishName: dishName.trim(),
        ingredients: JSON.stringify(ingredients),
        irritantTags: JSON.stringify(irritantTags || []),
        notes: notes?.trim() || null,
        photoBase64: photoBase64 || null
      }
    })

    return NextResponse.json(meal, { status: 201 })
  } catch (error) {
    console.error('Error creating meal:', error)
    return NextResponse.json(
      { error: 'Failed to create meal' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const meals = await prisma.meal.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 50 // Limit to last 50 meals
    })

    // Parse JSON fields for easier consumption
    const parsedMeals = meals.map(meal => ({
      ...meal,
      ingredients: JSON.parse(meal.ingredients),
      irritantTags: JSON.parse(meal.irritantTags)
    }))

    return NextResponse.json(parsedMeals)
  } catch (error) {
    console.error('Error fetching meals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meals' },
      { status: 500 }
    )
  }
}

// Made with Bob