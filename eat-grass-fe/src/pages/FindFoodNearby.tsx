import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Navigation, Search, Utensils } from "lucide-react";
import nearbyMealsData from "@/data/nearby_meals.json";

interface Meal {
  meal_id: number;
  name: string;
  price: number;
  calories: number;
  image: string;
  ingredients: string[];
}

interface Stall {
  stall_id: number;
  name: string;
  location_detail: string;
  distance_m: number;
  operating_hours: string;
  popular_meals: string[];
  meals: Meal[];
}

export default function FindFoodNearby() {
  const [location, setLocation] = useState("Sunway Pyramid");

  // Compute recommended shops based on location - auto-loads on mount and when location changes
  const recommendedShops: Stall[] = useMemo(() => {
    if (!location) return [];

    // Filter shops by location and sort by distance (closest first)
    return nearbyMealsData.stalls
      .filter(
        (stall) =>
          stall.location_detail
            .toLowerCase()
            .includes(location.toLowerCase()) ||
          location.toLowerCase().includes("sunway")
      )
      .sort((a, b) => a.distance_m - b.distance_m)
      .slice(0, 10); // Show top 10 closest shops
  }, [location]);

  return (
    <div className="space-y-6 pb-20 bg-gradient-to-b from-green-50/30 to-white">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-green-600 rounded-xl shadow-lg">
            <Navigation className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
            Find Food Nearby
          </h1>
        </div>
        <p className="text-neutral-700 font-medium">
          Discover recommended shops and restaurants near your location
        </p>
      </div>

      {/* Location Search */}
      <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-white to-green-50/50">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-green-50/50 rounded-t-lg">
          <CardTitle className="text-primary font-bold text-lg">
            Enter Your Location
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1.5 bg-primary/10 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <Input
                type="text"
                placeholder="Enter location (e.g., Sunway Pyramid)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-14 h-12 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button
              type="button"
              size="lg"
              className="h-12 bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90 shadow-lg hover:shadow-xl transition-all"
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Shops */}
      {recommendedShops.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-neutral-800">
            Recommended Shops Near{" "}
            <span className="text-primary">{location}</span>
          </h2>

          <div className="space-y-6">
            {recommendedShops.map((shop) => (
              <Card
                key={shop.stall_id}
                className="overflow-hidden border-2 border-primary/10 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-white to-green-50/30"
              >
                <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 via-green-50/30 to-primary/5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-gradient-to-br from-primary to-green-600 rounded-xl shadow-md">
                          <Utensils className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl text-neutral-800 font-bold">
                            {shop.name}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full">
                              <MapPin className="h-4 w-4 text-blue-600" />
                              <span className="text-blue-700 font-medium">
                                {shop.location_detail}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 rounded-full">
                              <span className="text-orange-700 font-medium">
                                {shop.distance_m}m away
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 rounded-full">
                              <Clock className="h-4 w-4 text-purple-600" />
                              <span className="text-purple-700 font-medium">
                                {shop.operating_hours}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* Menu Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1 w-8 bg-gradient-to-r from-primary to-green-600 rounded-full"></div>
                      <h3 className="font-bold text-lg text-neutral-800">
                        Menu
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {shop.meals.map((meal) => (
                        <div
                          key={meal.meal_id}
                          className="border-2 border-primary/20 rounded-xl p-4 hover:shadow-lg hover:border-primary/40 transition-all bg-gradient-to-br from-white to-green-50/20 group"
                        >
                          <div className="flex gap-4">
                            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-green-100 flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow ring-2 ring-primary/10">
                              <img
                                src={meal.image}
                                alt={meal.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-base mb-2 line-clamp-1 text-neutral-800">
                                {meal.name}
                              </h4>
                              <p className="text-2xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent mb-2">
                                RM{meal.price.toFixed(2)}
                              </p>
                              <div className="flex items-center gap-2 text-xs mb-2">
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                                  {meal.calories} cal
                                </span>
                                {meal.ingredients.length > 0 && (
                                  <span className="text-neutral-500 line-clamp-1">
                                    {meal.ingredients.slice(0, 2).join(", ")}
                                    {meal.ingredients.length > 2 && "..."}
                                  </span>
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
                    <div className="mt-6 pt-6 border-t-2 border-primary/10">
                      <p className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        Popular Items:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {shop.popular_meals.map((meal, idx) => (
                          <Badge
                            key={idx}
                            className="text-xs px-3 py-1 bg-gradient-to-r from-primary/10 to-green-50 text-primary border border-primary/20 font-medium hover:from-primary/20 hover:to-green-100 transition-all"
                          >
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
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-white to-green-50/30">
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-gradient-to-br from-primary/10 to-green-100 rounded-2xl w-fit mx-auto mb-6">
              <Navigation className="h-16 w-16 text-primary mx-auto" />
            </div>
            <p className="text-lg font-bold text-neutral-800 mb-2">
              No shops found near{" "}
              <span className="text-primary">{location}</span>
            </p>
            <p className="text-neutral-600">
              Try searching for a different location
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
