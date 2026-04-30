export const COMMON_INGREDIENTS = [
  // Grains & Starches
  'wheat', 'bread', 'pasta', 'rice', 'oats', 'barley', 'rye', 'corn', 'potato',
  'quinoa', 'couscous', 'noodles', 'flour', 'cereal',
  
  // Dairy
  'milk', 'cheese', 'yogurt', 'cream', 'butter', 'ice cream', 'sour cream',
  'cottage cheese', 'mozzarella', 'cheddar', 'parmesan',
  
  // Proteins
  'egg', 'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp',
  'tofu', 'tempeh', 'beans', 'lentils', 'chickpeas', 'black beans',
  'kidney beans', 'pinto beans', 'turkey', 'lamb', 'bacon', 'sausage',
  
  // Vegetables
  'onion', 'garlic', 'leek', 'broccoli', 'cauliflower', 'cabbage',
  'brussels sprouts', 'spinach', 'lettuce', 'tomato', 'cucumber',
  'carrot', 'celery', 'bell pepper', 'zucchini', 'eggplant',
  'asparagus', 'mushroom', 'kale', 'arugula', 'beetroot',
  
  // Fruits
  'apple', 'banana', 'pear', 'orange', 'lemon', 'lime', 'berries',
  'strawberry', 'blueberry', 'raspberry', 'grapes', 'watermelon',
  'mango', 'pineapple', 'avocado', 'peach', 'plum', 'cherry',
  'kiwi', 'melon', 'grapefruit',
  
  // Nuts & Seeds
  'nuts', 'almonds', 'peanuts', 'cashews', 'walnuts', 'pecans',
  'sunflower seeds', 'pumpkin seeds', 'chia seeds', 'flax seeds',
  'sesame seeds',
  
  // Oils & Fats
  'olive oil', 'sunflower oil', 'coconut oil', 'vegetable oil',
  'canola oil', 'avocado oil',
  
  // Beverages & Additives
  'coffee', 'tea', 'beer', 'wine', 'alcohol', 'soda', 'juice',
  
  // Sweeteners & Flavorings
  'sugar', 'honey', 'maple syrup', 'artificial sweetener', 'stevia',
  'sorbitol', 'xylitol', 'chocolate', 'cocoa',
  
  // Condiments & Spices
  'salt', 'pepper', 'chili', 'paprika', 'cumin', 'cinnamon',
  'ginger', 'turmeric', 'basil', 'oregano', 'thyme', 'rosemary',
  'soy sauce', 'vinegar', 'mustard', 'ketchup', 'mayonnaise',
]

export interface IrritantTag {
  tag: string
  color: string
  keywords: string[]
}

export const IRRITANT_TAGS: IrritantTag[] = [
  {
    tag: 'gluten',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    keywords: ['gluten', 'wheat', 'barley', 'rye', 'bread', 'pasta', 'flour', 'cereal', 'couscous']
  },
  {
    tag: 'lactose',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    keywords: ['milk', 'lactose', 'dairy', 'cheese', 'yogurt', 'cream', 'butter', 'ice cream']
  },
  {
    tag: 'high-FODMAP',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    keywords: ['onion', 'garlic', 'leek', 'apple', 'pear', 'watermelon', 'mango', 'beans', 'lentils', 'chickpeas', 'mushroom', 'cauliflower', 'asparagus']
  },
  {
    tag: 'soy',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    keywords: ['soy', 'soybeans', 'tofu', 'tempeh', 'soy sauce', 'edamame']
  },
  {
    tag: 'egg',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    keywords: ['egg', 'eggs']
  },
  {
    tag: 'nuts',
    color: 'bg-stone-100 text-stone-800 border-stone-300',
    keywords: ['nuts', 'peanuts', 'almonds', 'cashews', 'walnuts', 'pecans', 'hazelnut']
  },
  {
    tag: 'spicy',
    color: 'bg-red-100 text-red-800 border-red-300',
    keywords: ['chili', 'pepper', 'spicy', 'hot sauce', 'jalapeño', 'cayenne', 'paprika']
  },
  {
    tag: 'high-fat',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    keywords: ['cream', 'butter', 'fried', 'oil', 'fatty', 'bacon', 'sausage']
  },
  {
    tag: 'caffeine',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    keywords: ['coffee', 'caffeine', 'espresso', 'energy drink', 'tea']
  },
  {
    tag: 'alcohol',
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    keywords: ['alcohol', 'wine', 'beer', 'vodka', 'whiskey', 'rum', 'gin']
  },
  {
    tag: 'artificial sweetener',
    color: 'bg-pink-100 text-pink-800 border-pink-300',
    keywords: ['sweetener', 'sorbitol', 'xylitol', 'aspartame', 'sucralose', 'stevia', 'sugar-free']
  }
]

export function detectIrritantTags(ingredients: string[]): string[] {
  const tags = new Set<string>()
  const lowerIngredients = ingredients.map(i => i.toLowerCase())
  
  for (const irritant of IRRITANT_TAGS) {
    for (const keyword of irritant.keywords) {
      if (lowerIngredients.some(ing => ing.includes(keyword))) {
        tags.add(irritant.tag)
        break
      }
    }
  }
  
  return Array.from(tags)
}

export function getTagColor(tag: string): string {
  const irritant = IRRITANT_TAGS.find(i => i.tag === tag)
  return irritant?.color || 'bg-gray-100 text-gray-800 border-gray-300'
}

// Made with Bob
