/**
 * Evidence-based timing windows for food intolerance and symptom correlation
 * Based on clinical research and gastroenterology literature
 */

export interface TimeWindow {
  name: string
  hoursStart: number // hours after meal
  hoursEnd: number
  description: string
  typicalTriggers: string[] // irritant tags that commonly cause symptoms in this window
  confidenceThreshold: number // minimum correlation strength to report
}

export const TIME_WINDOWS: TimeWindow[] = [
  {
    name: 'immediate',
    hoursStart: 0,
    hoursEnd: 2,
    description: 'Fast reactions (0-2 hours)',
    typicalTriggers: ['high-FODMAP', 'high-fat', 'spicy', 'caffeine', 'alcohol'],
    confidenceThreshold: 0.6
  },
  {
    name: 'medium',
    hoursStart: 2,
    hoursEnd: 8,
    description: 'Medium reactions (2-8 hours)',
    typicalTriggers: ['lactose', 'artificial sweetener', 'high-FODMAP', 'high-fat'],
    confidenceThreshold: 0.5
  },
  {
    name: 'delayed',
    hoursStart: 8,
    hoursEnd: 24,
    description: 'Slow reactions (8-24 hours)',
    typicalTriggers: ['gluten', 'soy', 'high-FODMAP'],
    confidenceThreshold: 0.4
  },
  {
    name: 'cumulative',
    hoursStart: 24,
    hoursEnd: 72,
    description: 'Cumulative/delayed (24-72 hours)',
    typicalTriggers: ['gluten', 'high-FODMAP', 'lactose'],
    confidenceThreshold: 0.3
  }
]

export interface TriggerKnowledge {
  tag: string
  typicalOnsetHours: number
  typicalDurationHours: number
  mechanism: string
  evidenceLevel: 'strong' | 'moderate' | 'limited'
  notes: string
}

/**
 * Evidence-based knowledge about common food triggers
 * Sources: Monash University FODMAP research, NIH, Celiac Disease Foundation
 */
export const TRIGGER_KNOWLEDGE: TriggerKnowledge[] = [
  {
    tag: 'lactose',
    typicalOnsetHours: 2,
    typicalDurationHours: 6,
    mechanism: 'Lactose malabsorption - undigested lactose fermented by gut bacteria',
    evidenceLevel: 'strong',
    notes: 'Symptoms typically peak 2-4 hours after consumption. Severity depends on lactase deficiency level.'
  },
  {
    tag: 'gluten',
    typicalOnsetHours: 12,
    typicalDurationHours: 48,
    mechanism: 'Non-celiac gluten sensitivity - immune response and gut permeability',
    evidenceLevel: 'moderate',
    notes: 'Highly variable timing (2-48 hours). Some patients report delayed reactions up to 72 hours.'
  },
  {
    tag: 'high-FODMAP',
    typicalOnsetHours: 2,
    typicalDurationHours: 8,
    mechanism: 'Fermentation of poorly absorbed carbohydrates, osmotic effect',
    evidenceLevel: 'strong',
    notes: 'Fast-acting (0-4 hours). Includes onions, garlic, beans, certain fruits. Monash University research.'
  },
  {
    tag: 'high-fat',
    typicalOnsetHours: 1,
    typicalDurationHours: 4,
    mechanism: 'Delayed gastric emptying, increased colonic motility',
    evidenceLevel: 'strong',
    notes: 'Can trigger dumping syndrome or IBS-D. Worse on empty stomach.'
  },
  {
    tag: 'spicy',
    typicalOnsetHours: 0.5,
    typicalDurationHours: 3,
    mechanism: 'Capsaicin stimulates gut motility and secretion',
    evidenceLevel: 'moderate',
    notes: 'Very fast onset. Can cause immediate cramping and diarrhea in sensitive individuals.'
  },
  {
    tag: 'caffeine',
    typicalOnsetHours: 0.5,
    typicalDurationHours: 2,
    mechanism: 'Stimulates colonic motor activity',
    evidenceLevel: 'strong',
    notes: 'Fast-acting laxative effect. Worse on empty stomach.'
  },
  {
    tag: 'alcohol',
    typicalOnsetHours: 1,
    typicalDurationHours: 12,
    mechanism: 'Gut irritation, increased permeability, altered microbiome',
    evidenceLevel: 'strong',
    notes: 'Can cause immediate and delayed effects. Interacts with other triggers.'
  },
  {
    tag: 'artificial sweetener',
    typicalOnsetHours: 2,
    typicalDurationHours: 6,
    mechanism: 'Osmotic effect (sorbitol, xylitol), gut microbiome disruption',
    evidenceLevel: 'moderate',
    notes: 'Sugar alcohols poorly absorbed. Can cause gas, bloating, diarrhea.'
  },
  {
    tag: 'soy',
    typicalOnsetHours: 4,
    typicalDurationHours: 12,
    mechanism: 'Protein sensitivity, FODMAP content in some forms',
    evidenceLevel: 'limited',
    notes: 'Variable response. Some forms (tofu) better tolerated than others (soy milk).'
  },
  {
    tag: 'egg',
    typicalOnsetHours: 2,
    typicalDurationHours: 8,
    mechanism: 'Protein allergy or intolerance',
    evidenceLevel: 'moderate',
    notes: 'Can range from immediate allergic reaction to delayed intolerance symptoms.'
  },
  {
    tag: 'nuts',
    typicalOnsetHours: 1,
    typicalDurationHours: 6,
    mechanism: 'Protein allergy, high fat content, FODMAP in some nuts',
    evidenceLevel: 'moderate',
    notes: 'Allergic reactions immediate. Intolerance symptoms may be delayed.'
  }
]

/**
 * Get expected timing window for a specific trigger
 */
export function getExpectedWindow(triggerTag: string): TimeWindow | null {
  const knowledge = TRIGGER_KNOWLEDGE.find(k => k.tag === triggerTag)
  if (!knowledge) return null

  // Find the window that best matches the typical onset
  return TIME_WINDOWS.find(w => 
    knowledge.typicalOnsetHours >= w.hoursStart && 
    knowledge.typicalOnsetHours < w.hoursEnd
  ) || null
}

/**
 * Calculate hours between two timestamps
 */
export function hoursBetween(earlier: Date, later: Date): number {
  return (later.getTime() - earlier.getTime()) / (1000 * 60 * 60)
}

/**
 * Check if a meal falls within a time window before a symptom
 */
export function isInWindow(
  mealTime: Date,
  symptomTime: Date,
  window: TimeWindow
): boolean {
  const hours = hoursBetween(mealTime, symptomTime)
  return hours >= window.hoursStart && hours <= window.hoursEnd
}

// Made with Bob