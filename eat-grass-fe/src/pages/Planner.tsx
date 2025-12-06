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
import { Download, Utensils, Apple, Fish, Carrot, Loader2, TrendingDown, Users, Calendar, DollarSign } from 'lucide-react'
import mealsData from '@/data/meals.json'
import ingredientsData from '@/data/ingredients.json'

interface FormData {
  budget: string
  days: string
  people: string
  diet: string
}

interface GeneratedPlan {
  totalCost: number
  budget: number
  days: number
  people: number
  daysData: Array<{
    day: number
    meals: any[]
    dayCost: number
  }>
  summary: {
    avgCostPerDay: number
    avgCostPerPerson: number
    avgCostPerMeal: number
    totalMeals: number
  }
}

export default function Planner() {
  const [formData, setFormData] = useState<FormData>({
    budget: '',
    days: '',
    people: '',
    diet: '',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsGenerating(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    const budget = parseFloat(formData.budget)
    const people = parseInt(formData.people)
    const mealsNeeded = parseInt(formData.days) // Using days as meal count
    const servingsNeeded = people * mealsNeeded

    // Create ingredient lookup map (normalize names to lowercase)
    const ingredientMap = new Map<string, typeof ingredientsData[0]>()
    ingredientsData.forEach(ing => {
      ingredientMap.set(ing.name.toLowerCase(), ing)
    })

    // Filter meals based on diet
    let filteredMeals = [...mealsData]
    if (formData.diet === 'vegetarian') {
      filteredMeals = mealsData.filter(meal => meal.tags?.includes('vegetarian'))
    } else if (formData.diet === 'high-protein') {
      filteredMeals = mealsData.filter(meal => meal.protein && meal.protein >= 25)
    }

    // Calculate which meals can be made with the budget
    const availableMeals: Array<{
      meal: typeof mealsData[0]
      totalCost: number
      ingredientBreakdown: Array<{
        name: string
        quantity: number
        unit: string
        price: number
        totalCost: number
      }>
      servings: number
      costPerServing: number
    }> = []

    filteredMeals.forEach(meal => {
      if (!meal.ingredients || !Array.isArray(meal.ingredients)) return

      const ingredientBreakdown: Array<{
        name: string
        quantity: number
        unit: string
        price: number
        totalCost: number
      }> = []

      let mealTotalCost = 0
      let canMake = true

      // Calculate ingredient costs for the number of servings needed
      meal.ingredients.forEach((ing: any) => {
        const ingName = ing.name.toLowerCase()
        const ingredient = ingredientMap.get(ingName)
        
        if (!ingredient) {
          canMake = false
          return
        }

        // Calculate quantity needed (scale by servings)
        const quantityNeeded = (ing.quantity / meal.servings) * servingsNeeded
        const totalCost = ingredient.price * quantityNeeded

        ingredientBreakdown.push({
          name: ingredient.name,
          quantity: parseFloat(quantityNeeded.toFixed(2)),
          unit: ing.unit,
          price: ingredient.price,
          totalCost: parseFloat(totalCost.toFixed(2)),
        })

        mealTotalCost += totalCost
      })

      if (canMake && mealTotalCost <= budget) {
        availableMeals.push({
          meal,
          totalCost: parseFloat(mealTotalCost.toFixed(2)),
          ingredientBreakdown,
          servings: servingsNeeded,
          costPerServing: parseFloat((mealTotalCost / servingsNeeded).toFixed(2)),
        })
      }
    })

    // Sort by cost (cheapest first)
    availableMeals.sort((a, b) => a.totalCost - b.totalCost)

    // Select meals for the plan (up to mealsNeeded)
    const selectedMeals = availableMeals.slice(0, mealsNeeded).map(item => ({
      ...item.meal,
      totalCost: item.totalCost,
      ingredientBreakdown: item.ingredientBreakdown,
      costPerServing: item.costPerServing,
      servings: item.servings,
    }))

    // Organize by days (distribute meals evenly across days)
    const numDays = parseInt(formData.days)
    const mealsPerDay = Math.ceil(selectedMeals.length / numDays)
    const daysData = Array.from({ length: numDays }, (_, i) => {
      const startIdx = i * mealsPerDay
      const endIdx = Math.min(startIdx + mealsPerDay, selectedMeals.length)
      const dayMeals = selectedMeals.slice(startIdx, endIdx)
      const dayCost = dayMeals.reduce((sum, meal) => sum + (meal.totalCost || 0), 0)
      return {
        day: i + 1,
        meals: dayMeals,
        dayCost: parseFloat(dayCost.toFixed(2)),
      }
    })

    const totalCost = selectedMeals.reduce((sum, meal) => sum + (meal.totalCost || 0), 0)
    const totalMeals = selectedMeals.length

    const plan: GeneratedPlan = {
      totalCost: parseFloat(totalCost.toFixed(2)),
      budget: parseFloat(formData.budget),
      days: parseInt(formData.days),
      people: parseInt(formData.people),
      daysData,
      summary: {
        avgCostPerDay: parseFloat((totalCost / parseInt(formData.days)).toFixed(2)),
        avgCostPerPerson: parseFloat((totalCost / parseInt(formData.people)).toFixed(2)),
        avgCostPerMeal: parseFloat((totalCost / totalMeals).toFixed(2)),
        totalMeals,
      },
    }

    setGeneratedPlan(plan)
    setIsGenerating(false)
  }

  const handleExport = () => {
    if (!generatedPlan) return
    
    // Create detailed grocery list from ingredient breakdown
    const ingredientMap = new Map<string, { quantity: number; unit: string; totalCost: number }>()
    
    generatedPlan.daysData.forEach(day => {
      day.meals.forEach((meal: any) => {
        if (meal.ingredientBreakdown) {
          meal.ingredientBreakdown.forEach((ing: any) => {
            const key = `${ing.name}-${ing.unit}`
            if (ingredientMap.has(key)) {
              const existing = ingredientMap.get(key)!
              ingredientMap.set(key, {
                quantity: existing.quantity + ing.quantity,
                unit: ing.unit,
                totalCost: existing.totalCost + ing.totalCost,
              })
            } else {
              ingredientMap.set(key, {
                quantity: ing.quantity,
                unit: ing.unit,
                totalCost: ing.totalCost,
              })
            }
          })
        }
      })
    })

    let groceryList = 'GROCERY LIST\n'
    groceryList += '='.repeat(30) + '\n\n'
    
    ingredientMap.forEach((value, key) => {
      const [name] = key.split('-')
      groceryList += `${name}: ${value.quantity.toFixed(2)} ${value.unit} - RM ${value.totalCost.toFixed(2)}\n`
    })
    
    groceryList += '\n' + '='.repeat(30) + '\n'
    groceryList += `Total Cost: RM ${generatedPlan.totalCost.toFixed(2)}\n`
    groceryList += `Budget: RM ${generatedPlan.budget.toFixed(2)}\n`
    groceryList += `Remaining: RM ${(generatedPlan.budget - generatedPlan.totalCost).toFixed(2)}\n`

    const blob = new Blob([groceryList], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grocery-list-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

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
                  <h2 className="text-2xl font-bold mb-2">Your Meal Plan</h2>
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Days Layout - Two Column Desktop, Single Column Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {generatedPlan.daysData.map((day, index: number) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Day {day.day}</CardTitle>
                  <span className="text-sm font-semibold text-primary">
                    RM {day.dayCost.toFixed(2)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {day.meals.map((meal: any, mealIndex: number) => (
                  <MealCard key={`${meal.id}-${mealIndex}`} meal={meal} />
                ))}
              </CardContent>
            </Card>
          ))}
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Meal Planner</h1>
        <p className="text-neutral-600">Create a personalized meal plan based on your preferences</p>
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
                      <SelectItem value="high-protein">High Protein</SelectItem>
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

                {/* Submit Button - Sticky on Mobile */}
                <div className="flex justify-center pt-6">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full md:w-auto px-8 md:sticky md:bottom-4 z-40"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Plan...
                      </>
                    ) : (
                      'Generate Plan'
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
                  <p className="text-sm text-neutral-600">Food Icons</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
