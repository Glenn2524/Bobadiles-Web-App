import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create demo user "Alex"
  const user = await prisma.user.create({
    data: {
      name: 'Alex',
      preferredCheckInTime: 'evening',
      nextAppointment: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      shareWithDoctor: false,
      allowResearchUse: false,
    },
  })

  console.log('✅ Created user:', user.name)

  const now = new Date()
  const meals = []
  const checkIns = []
  const acuteSymptoms = []
  const bowelMovements = []

  // Generate 30 days of data
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = new Date(now)
    date.setDate(date.getDate() - dayOffset)
    date.setHours(0, 0, 0, 0)

    // Determine if this is a "dairy day" or "wheat day" for correlation
    const isDairyDay = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29].includes(dayOffset)
    const isWheatDay = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28].includes(dayOffset)
    const shouldHaveSymptoms = (isDairyDay && dayOffset !== 1) || (isWheatDay && dayOffset !== 0)

    // Breakfast (8am)
    const breakfastTime = new Date(date)
    breakfastTime.setHours(8, 0, 0, 0)

    if (dayOffset % 2 === 0) {
      meals.push({
        userId: user.id,
        timestamp: breakfastTime,
        source: isDairyDay ? 'barcode' : 'manual',
        dishName: isDairyDay ? 'Müller Greek Yogurt with Honey' : 'Oatmeal with Banana',
        ingredients: JSON.stringify(
          isDairyDay 
            ? ['yogurt', 'milk', 'honey', 'granola']
            : ['oats', 'banana', 'almond milk', 'cinnamon']
        ),
        irritantTags: JSON.stringify(isDairyDay ? ['lactose', 'high-fat'] : []),
        notes: null,
        photoBase64: null,
      })
    }

    // Lunch (12:30pm)
    const lunchTime = new Date(date)
    lunchTime.setHours(12, 30, 0, 0)

    const lunchOptions = [
      {
        name: 'Barilla Penne Pasta with Tomato Sauce',
        ingredients: ['pasta', 'wheat', 'tomato', 'olive oil', 'garlic', 'basil'],
        tags: ['gluten', 'high-FODMAP'],
        source: 'barcode',
        isWheat: true,
      },
      {
        name: 'Grilled Chicken Salad',
        ingredients: ['chicken', 'lettuce', 'cucumber', 'tomato', 'olive oil', 'lemon'],
        tags: [],
        source: 'manual',
        isWheat: false,
      },
      {
        name: 'Cheese Pizza',
        ingredients: ['wheat', 'flour', 'cheese', 'mozzarella', 'tomato sauce'],
        tags: ['gluten', 'lactose'],
        source: 'search',
        isWheat: true,
      },
      {
        name: 'Salmon with Rice',
        ingredients: ['salmon', 'rice', 'broccoli', 'soy sauce'],
        tags: ['soy'],
        source: 'manual',
        isWheat: false,
      },
    ]

    const lunch = isWheatDay 
      ? lunchOptions.filter(l => l.isWheat)[dayOffset % 2]
      : lunchOptions.filter(l => !l.isWheat)[dayOffset % 2]

    meals.push({
      userId: user.id,
      timestamp: lunchTime,
      source: lunch.source,
      dishName: lunch.name,
      ingredients: JSON.stringify(lunch.ingredients),
      irritantTags: JSON.stringify(lunch.tags),
      notes: null,
      photoBase64: null,
    })

    // Dinner (7pm)
    const dinnerTime = new Date(date)
    dinnerTime.setHours(19, 0, 0, 0)

    const dinnerOptions = [
      {
        name: 'Spaghetti Carbonara',
        ingredients: ['pasta', 'wheat', 'egg', 'bacon', 'parmesan', 'cream'],
        tags: ['gluten', 'lactose', 'high-fat'],
        source: 'manual',
        isWheat: true,
      },
      {
        name: 'Stir-fry Vegetables with Tofu',
        ingredients: ['tofu', 'broccoli', 'carrot', 'bell pepper', 'soy sauce', 'rice'],
        tags: ['soy'],
        source: 'manual',
        isWheat: false,
      },
      {
        name: 'Beef Burger with Fries',
        ingredients: ['beef', 'bread', 'wheat', 'cheese', 'potato', 'ketchup'],
        tags: ['gluten', 'lactose', 'high-fat'],
        source: 'search',
        isWheat: true,
      },
      {
        name: 'Grilled Fish with Vegetables',
        ingredients: ['fish', 'salmon', 'zucchini', 'carrot', 'olive oil'],
        tags: [],
        source: 'manual',
        isWheat: false,
      },
    ]

    const dinner = isWheatDay || isDairyDay
      ? dinnerOptions.filter(d => d.isWheat)[dayOffset % 2]
      : dinnerOptions.filter(d => !d.isWheat)[dayOffset % 2]

    meals.push({
      userId: user.id,
      timestamp: dinnerTime,
      source: dinner.source,
      dishName: dinner.name,
      ingredients: JSON.stringify(dinner.ingredients),
      irritantTags: JSON.stringify(dinner.tags),
      notes: null,
      photoBase64: null,
    })

    // Evening check-in (8:30pm)
    const checkInTime = new Date(date)
    checkInTime.setHours(20, 30, 0, 0)

    const hasSymptoms = shouldHaveSymptoms
    
    checkIns.push({
      userId: user.id,
      timestamp: checkInTime,
      type: 'evening',
      wellbeing: hasSymptoms ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 3) + 7, // 3-5 or 7-9
      energy: hasSymptoms ? Math.floor(Math.random() * 3) + 4 : Math.floor(Math.random() * 3) + 6,
      stress: Math.floor(Math.random() * 4) + 3,
      bloating: hasSymptoms ? Math.floor(Math.random() * 3) + 6 : Math.floor(Math.random() * 3) + 1, // 6-8 or 1-3
      pain: hasSymptoms ? Math.floor(Math.random() * 3) + 5 : Math.floor(Math.random() * 2) + 0, // 5-7 or 0-1
      sleepQuality: null,
      unloggedSymptomsToday: dayOffset === 5 || dayOffset === 10,
      unloggedSeverity: (dayOffset === 5 || dayOffset === 10) ? 7 : null,
      unloggedNotes: (dayOffset === 5 || dayOffset === 10) ? 'Had some discomfort earlier' : null,
      notes: hasSymptoms ? 'Not feeling great today' : null,
    })

    // Morning check-in for some days (7am)
    if ([3, 7, 11, 15, 19, 23, 27].includes(dayOffset)) {
      const morningCheckInTime = new Date(date)
      morningCheckInTime.setHours(7, 0, 0, 0)

      checkIns.push({
        userId: user.id,
        timestamp: morningCheckInTime,
        type: 'morning',
        wellbeing: Math.floor(Math.random() * 3) + 6,
        energy: Math.floor(Math.random() * 3) + 5,
        stress: Math.floor(Math.random() * 3) + 2,
        bloating: Math.floor(Math.random() * 3) + 1,
        pain: Math.floor(Math.random() * 2) + 0,
        sleepQuality: Math.floor(Math.random() * 2) + 3,
        unloggedSymptomsToday: false,
        unloggedSeverity: null,
        unloggedNotes: null,
        notes: null,
      })
    }

    // Acute symptoms on dairy/wheat heavy days
    if ([4, 8, 12, 16, 20, 24, 28].includes(dayOffset)) {
      const acuteTime = new Date(date)
      acuteTime.setHours(14 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60), 0, 0)

      acuteSymptoms.push({
        userId: user.id,
        timestamp: acuteTime,
        symptomType: dayOffset === 4 ? 'severe_pain' : 'diarrhea',
        severity: Math.floor(Math.random() * 3) + 7, // 7-9
        notes: 'Sudden onset after lunch',
      })
    }

    // Bowel movements (most days)
    if (dayOffset !== 2 && dayOffset !== 6 && dayOffset !== 14 && dayOffset !== 22) {
      const bmTime = new Date(date)
      bmTime.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0)

      const bristolScales = hasSymptoms 
        ? [1, 2, 2, 5, 6, 6] // More constipation or diarrhea on symptom days
        : [3, 3, 4, 4, 4, 5] // Normal range on good days

      bowelMovements.push({
        userId: user.id,
        timestamp: bmTime,
        bristolScale: bristolScales[Math.floor(Math.random() * bristolScales.length)],
        notes: null,
        photoBase64: null,
      })
    }
  }

  // Insert all data
  await prisma.meal.createMany({ data: meals })
  console.log(`✅ Created ${meals.length} meals`)

  await prisma.checkIn.createMany({ data: checkIns })
  console.log(`✅ Created ${checkIns.length} check-ins`)

  await prisma.acuteSymptom.createMany({ data: acuteSymptoms })
  console.log(`✅ Created ${acuteSymptoms.length} acute symptoms`)

  await prisma.bowelMovement.createMany({ data: bowelMovements })
  console.log(`✅ Created ${bowelMovements.length} bowel movements`)

  console.log('🎉 Seed completed successfully!')
  console.log(`\n📊 Summary:`)
  console.log(`   User: ${user.name}`)
  console.log(`   User ID: ${user.id}`)
  console.log(`   Next appointment: ${user.nextAppointment?.toLocaleDateString()}`)
  console.log(`\n💡 To use this demo:`)
  console.log(`   1. Run: npm run dev`)
  console.log(`   2. Open: http://localhost:3000`)
  console.log(`   3. The app will detect the existing user automatically`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

// Made with Bob
