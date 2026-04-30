import { prisma } from './prisma'
import { getDateString } from './utils'

export interface SymptomEvent {
  date: string // YYYY-MM-DD
  source: 'evening_checkin' | 'acute_log' | 'unlogged_retrospective'
  severity: number // composite score 0-10
}

export interface CorrelationResult {
  ingredient: string
  total_exposures: number
  symptom_events_after: number
  baseline_symptom_rate: number
  conditional_rate: number
  lift: number
  confidence: 'strong' | 'moderate' | 'weak' | 'insufficient_data'
}

export interface AggregateStats {
  total_meals: number
  avg_meals_per_day: number
  most_frequent_irritants: { tag: string; count: number }[]
  days_fully_tracked: number
  days_with_bowel_movement: number
  acute_symptom_count: number
  acute_symptom_types: { type: string; count: number }[]
  bristol_distribution: { scale: number; count: number }[]
}

export interface CorrelationAnalysis {
  correlations: CorrelationResult[]
  aggregate_stats: AggregateStats
  days_logged: number
  symptom_event_days: number
  baseline_symptom_rate: number
}

export async function analyzeCorrelations(
  userId: string,
  daysBack: number = 14
): Promise<CorrelationAnalysis> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysBack)

  // Fetch all relevant data
  const [meals, checkIns, acuteSymptoms, bowelMovements] = await Promise.all([
    prisma.meal.findMany({
      where: {
        userId,
        timestamp: { gte: startDate }
      },
      orderBy: { timestamp: 'asc' }
    }),
    prisma.checkIn.findMany({
      where: {
        userId,
        timestamp: { gte: startDate }
      },
      orderBy: { timestamp: 'asc' }
    }),
    prisma.acuteSymptom.findMany({
      where: {
        userId,
        timestamp: { gte: startDate }
      },
      orderBy: { timestamp: 'asc' }
    }),
    prisma.bowelMovement.findMany({
      where: {
        userId,
        timestamp: { gte: startDate }
      },
      orderBy: { timestamp: 'asc' }
    })
  ])

  // Step 1: Build symptom events list
  const symptomEvents = buildSymptomEvents(checkIns, acuteSymptoms)
  const symptomEventDates = new Set(symptomEvents.map(e => e.date))

  // Step 2: Compute baseline
  const daysWithData = new Set<string>()
  checkIns.forEach(c => daysWithData.add(getDateString(new Date(c.timestamp))))
  acuteSymptoms.forEach(a => daysWithData.add(getDateString(new Date(a.timestamp))))
  
  const daysLogged = daysWithData.size
  const symptomEventDays = symptomEventDates.size
  const baselineSymptomRate = daysLogged > 0 ? symptomEventDays / daysLogged : 0

  // Step 3: Compute correlations for each ingredient/irritant
  const ingredientExposures = new Map<string, { dates: string[]; symptomFollows: number }>()

  meals.forEach(meal => {
    const mealDate = getDateString(new Date(meal.timestamp))
    const nextDate = getNextDate(mealDate)
    
    // Check if symptom occurred same day or next day
    const hadSymptom = symptomEventDates.has(mealDate) || symptomEventDates.has(nextDate)

    // Process ingredients
    const ingredients = JSON.parse(meal.ingredients) as string[]
    ingredients.forEach(ing => {
      if (!ingredientExposures.has(ing)) {
        ingredientExposures.set(ing, { dates: [], symptomFollows: 0 })
      }
      const exposure = ingredientExposures.get(ing)!
      exposure.dates.push(mealDate)
      if (hadSymptom) exposure.symptomFollows++
    })

    // Process irritant tags
    const irritants = JSON.parse(meal.irritantTags) as string[]
    irritants.forEach(tag => {
      if (!ingredientExposures.has(tag)) {
        ingredientExposures.set(tag, { dates: [], symptomFollows: 0 })
      }
      const exposure = ingredientExposures.get(tag)!
      exposure.dates.push(mealDate)
      if (hadSymptom) exposure.symptomFollows++
    })
  })

  // Step 4: Calculate lift and confidence for each ingredient
  const correlations: CorrelationResult[] = []
  
  ingredientExposures.forEach((exposure, ingredient) => {
    const totalExposures = exposure.dates.length
    const symptomEventsAfter = exposure.symptomFollows
    const conditionalRate = totalExposures > 0 ? symptomEventsAfter / totalExposures : 0
    const lift = baselineSymptomRate > 0 ? conditionalRate / baselineSymptomRate : 0

    // Assign confidence
    let confidence: CorrelationResult['confidence'] = 'insufficient_data'
    if (lift >= 1.8 && totalExposures >= 5) {
      confidence = 'strong'
    } else if (lift >= 1.4 && totalExposures >= 4) {
      confidence = 'moderate'
    } else if (lift >= 1.2 && totalExposures >= 3) {
      confidence = 'weak'
    }

    correlations.push({
      ingredient,
      total_exposures: totalExposures,
      symptom_events_after: symptomEventsAfter,
      baseline_symptom_rate: baselineSymptomRate,
      conditional_rate: conditionalRate,
      lift,
      confidence
    })
  })

  // Sort by lift descending
  correlations.sort((a, b) => b.lift - a.lift)

  // Filter out insufficient_data unless no other results
  const meaningfulCorrelations = correlations.filter(c => c.confidence !== 'insufficient_data')
  const finalCorrelations = meaningfulCorrelations.length > 0 
    ? meaningfulCorrelations.slice(0, 8)
    : correlations.slice(0, 8)

  // Step 5: Compute aggregate stats
  const aggregateStats = computeAggregateStats(meals, checkIns, acuteSymptoms, bowelMovements, daysLogged)

  return {
    correlations: finalCorrelations,
    aggregate_stats: aggregateStats,
    days_logged: daysLogged,
    symptom_event_days: symptomEventDays,
    baseline_symptom_rate: baselineSymptomRate
  }
}

function buildSymptomEvents(
  checkIns: any[],
  acuteSymptoms: any[]
): SymptomEvent[] {
  const events = new Map<string, SymptomEvent>()

  // Process evening check-ins
  checkIns.forEach(checkIn => {
    const date = getDateString(new Date(checkIn.timestamp))
    const isSymptomDay = 
      checkIn.bloating >= 6 || 
      checkIn.pain >= 6 || 
      checkIn.wellbeing <= 4

    if (isSymptomDay) {
      const severity = Math.max(checkIn.bloating, checkIn.pain, 10 - checkIn.wellbeing)
      if (!events.has(date) || events.get(date)!.severity < severity) {
        events.set(date, {
          date,
          source: 'evening_checkin',
          severity
        })
      }
    }

    // Check retrospective
    if (checkIn.unloggedSymptomsToday && checkIn.unloggedSeverity >= 6) {
      if (!events.has(date) || events.get(date)!.severity < checkIn.unloggedSeverity) {
        events.set(date, {
          date,
          source: 'unlogged_retrospective',
          severity: checkIn.unloggedSeverity
        })
      }
    }
  })

  // Process acute symptoms
  acuteSymptoms.forEach(symptom => {
    const date = getDateString(new Date(symptom.timestamp))
    if (symptom.severity >= 5) {
      if (!events.has(date) || events.get(date)!.severity < symptom.severity) {
        events.set(date, {
          date,
          source: 'acute_log',
          severity: symptom.severity
        })
      }
    }
  })

  return Array.from(events.values())
}

function getNextDate(dateString: string): string {
  const date = new Date(dateString)
  date.setDate(date.getDate() + 1)
  return getDateString(date)
}

function computeAggregateStats(
  meals: any[],
  checkIns: any[],
  acuteSymptoms: any[],
  bowelMovements: any[],
  daysLogged: number
): AggregateStats {
  // Count irritant tags
  const irritantCounts = new Map<string, number>()
  meals.forEach(meal => {
    const tags = JSON.parse(meal.irritantTags) as string[]
    tags.forEach(tag => {
      irritantCounts.set(tag, (irritantCounts.get(tag) || 0) + 1)
    })
  })

  const mostFrequentIrritants = Array.from(irritantCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Days fully tracked (both meal and check-in)
  const mealDates = new Set(meals.map(m => getDateString(new Date(m.timestamp))))
  const checkInDates = new Set(checkIns.map(c => getDateString(new Date(c.timestamp))))
  const fullyTrackedDays = Array.from(mealDates).filter(d => checkInDates.has(d)).length

  // Days with bowel movement
  const bowelMovementDates = new Set(bowelMovements.map(b => getDateString(new Date(b.timestamp))))

  // Acute symptom types
  const symptomTypeCounts = new Map<string, number>()
  acuteSymptoms.forEach(symptom => {
    symptomTypeCounts.set(symptom.symptomType, (symptomTypeCounts.get(symptom.symptomType) || 0) + 1)
  })

  const acuteSymptomTypes = Array.from(symptomTypeCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)

  // Bristol distribution
  const bristolCounts = new Map<number, number>()
  bowelMovements.forEach(bm => {
    bristolCounts.set(bm.bristolScale, (bristolCounts.get(bm.bristolScale) || 0) + 1)
  })

  const bristolDistribution = Array.from(bristolCounts.entries())
    .map(([scale, count]) => ({ scale, count }))
    .sort((a, b) => a.scale - b.scale)

  return {
    total_meals: meals.length,
    avg_meals_per_day: daysLogged > 0 ? meals.length / daysLogged : 0,
    most_frequent_irritants: mostFrequentIrritants,
    days_fully_tracked: fullyTrackedDays,
    days_with_bowel_movement: bowelMovementDates.size,
    acute_symptom_count: acuteSymptoms.length,
    acute_symptom_types: acuteSymptomTypes,
    bristol_distribution: bristolDistribution
  }
}

// Made with Bob
