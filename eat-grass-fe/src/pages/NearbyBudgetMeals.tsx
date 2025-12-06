import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MapPin, Clock, TrendingUp, ShoppingCart } from 'lucide-react'
import nearbyMealsData from '@/data/nearby_meals.json'

interface Meal {
  meal_id: number
  name: string
  price: number
  calories: number
  image: string
  ingredients: string[]
}

interface Stall {
  stall_id: number
  name: string
  location_detail: string
  distance_m: number
  operating_hours: string
  popular_meals: string[]
  meals: Meal[]
}

interface FilteredMeal extends Meal {
  stall: Stall
}

export default function NearbyBudgetMeals() {
  const [budget, setBudget] = useState('20')
  const [mealsNeeded, setMealsNeeded] = useState('2')
  const [location, setLocation] = useState('Sunway Pyramid')
  const [searchResults, setSearchResults] = useState<FilteredMeal[]>([])
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSearch = () => {
    const budgetNum = parseFloat(budget)
    const mealsNeededNum = parseInt(mealsNeeded)
    const maxRadius = 250 // meters

    if (!budgetNum || !mealsNeededNum) {
      alert('Please enter valid budget and meal count')
      return
    }

    // Filter meals that fit budget and are within radius
    const filtered: FilteredMeal[] = []
    
    nearbyMealsData.stalls.forEach((stall) => {
      if (stall.distance_m <= maxRadius) {
        stall.meals.forEach((meal) => {
          const totalCost = meal.price * mealsNeededNum
          if (totalCost <= budgetNum) {
            filtered.push({
              ...meal,
              stall,
            })
          }
        })
      }
    })

    // Sort by: 1. Lowest price, 2. Closest distance
    filtered.sort((a, b) => {
      if (a.price !== b.price) {
        return a.price - b.price
      }
      return a.stall.distance_m - b.stall.distance_m
    })

    setSearchResults(filtered)
  }

  const handleViewStall = (stall: Stall) => {
    setSelectedStall(stall)
    setIsModalOpen(true)
  }

  const handleAddToMealPlan = (meal: FilteredMeal) => {
    // Add to meal plan logic
    alert(`Added ${meal.name} to meal plan!`)
  }

  const totalOptions = searchResults.length
  const uniqueStalls = new Set(searchResults.map((m) => m.stall.stall_id)).size

  return (
    <div className="space-y-8 pb-20">
      {/* Top Header Section */}
      <Card>
        <CardHeader>
          <CardTitle>Find Nearby Budget Meals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (RM)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="20"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                min="1"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meals">Meals Needed</Label>
              <Input
                id="meals"
                type="number"
                placeholder="2"
                value={mealsNeeded}
                onChange={(e) => setMealsNeeded(e.target.value)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                placeholder="Sunway Pyramid"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleSearch}
            className="w-full md:w-auto mt-6 md:mt-4"
            size="lg"
          >
            Search Nearby Meals
          </Button>
        </CardContent>
      </Card>

      {/* Results Header */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            Showing meals under RM{parseFloat(budget).toFixed(2)} for {location}
          </h2>
          <p className="text-neutral-600">
            Found {totalOptions} {totalOptions === 1 ? 'option' : 'options'} across{' '}
            {uniqueStalls} {uniqueStalls === 1 ? 'food stall' : 'food stalls'}
          </p>
        </div>
      )}

      {/* Empty State */}
      {searchResults.length === 0 && budget && mealsNeeded && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-4xl mb-4">😢</p>
            <p className="text-lg font-semibold mb-2">
              No meals found under RM{parseFloat(budget).toFixed(2)} here.
            </p>
            <p className="text-neutral-600">
              Try increasing your budget or reducing meal count.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Food Stall + Meal Options Grid */}
      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((meal) => {
            const isBestDeal = meal.price < 10
            return (
              <Card
                key={`${meal.stall.stall_id}-${meal.meal_id}`}
                className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base mb-1 line-clamp-2">
                        {meal.stall.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span>{meal.stall.distance_m}m away</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Meal Image */}
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-neutral-100">
                    <img
                      src={meal.image}
                      alt={meal.name}
                      className="w-full h-full object-cover"
                    />
                    {isBestDeal && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                        🔥 Best Deal
                      </div>
                    )}
                  </div>

                  {/* Meal Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{meal.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-primary">
                        RM{meal.price.toFixed(2)} per meal
                      </p>
                      <p className="text-sm text-neutral-600">
                        {meal.calories} cal
                      </p>
                    </div>
                    <p className="text-xs text-neutral-600">
                      Total: RM{(meal.price * parseInt(mealsNeeded)).toFixed(2)} for{' '}
                      {mealsNeeded} {parseInt(mealsNeeded) === 1 ? 'meal' : 'meals'}
                    </p>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Ingredients:</p>
                    <p className="text-sm text-neutral-700">
                      {meal.ingredients.join(', ')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewStall(meal.stall)}
                    >
                      View Stall
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAddToMealPlan(meal)}
                    >
                      <ShoppingCart className="mr-1 h-4 w-4" />
                      Add to Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Stall Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedStall?.name}</DialogTitle>
          </DialogHeader>

          {selectedStall && (
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-sm text-neutral-600">
                      {selectedStall.location_detail}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {selectedStall.distance_m}m away
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Operating Hours</p>
                    <p className="text-sm text-neutral-600">
                      {selectedStall.operating_hours}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Popular Meals</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedStall.popular_meals.map((meal, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-softGreen/50 rounded-full"
                        >
                          {meal}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  className="w-full"
                  onClick={() => {
                    setIsModalOpen(false)
                    // Navigate to all meals from this stall
                    alert(`Viewing all meals from ${selectedStall.name}`)
                  }}
                >
                  View all meals from this stall
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

