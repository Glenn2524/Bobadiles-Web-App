'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  searchProducts, 
  getProductByBarcode, 
  extractIngredients,
  OpenFoodFactsProduct 
} from '@/lib/openfoodfacts'
import { 
  COMMON_INGREDIENTS, 
  detectIrritantTags, 
  getTagColor 
} from '@/lib/ingredient-taxonomy'
import { Search, Barcode, PlusCircle, X, Check } from 'lucide-react'

export default function MealPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('manual')
  
  // Manual entry state
  const [dishName, setDishName] = useState('')
  const [ingredientInput, setIngredientInput] = useState('')
  const [ingredients, setIngredients] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<OpenFoodFactsProduct[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<OpenFoodFactsProduct | null>(null)
  
  // Barcode state
  const [barcodeInput, setBarcodeInput] = useState('')
  const [barcodeLoading, setBarcodeLoading] = useState(false)
  const [barcodeProduct, setBarcodeProduct] = useState<OpenFoodFactsProduct | null>(null)
  
  // Saving state
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    const id = localStorage.getItem('gutcheck_user_id')
    if (!id) {
      router.push('/')
      return
    }
    setUserId(id)
  }, [router])

  // Manual entry: ingredient autocomplete
  useEffect(() => {
    if (ingredientInput.length > 1) {
      const filtered = COMMON_INGREDIENTS.filter(ing =>
        ing.toLowerCase().includes(ingredientInput.toLowerCase()) &&
        !ingredients.includes(ing)
      ).slice(0, 5)
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }, [ingredientInput, ingredients])

  const addIngredient = (ingredient: string) => {
    if (ingredient && !ingredients.includes(ingredient)) {
      setIngredients([...ingredients, ingredient])
      setIngredientInput('')
      setSuggestions([])
    }
  }

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient))
  }

  // Search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setSearchLoading(true)
    const results = await searchProducts(searchQuery, 10)
    setSearchResults(results.products)
    setSearchLoading(false)
  }

  const selectSearchProduct = (product: OpenFoodFactsProduct) => {
    setSelectedProduct(product)
    setDishName(product.product_name || '')
    const extractedIngredients = extractIngredients(product)
    setIngredients(extractedIngredients)
  }

  // Barcode functionality
  const handleBarcodeSearch = async () => {
    if (!barcodeInput.trim()) return
    
    setBarcodeLoading(true)
    const product = await getProductByBarcode(barcodeInput)
    setBarcodeProduct(product)
    
    if (product) {
      setDishName(product.product_name || '')
      const extractedIngredients = extractIngredients(product)
      setIngredients(extractedIngredients)
    }
    
    setBarcodeLoading(false)
  }

  // Save meal
  const saveMeal = async () => {
    if (!userId || !dishName.trim() || ingredients.length === 0) {
      alert('Please provide a dish name and at least one ingredient')
      return
    }

    setSaving(true)
    setSaveSuccess(false)

    try {
      const irritantTags = detectIrritantTags(ingredients)
      
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          dishName: dishName.trim(),
          ingredients,
          irritantTags,
          source: activeTab,
          notes: notes.trim() || null
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save meal')
      }

      setSaveSuccess(true)
      
      // Reset form after 1 second
      setTimeout(() => {
        setDishName('')
        setIngredients([])
        setNotes('')
        setSelectedProduct(null)
        setBarcodeProduct(null)
        setSearchResults([])
        setSaveSuccess(false)
      }, 1500)
      
    } catch (error) {
      console.error('Error saving meal:', error)
      alert('Failed to save meal. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const irritantTags = detectIrritantTags(ingredients)

  if (!userId) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/')}>
            ← Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Log a Meal</CardTitle>
            <p className="text-sm text-gray-500 mt-2">
              Use any combination of methods below to log your meal
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Section */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Search Food Database</h3>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., greek yogurt"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearch()
                    }}
                  />
                  <Button onClick={handleSearch} disabled={searchLoading}>
                    {searchLoading ? 'Searching...' : 'Search'}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map((product) => (
                      <button
                        key={product.code}
                        onClick={() => selectSearchProduct(product)}
                        className={`w-full p-3 border rounded-lg text-left hover:bg-white transition-colors ${
                          selectedProduct?.code === product.code ? 'border-green-500 bg-white' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {product.image_small_url && (
                            <img
                              src={product.image_small_url}
                              alt={product.product_name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{product.product_name}</div>
                            {product.brands && (
                              <div className="text-sm text-gray-500">{product.brands}</div>
                            )}
                          </div>
                          {selectedProduct?.code === product.code && (
                            <Check className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Barcode Section */}
            <div className="border rounded-lg p-4 bg-purple-50">
              <div className="flex items-center gap-2 mb-3">
                <Barcode className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Barcode Lookup</h3>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., 3017620422003"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleBarcodeSearch()
                    }}
                  />
                  <Button onClick={handleBarcodeSearch} disabled={barcodeLoading}>
                    {barcodeLoading ? 'Loading...' : 'Lookup'}
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Enter barcode manually. Camera scanning coming soon!
                </p>

                {barcodeProduct && (
                  <div className="border rounded-lg p-3 bg-white">
                    <div className="flex items-start gap-3">
                      {barcodeProduct.image_small_url && (
                        <img
                          src={barcodeProduct.image_small_url}
                          alt={barcodeProduct.product_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold">{barcodeProduct.product_name}</h4>
                        {barcodeProduct.brands && (
                          <p className="text-sm text-gray-600">{barcodeProduct.brands}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {barcodeProduct === null && barcodeInput && !barcodeLoading && (
                  <div className="text-center py-2 text-gray-500 text-sm">
                    Product not found. Try a different barcode.
                  </div>
                )}
              </div>
            </div>

            {/* Manual Entry Section */}
            <div className="border rounded-lg p-4 bg-green-50">
              <div className="flex items-center gap-2 mb-3">
                <PlusCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Manual Entry</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="dishName">Dish Name</Label>
                  <Input
                    id="dishName"
                    placeholder="e.g., Chicken Caesar Salad"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="ingredient">Add Ingredients</Label>
                  <div className="relative">
                    <Input
                      id="ingredient"
                      placeholder="Type to search ingredients..."
                      value={ingredientInput}
                      onChange={(e) => setIngredientInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && ingredientInput.trim()) {
                          addIngredient(ingredientInput.trim())
                        }
                      }}
                    />
                    {suggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100"
                            onClick={() => addIngredient(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Any additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Current Ingredients Display */}
            {ingredients.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <Label className="mb-2 block">Current Ingredients ({ingredients.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient) => (
                    <span
                      key={ingredient}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {ingredient}
                      <button
                        onClick={() => removeIngredient(ingredient)}
                        className="hover:text-green-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Irritant Tags Display */}
            {irritantTags.length > 0 && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-900 mb-2">⚠️ Potential Irritants Detected</h4>
                <div className="flex flex-wrap gap-2">
                  {irritantTags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-3 py-1 rounded-full text-sm border ${getTagColor(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 flex gap-3">
              <Button
                onClick={saveMeal}
                disabled={saving || !dishName.trim() || ingredients.length === 0}
                className="flex-1"
              >
                {saving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Meal'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Made with Bob