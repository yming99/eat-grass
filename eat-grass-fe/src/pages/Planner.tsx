import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import MealCard from '@/components/MealCard'
import { 
  Download, 
  Utensils, 
  Apple, 
  Fish, 
  Carrot, 
  Loader2, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign,
  MapPin,
  ChefHat,
  Store,
  Lightbulb,
  ShoppingCart,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { generateMealPlan, type MealPlanResponse } from '@/services/api'

/**
 * Form data interface for meal plan generation
 */
interface FormData {
  budget: string
  days: string
  people: string
  diet: string
  location: string // Optional location for restaurant scraping
}

/**
 * Planner Page Component
 * 
 * Allows users to generate personalized meal plans based on:
 * - Budget constraints
 * - Number of days
 * - Number of people
 * - Dietary preferences
 * - Location (for restaurant options via Just Eat scraping)
 * 
 * Uses Claude LLM backend for intelligent meal planning.
 */
export default function Planner() {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    budget: '',
    days: '',
    people: '',
    diet: '',
    location: '',
  })
  
  // Validation errors
  const [errors, setErrors] = useState<Partial<FormData>>({})
  
  // Loading state
  const [isGenerating, setIsGenerating] = useState(false)
  
  // API error state
  const [apiError, setApiError] = useState<string | null>(null)
  
  // Generated meal plan
  const [generatedPlan, setGeneratedPlan] = useState<MealPlanResponse | null>(null)
  
  // Current day index for carousel navigation
  const [currentDayIndex, setCurrentDayIndex] = useState(0)

  /**
   * Validate form inputs before submission
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}
    
    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Please enter a valid budget'
    }
    if (!formData.days || parseInt(formData.days) < 1) {
      newErrors.days = 'Please enter at least 1 day'
    }
    if (!formData.people || parseInt(formData.people) < 1) {
      newErrors.people = 'Please enter at least 1 person'
    }
    if (!formData.diet) {
      newErrors.diet = 'Please select a diet type'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle form submission - calls Claude LLM backend
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsGenerating(true)
    setApiError(null)
    
    try {
      // Call the backend API to generate meal plan using Claude LLM
      const mealPlan = await generateMealPlan({
        budget: parseFloat(formData.budget),
        days: parseInt(formData.days),
        people: parseInt(formData.people),
        diet: formData.diet,
        location: formData.location || undefined, // Optional location for restaurant scraping
      })

      setGeneratedPlan(mealPlan)
      setCurrentDayIndex(0) // Reset to first day when new plan is generated
    } catch (error) {
      console.error('Failed to generate meal plan:', error)
      setApiError(
        error instanceof Error 
          ? error.message 
          : 'Failed to generate meal plan. Please try again.'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * Export grocery list as text file
   */
  const handleExport = () => {
    if (!generatedPlan) return
    
    let groceryList = '🛒 GROCERY LIST\n'
    groceryList += '='.repeat(40) + '\n\n'
    
    // Add grocery items from the generated plan
    if (generatedPlan.groceryList && generatedPlan.groceryList.length > 0) {
      generatedPlan.groceryList.forEach(item => {
        groceryList += `${item.name}: ${item.totalQuantity} ${item.unit} - RM ${item.estimatedCost.toFixed(2)}\n`
      })
    } else {
      // Fallback: extract ingredients from meals
      const ingredientMap = new Map<string, { quantity: number; unit: string; totalCost: number }>()
      
      generatedPlan.daysData.forEach(day => {
        day.meals.forEach((meal) => {
          if (meal.ingredients) {
            meal.ingredients.forEach((ing) => {
              const key = `${ing.name}-${ing.unit}`
              if (ingredientMap.has(key)) {
                const existing = ingredientMap.get(key)!
                ingredientMap.set(key, {
                  quantity: existing.quantity + ing.quantity,
                  unit: ing.unit,
                  totalCost: existing.totalCost + ing.cost,
                })
              } else {
                ingredientMap.set(key, {
                  quantity: ing.quantity,
                  unit: ing.unit,
                  totalCost: ing.cost,
                })
              }
            })
          }
        })
      })

      ingredientMap.forEach((value, key) => {
        const [name] = key.split('-')
        groceryList += `${name}: ${value.quantity.toFixed(2)} ${value.unit} - RM ${value.totalCost.toFixed(2)}\n`
      })
    }
    
    groceryList += '\n' + '='.repeat(40) + '\n'
    groceryList += `📊 SUMMARY\n`
    groceryList += `Total Cost: RM ${generatedPlan.totalCost.toFixed(2)}\n`
    groceryList += `Budget: RM ${generatedPlan.budget.toFixed(2)}\n`
    groceryList += `Remaining: RM ${(generatedPlan.budget - generatedPlan.totalCost).toFixed(2)}\n`
    groceryList += `\nDays: ${generatedPlan.days}\n`
    groceryList += `People: ${generatedPlan.people}\n`
    groceryList += `Total Meals: ${generatedPlan.summary.totalMeals}\n`
    
    // Add tips if available
    if (generatedPlan.tips && generatedPlan.tips.length > 0) {
      groceryList += '\n' + '='.repeat(40) + '\n'
      groceryList += `💡 BUDGET TIPS\n\n`
      generatedPlan.tips.forEach((tip, index) => {
        groceryList += `${index + 1}. ${tip}\n`
      })
    }

    const blob = new Blob([groceryList], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meal-plan-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Render generated plan view
  if (generatedPlan) {
    const budgetRemaining = generatedPlan.budget - generatedPlan.totalCost
    const isOverBudget = budgetRemaining < 0

    return (
      <div className="space-y-8">
        {/* Header Bar */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your AI-Generated Meal Plan</h2>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">RM {generatedPlan.totalCost.toFixed(2)}</span>
                    <span className="text-sm text-neutral-600">total cost</span>
                  </div>
                </div>
                <Button onClick={handleExport} className="w-full md:w-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Export Grocery List
                </Button>
              </div>

              {/* Budget Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <DollarSign className="h-4 w-4" />
                    <span>Budget</span>
                  </div>
                  <p className="text-lg font-semibold">RM {generatedPlan.budget.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <TrendingDown className={`h-4 w-4 ${isOverBudget ? 'text-red-500' : 'text-green-500'}`} />
                    <span>{isOverBudget ? 'Over' : 'Remaining'}</span>
                  </div>
                  <p className={`text-lg font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                    RM {Math.abs(budgetRemaining).toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Calendar className="h-4 w-4" />
                    <span>Per Day</span>
                  </div>
                  <p className="text-lg font-semibold">RM {generatedPlan.summary.avgCostPerDay.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Users className="h-4 w-4" />
                    <span>Per Person</span>
                  </div>
                  <p className="text-lg font-semibold">RM {generatedPlan.summary.avgCostPerPerson.toFixed(2)}</p>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="flex flex-wrap gap-4 pt-2 text-sm text-neutral-600">
                <span>{generatedPlan.days} days</span>
                <span>•</span>
                <span>{generatedPlan.people} {generatedPlan.people === 1 ? 'person' : 'people'}</span>
                <span>•</span>
                <span>{generatedPlan.summary.totalMeals} meals</span>
                <span>•</span>
                <span>RM {generatedPlan.summary.avgCostPerMeal.toFixed(2)} per meal</span>
                {generatedPlan.summary.homeCooked !== undefined && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <ChefHat className="h-3 w-3" />
                      {generatedPlan.summary.homeCooked} home-cooked
                    </span>
                  </>
                )}
                {generatedPlan.summary.restaurant !== undefined && generatedPlan.summary.restaurant > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Store className="h-3 w-3" />
                      {generatedPlan.summary.restaurant} restaurant
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Tips */}
        {generatedPlan.tips && generatedPlan.tips.length > 0 && (
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Lightbulb className="h-5 w-5" />
                Budget Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {generatedPlan.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-amber-900">
                    <span className="font-semibold">{index + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Grocery List Summary */}
        {generatedPlan.groceryList && generatedPlan.groceryList.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Grocery List Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {generatedPlan.groceryList.slice(0, 12).map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-neutral-600">{item.totalQuantity} {item.unit}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      RM {item.estimatedCost.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              {generatedPlan.groceryList.length > 12 && (
                <p className="text-sm text-neutral-600 mt-3 text-center">
                  +{generatedPlan.groceryList.length - 12} more items in full grocery list
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Day Carousel with Navigation */}
        <div className="space-y-4">
          {/* Day Navigation Header */}
          <div className="flex items-center justify-between">
            {/* Previous Day Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDayIndex(prev => Math.max(0, prev - 1))}
              disabled={currentDayIndex === 0}
              className="h-10 w-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Day Indicator */}
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {generatedPlan.daysData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentDayIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === currentDayIndex 
                        ? 'bg-primary w-6' 
                        : 'bg-neutral-300 hover:bg-neutral-400'
                    }`}
                    aria-label={`Go to day ${index + 1}`}
                  />
                ))}
              </div>
              <span className="text-sm text-neutral-600 font-medium">
                {currentDayIndex + 1} of {generatedPlan.daysData.length} days
              </span>
            </div>

            {/* Next Day Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDayIndex(prev => Math.min(generatedPlan.daysData.length - 1, prev + 1))}
              disabled={currentDayIndex === generatedPlan.daysData.length - 1}
              className="h-10 w-10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Current Day Card */}
          {generatedPlan.daysData[currentDayIndex] && (
            <Card className="transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {generatedPlan.daysData[currentDayIndex].dayName || `Day ${generatedPlan.daysData[currentDayIndex].day}`}
                  </CardTitle>
                  <span className="text-lg font-semibold text-primary">
                    RM {generatedPlan.daysData[currentDayIndex].dayCost.toFixed(2)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedPlan.daysData[currentDayIndex].meals.map((meal, mealIndex: number) => (
                  <MealCard 
                    key={`${meal.id}-${mealIndex}`} 
                    meal={{
                      ...meal,
                      totalCost: meal.cost,
                      costPerServing: meal.cost / meal.servings,
                      ingredientBreakdown: meal.ingredients?.map(ing => ({
                        name: ing.name,
                        quantity: ing.quantity,
                        unit: ing.unit,
                        price: ing.cost / ing.quantity,
                        totalCost: ing.cost
                      }))
                    }} 
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Day Jump Buttons (for plans with many days) */}
          {generatedPlan.daysData.length > 5 && (
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {generatedPlan.daysData.map((day, index) => (
                <Button
                  key={index}
                  variant={index === currentDayIndex ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentDayIndex(index)}
                  className="min-w-[60px]"
                >
                  Day {day.day}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setGeneratedPlan(null)}
          >
            Create New Plan
          </Button>
        </div>
      </div>
    )
  }

  // Render form view
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">AI Meal Planner</h1>
        <p className="text-neutral-600">Create a personalized meal plan powered by AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-[24px]">
                {/* API Error Alert */}
                {apiError && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Failed to generate meal plan</p>
                      <p className="text-sm text-red-600 mt-1">{apiError}</p>
                    </div>
                  </div>
                )}

                {/* Budget Input */}
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (RM)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="Enter your budget"
                    min="1"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => {
                      setFormData({ ...formData, budget: e.target.value })
                      if (errors.budget) setErrors({ ...errors, budget: undefined })
                    }}
                    className={errors.budget ? 'border-red-500' : ''}
                    required
                  />
                  {errors.budget && (
                    <p className="text-xs text-red-500">{errors.budget}</p>
                  )}
                  {!errors.budget && (
                    <p className="text-xs text-neutral-500">
                      Your total budget for the meal plan
                    </p>
                  )}
                </div>

                {/* Days Input */}
                <div className="space-y-2">
                  <Label htmlFor="days">Days</Label>
                  <Input
                    id="days"
                    type="number"
                    placeholder="Number of days"
                    min="1"
                    max="30"
                    value={formData.days}
                    onChange={(e) => {
                      setFormData({ ...formData, days: e.target.value })
                      if (errors.days) setErrors({ ...errors, days: undefined })
                    }}
                    className={errors.days ? 'border-red-500' : ''}
                    required
                  />
                  {errors.days && (
                    <p className="text-xs text-red-500">{errors.days}</p>
                  )}
                  {!errors.days && (
                    <p className="text-xs text-neutral-500">
                      How many days would you like to plan for? (1-30 days)
                    </p>
                  )}
                </div>

                {/* People Input */}
                <div className="space-y-2">
                  <Label htmlFor="people">People</Label>
                  <Input
                    id="people"
                    type="number"
                    placeholder="Number of people"
                    min="1"
                    max="10"
                    value={formData.people}
                    onChange={(e) => {
                      setFormData({ ...formData, people: e.target.value })
                      if (errors.people) setErrors({ ...errors, people: undefined })
                    }}
                    className={errors.people ? 'border-red-500' : ''}
                    required
                  />
                  {errors.people && (
                    <p className="text-xs text-red-500">{errors.people}</p>
                  )}
                  {!errors.people && (
                    <p className="text-xs text-neutral-500">
                      Number of people this plan is for (1-10 people)
                    </p>
                  )}
                </div>

                {/* Diet Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="diet">Diet</Label>
                  <Select
                    value={formData.diet}
                    onValueChange={(value) => {
                      setFormData({ ...formData, diet: value })
                      if (errors.diet) setErrors({ ...errors, diet: undefined })
                    }}
                    required
                  >
                    <SelectTrigger id="diet" className={errors.diet ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select diet type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="high-protein">High Protein</SelectItem>
                      <SelectItem value="low-carb">Low Carb</SelectItem>
                      <SelectItem value="keto">Keto</SelectItem>
                      <SelectItem value="halal">Halal</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.diet && (
                    <p className="text-xs text-red-500">{errors.diet}</p>
                  )}
                  {!errors.diet && (
                    <p className="text-xs text-neutral-500">
                      Select your dietary preference
                    </p>
                  )}
                </div>

                {/* Location Input (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location (Optional)
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter postcode or area (e.g., 50000 KL)"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                  <p className="text-xs text-neutral-500">
                    Add your location to include nearby restaurant options in your plan
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full md:w-auto px-8"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating AI Plan...
                      </>
                    ) : (
                      'Generate AI Meal Plan'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Illustration - Desktop Only */}
        <div className="hidden lg:block">
          <Card className="h-full">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="relative w-full h-full flex items-center justify-center">
                <Utensils className="absolute top-4 left-4 h-16 w-16 text-primary/30" />
                <Apple className="absolute top-12 right-8 h-12 w-12 text-primary/30" />
                <Fish className="absolute bottom-8 left-8 h-14 w-14 text-primary/30" />
                <Carrot className="absolute bottom-4 right-4 h-10 w-10 text-primary/30" />
                <div className="text-center">
                  <Utensils className="h-24 w-24 text-primary/20 mx-auto mb-4" />
                  <p className="text-sm text-neutral-600 font-medium">Powered by Claude AI</p>
                  <p className="text-xs text-neutral-500 mt-1">Intelligent meal planning</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}