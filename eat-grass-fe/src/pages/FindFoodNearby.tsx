import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Navigation, Search, Utensils } from 'lucide-react'
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

export default function FindFoodNearby() {
  const [location, setLocation] = useState('Sunway Pyramid')
  const [recommendedShops, setRecommendedShops] = useState<Stall[]>([])

  // Load recommended shops based on location
  useEffect(() => {
    if (location) {
      // Filter shops by location and sort by distance (closest first)
      const shops = nearbyMealsData.stalls
        .filter((stall) => 
          stall.location_detail.toLowerCase().includes(location.toLowerCase()) ||
          location.toLowerCase().includes('sunway')
        )
        .sort((a, b) => a.distance_m - b.distance_m)
        .slice(0, 10) // Show top 10 closest shops
      
      setRecommendedShops(shops)
    }
  }, [location])

  const handleSearch = () => {
    // Filter shops by location
    const shops = nearbyMealsData.stalls
      .filter((stall) => 
        stall.location_detail.toLowerCase().includes(location.toLowerCase()) ||
        location.toLowerCase().includes('sunway')
      )
      .sort((a, b) => a.distance_m - b.distance_m)
      .slice(0, 10)
    
    setRecommendedShops(shops)
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Navigation className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Find Food Nearby</h1>
        </div>
        <p className="text-neutral-600">
          Discover recommended shops and restaurants near your location
        </p>
      </div>

      {/* Location Search */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Enter location (e.g., Sunway Pyramid)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-11 h-12"
              />
            </div>
            <Button onClick={handleSearch} size="lg" className="h-12">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Shops */}
      {recommendedShops.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            Recommended Shops Near {location}
          </h2>
          
          <div className="space-y-6">
            {recommendedShops.map((shop) => (
              <Card key={shop.stall_id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Utensils className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{shop.name}</CardTitle>
                          <div className="flex items-center gap-4 mt-1 text-sm text-neutral-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{shop.location_detail}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>{shop.distance_m}m away</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{shop.operating_hours}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Menu Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Menu</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {shop.meals.map((meal) => (
                        <div
                          key={meal.meal_id}
                          className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex gap-4">
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                              <img
                                src={meal.image}
                                alt={meal.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-base mb-1 line-clamp-1">
                                {meal.name}
                              </h4>
                              <p className="text-2xl font-bold text-primary mb-2">
                                RM{meal.price.toFixed(2)}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-neutral-600 mb-2">
                                <span>{meal.calories} cal</span>
                                {meal.ingredients.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="line-clamp-1">
                                      {meal.ingredients.slice(0, 2).join(', ')}
                                      {meal.ingredients.length > 2 && '...'}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Popular Meals */}
                  {shop.popular_meals.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-neutral-600 mb-2">
                        Popular Items:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {shop.popular_meals.map((meal, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {meal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recommendedShops.length === 0 && location && (
        <Card>
          <CardContent className="p-12 text-center">
            <Navigation className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">
              No shops found near {location}
            </p>
            <p className="text-neutral-600">
              Try searching for a different location
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

