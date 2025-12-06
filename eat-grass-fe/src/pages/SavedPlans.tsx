import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Calendar } from 'lucide-react'
import savedPlansData from '@/data/saved_plans.json'
import mealsData from '@/data/meals.json'
import { cn } from '@/lib/utils'

interface SavedPlan {
  id: string
  name: string
  createdAt: string
  meals: string[]
  description?: string
  totalCost?: number
}

export default function SavedPlans() {
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  // Enrich saved plans with meal data and calculate costs
  const enrichedPlans: (SavedPlan & { mealImages: string[]; totalCost: number })[] =
    savedPlansData.map((plan) => {
      const mealImages = plan.meals
        .map((mealId) => {
          const meal = mealsData.find((m) => m.id === mealId)
          return meal?.image
        })
        .filter(Boolean) as string[]

      // Use totalCost from plan data or calculate
      const totalCost = plan.totalCost || plan.meals.length * 15.5

      return {
        ...plan,
        mealImages,
        totalCost: parseFloat(totalCost.toFixed(2)),
      }
    })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleReRunPlan = (planId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // Navigate to planner with plan data
    navigate('/planner', { state: { planId } })
  }

  const handleCardClick = (planId: string) => {
    // Load plan details
    navigate(`/plan/${planId}`)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Saved Plans</h1>
        <p className="text-neutral-600">View and manage your saved meal plans</p>
      </div>

      {enrichedPlans.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-neutral-600">No saved plans yet. Create your first plan!</p>
            <Button className="mt-4" onClick={() => navigate('/planner')}>
              Create Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrichedPlans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                'cursor-pointer transition-all duration-300 overflow-hidden',
                hoveredCard === plan.id
                  ? 'shadow-xl -translate-y-2'
                  : 'shadow-md hover:shadow-lg'
              )}
              onMouseEnter={() => setHoveredCard(plan.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleCardClick(plan.id)}
            >
              <CardHeader>
                <CardTitle className="line-clamp-2">{plan.name}</CardTitle>
                {plan.description && (
                  <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                    {plan.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 4-Image Collage Preview */}
                <div className="grid grid-cols-2 gap-2 h-32">
                  {plan.mealImages.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className="relative overflow-hidden rounded-lg bg-neutral-100"
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={`Meal ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                      {index === 3 && plan.mealImages.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            +{plan.mealImages.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Total Cost */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-xs text-neutral-600">Total Cost</p>
                    <p className="text-xl font-bold text-primary">
                      RM {plan.totalCost.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(plan.createdAt)}</span>
                </div>

                {/* Re-run Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => handleReRunPlan(plan.id, e)}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Re-run Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

