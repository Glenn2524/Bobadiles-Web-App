export interface OpenFoodFactsProduct {
  code: string
  product_name: string
  brands?: string
  ingredients_text?: string
  ingredients?: Array<{ id: string; text: string }>
  allergens_tags?: string[]
  image_url?: string
  image_small_url?: string
  nutriments?: any
}

export interface OpenFoodFactsResponse {
  status: number
  product?: OpenFoodFactsProduct
}

export interface SearchResult {
  products: OpenFoodFactsProduct[]
  count: number
  page: number
  page_size: number
}

export async function getProductByBarcode(barcode: string): Promise<OpenFoodFactsProduct | null> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
    )
    
    if (!response.ok) {
      return null
    }

    const data: OpenFoodFactsResponse = await response.json()
    
    if (data.status === 1 && data.product) {
      return data.product
    }
    
    return null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function searchProducts(query: string, pageSize: number = 10): Promise<SearchResult> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=${pageSize}`
    )
    
    if (!response.ok) {
      return { products: [], count: 0, page: 1, page_size: pageSize }
    }

    const data = await response.json()
    
    return {
      products: data.products || [],
      count: data.count || 0,
      page: data.page || 1,
      page_size: data.page_size || pageSize
    }
  } catch (error) {
    console.error('Error searching products:', error)
    return { products: [], count: 0, page: 1, page_size: pageSize }
  }
}

export function extractIngredients(product: OpenFoodFactsProduct): string[] {
  const ingredients: string[] = []
  
  // Try parsed ingredients first
  if (product.ingredients && product.ingredients.length > 0) {
    product.ingredients.forEach(ing => {
      if (ing.text) {
        ingredients.push(ing.text.trim())
      }
    })
  }
  
  // Fallback to ingredients_text
  if (ingredients.length === 0 && product.ingredients_text) {
    const parts = product.ingredients_text
      .split(/[,;]/)
      .map(p => p.trim())
      .filter(p => p.length > 0 && p.length < 50) // Filter out very long strings
    
    ingredients.push(...parts)
  }
  
  return ingredients.slice(0, 20) // Limit to 20 ingredients
}

export function extractAllergens(product: OpenFoodFactsProduct): string[] {
  if (!product.allergens_tags) {
    return []
  }
  
  return product.allergens_tags
    .map(tag => tag.replace('en:', ''))
    .filter(tag => tag.length > 0)
}

// Made with Bob
