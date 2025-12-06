import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Flame } from 'lucide-react'

interface MealCardProps {
  meal: {
    id: string
    name: string
    image: string
    cost?: number
    totalCost?: number
    calories?: number
    prepTime?: number
    cookTime?: number
    tags?: string[]
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    ingredientBreakdown?: Array<{
      name: string
      quantity: number
      unit: string
      price: number
      totalCost: number
    }>
    servings?: number
    costPerServing?: number
  }
}

export default function MealCard({ meal }: MealCardProps) {
  const totalTime = (meal.prepTime || 0) + (meal.cookTime || 0)
  const mealTypeLabels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4 md:p-6">
          <div className="relative flex-shrink-0">
            <img
              src={meal.image}
              alt={meal.name}
              className="w-[120px] h-[120px] object-cover rounded-lg"
            />
            {meal.mealType && (
              <span className="absolute top-2 left-2 bg-primary/90 text-white text-xs px-2 py-1 rounded-md font-medium">
                {mealTypeLabels[meal.mealType]}
              </span>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="text-lg font-semibold mb-2">{meal.name}</h3>
              {meal.totalCost !== undefined && (
                <div className="mb-2">
                  <p className="text-base font-semibold text-primary">
                    RM {meal.totalCost.toFixed(2)} total
                  </p>
                  {meal.costPerServing && meal.servings && (
                    <p className="text-sm text-neutral-600">
                      RM {meal.costPerServing.toFixed(2)} per serving ({meal.servings} servings)
                    </p>
                  )}
                </div>
              )}
              {meal.cost !== undefined && meal.totalCost === undefined && (
                <p className="text-base font-semibold text-primary mb-2">
                  RM {meal.cost.toFixed(2)} per meal
                </p>
              )}
              
              {/* Additional Details */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 mb-3">
                {meal.calories && (
                  <div className="flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    <span>{meal.calories} cal</span>
                  </div>
                )}
                {totalTime > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{totalTime} min</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {meal.tags && meal.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {meal.tags.slice(0, 2).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-softGreen/50 text-neutral-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Ingredient Breakdown */}
              {meal.ingredientBreakdown && meal.ingredientBreakdown.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <p className="text-xs font-semibold text-neutral-600 mb-2">Ingredients Needed:</p>
                  <div className="space-y-1">
                    {meal.ingredientBreakdown.map((ing, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-neutral-700">
                          {ing.name} ({ing.quantity} {ing.unit})
                        </span>
                        <span className="text-neutral-600 font-medium">
                          RM {ing.totalCost.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button asChild variant="outline" className="w-full md:w-auto mt-4">
              <Link to={`/meal/${meal.id}`}>View Details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

