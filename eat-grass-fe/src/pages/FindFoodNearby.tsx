import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MapPin, 
  Clock, 
  Navigation, 
  Search, 
  Utensils, 
  Star, 
  Phone, 
  Globe, 
  Loader2,
  AlertCircle,
  DollarSign,
  ExternalLink,
  Wallet,
  Filter
} from "lucide-react";
import { searchNearbyRestaurants, type NearbyRestaurant } from "@/services/api";

/**
 * Budget range options with corresponding price levels
 */
const BUDGET_OPTIONS = [
  { value: "any", label: "Any Budget", maxPriceLevel: 4, description: "Show all restaurants" },
  { value: "budget", label: "Budget-Friendly ($)", maxPriceLevel: 1, description: "Under RM 15 per meal" },
  { value: "moderate", label: "Moderate ($$)", maxPriceLevel: 2, description: "RM 15 - 40 per meal" },
  { value: "upscale", label: "Upscale ($$$)", maxPriceLevel: 3, description: "RM 40 - 80 per meal" },
  { value: "fine", label: "Fine Dining ($$$$)", maxPriceLevel: 4, description: "RM 80+ per meal" },
];

/**
 * Find Food Nearby Page
 * 
 * Allows users to search for nearby restaurants using Google Places.
 * Users can optionally filter by budget/price level.
 * Uses Apify's compass/crawler-google-places to scrape real restaurant data.
 */
export default function FindFoodNearby() {
  // Search location input
  const [location, setLocation] = useState("");
  
  // Budget filter (optional)
  const [budget, setBudget] = useState("any");
  
  // Search results (unfiltered from API)
  const [allRestaurants, setAllRestaurants] = useState<NearbyRestaurant[]>([]);
  
  // Loading state
  const [isSearching, setIsSearching] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Whether a search has been performed
  const [hasSearched, setHasSearched] = useState(false);

  /**
   * Filter restaurants based on selected budget
   */
  const filteredRestaurants = useMemo(() => {
    if (budget === "any") {
      return allRestaurants;
    }

    const selectedBudget = BUDGET_OPTIONS.find(b => b.value === budget);
    if (!selectedBudget) return allRestaurants;

    return allRestaurants.filter(restaurant => {
      // If restaurant has no price level, include it (we don't know the price)
      if (restaurant.priceLevel === null) return true;
      
      // Filter based on budget selection
      if (budget === "budget") {
        return restaurant.priceLevel <= 1;
      } else if (budget === "moderate") {
        return restaurant.priceLevel <= 2;
      } else if (budget === "upscale") {
        return restaurant.priceLevel <= 3;
      } else if (budget === "fine") {
        return restaurant.priceLevel === 4;
      }
      
      return true;
    });
  }, [allRestaurants, budget]);

  /**
   * Handle search form submission
   */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location.trim()) {
      setError("Please enter a location to search");
      return;
    }

    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await searchNearbyRestaurants(location, {
        maxResults: 20,
        searchType: "restaurant"
      });
      
      setAllRestaurants(results.restaurants);
    } catch (err) {
      console.error("Search failed:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Failed to search for restaurants. Please try again."
      );
      setAllRestaurants([]);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Get budget label for display
   */
  const getBudgetLabel = () => {
    const selected = BUDGET_OPTIONS.find(b => b.value === budget);
    return selected?.label || "Any Budget";
  };

  /**
   * Render price level as dollar signs
   */
  const renderPriceLevel = (level: number | null) => {
    if (!level) return null;
    return (
      <span className="text-green-600 font-medium">
        {"$".repeat(level)}
        <span className="text-neutral-300">{"$".repeat(4 - level)}</span>
      </span>
    );
  };

  /**
   * Render star rating
   */
  const renderRating = (rating: number | null, reviewCount: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1.5">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="font-semibold">{rating.toFixed(1)}</span>
        {reviewCount > 0 && (
          <span className="text-neutral-500 text-sm">({reviewCount})</span>
        )}
      </div>
    );
  };

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
          Discover restaurants near your location using Google Places
        </p>
      </div>

      {/* Search Form */}
      <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-white to-green-50/50">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-green-50/50 rounded-t-lg">
          <CardTitle className="text-primary font-bold text-lg">
            Search Restaurants
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Location Input */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2 font-semibold">
                <MapPin className="h-4 w-4 text-primary" />
                Location
              </Label>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter location (e.g., Sunway Pyramid, Kuala Lumpur)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-12 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    disabled={isSearching}
                  />
                </div>
              </div>
            </div>

            {/* Budget Filter (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="budget" className="flex items-center gap-2 font-semibold">
                <Wallet className="h-4 w-4 text-primary" />
                Budget (Optional)
              </Label>
              <Select
                value={budget}
                onValueChange={setBudget}
                disabled={isSearching}
              >
                <SelectTrigger id="budget" className="h-12 border-2 border-primary/20">
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-neutral-500">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500">
                Filter restaurants by price range to match your budget
              </p>
            </div>

            {/* Search Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full h-12 bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90 shadow-lg hover:shadow-xl transition-all"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Restaurants
                </>
              )}
            </Button>
          </form>
          
          <p className="text-xs text-neutral-500 text-center">
            Powered by Google Places • Enter an address, landmark, or area name
          </p>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Search Failed</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isSearching && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-white to-green-50/30">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin mb-4" />
            <p className="text-lg font-bold text-neutral-800 mb-2">
              Searching for restaurants...
            </p>
            <p className="text-neutral-600">
              This may take a moment while we fetch data from Google Places
            </p>
          </CardContent>
        </Card>
      )}

      {/* Restaurant Results */}
      {!isSearching && filteredRestaurants.length > 0 && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-neutral-800">
              Restaurants Near{" "}
              <span className="text-primary">{location}</span>
            </h2>
            <div className="flex items-center gap-3">
              {/* Budget Filter Badge */}
              {budget !== "any" && (
                <Badge className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  {getBudgetLabel()}
                </Badge>
              )}
              <Badge variant="secondary" className="text-sm">
                {filteredRestaurants.length} of {allRestaurants.length} shown
              </Badge>
            </div>
          </div>

          {/* Budget Filter Notice */}
          {budget !== "any" && filteredRestaurants.length < allRestaurants.length && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <Wallet className="h-4 w-4 text-amber-600" />
              <span className="text-amber-800">
                Showing {filteredRestaurants.length} restaurants matching your budget. 
                <button 
                  onClick={() => setBudget("any")}
                  className="ml-1 text-primary font-medium hover:underline"
                >
                  Show all {allRestaurants.length}
                </button>
              </span>
            </div>
          )}

          <div className="space-y-6">
            {filteredRestaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="overflow-hidden border-2 border-primary/10 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-white to-green-50/30"
              >
                <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 via-green-50/30 to-primary/5">
                  <div className="flex items-start gap-4">
                    {/* Restaurant Image */}
                    {restaurant.mainImage && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 shadow-md">
                        <img
                          src={restaurant.mainImage}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Restaurant Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-xl text-neutral-800 font-bold line-clamp-1">
                            {restaurant.name}
                          </CardTitle>
                          
                          {/* Rating and Price */}
                          <div className="flex items-center gap-4 mt-2">
                            {renderRating(restaurant.rating, restaurant.reviewCount)}
                            {restaurant.priceLevel && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                {renderPriceLevel(restaurant.priceLevel)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Open Status */}
                        {restaurant.isOpen !== null && (
                          <Badge 
                            className={restaurant.isOpen 
                              ? "bg-green-100 text-green-700 border-green-200" 
                              : "bg-red-100 text-red-700 border-red-200"
                            }
                          >
                            {restaurant.isOpen ? "Open" : "Closed"}
                          </Badge>
                        )}
                      </div>

                      {/* Categories */}
                      {restaurant.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {restaurant.categories.slice(0, 3).map((cat, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="text-xs bg-white/50"
                            >
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {/* Address */}
                  {restaurant.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">{restaurant.address}</span>
                    </div>
                  )}

                  {/* Operating Hours */}
                  {restaurant.operatingHours && restaurant.operatingHours.length > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <Clock className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div className="text-neutral-700">
                        {restaurant.operatingHours.slice(0, 2).map((h, idx) => (
                          <div key={idx}>
                            <span className="font-medium">{h.day}:</span> {h.hours}
                          </div>
                        ))}
                        {restaurant.operatingHours.length > 2 && (
                          <span className="text-neutral-500">
                            +{restaurant.operatingHours.length - 2} more days
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4">
                    {restaurant.phone && (
                      <a 
                        href={`tel:${restaurant.phone}`}
                        className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {restaurant.phone}
                      </a>
                    )}
                    {restaurant.website && (
                      <a 
                        href={restaurant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                    {restaurant.url && (
                      <a 
                        href={restaurant.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View on Google
                      </a>
                    )}
                  </div>

                  {/* Reviews Preview */}
                  {restaurant.reviews.length > 0 && (
                    <div className="pt-4 border-t border-primary/10">
                      <p className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Recent Reviews
                      </p>
                      <div className="space-y-3">
                        {restaurant.reviews.slice(0, 2).map((review, idx) => (
                          <div 
                            key={idx} 
                            className="bg-neutral-50 rounded-lg p-3 text-sm"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{review.author}</span>
                              {review.rating && (
                                <div className="flex items-center gap-0.5">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs">{review.rating}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-neutral-600 line-clamp-2">{review.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gallery */}
                  {restaurant.images.length > 1 && (
                    <div className="pt-4 border-t border-primary/10">
                      <p className="text-sm font-bold text-neutral-700 mb-3">
                        Photos
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {restaurant.images.slice(0, 5).map((img, idx) => (
                          <div 
                            key={idx}
                            className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100"
                          >
                            <img
                              src={img}
                              alt={`${restaurant.name} photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
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

      {/* Empty State - No Results After Filter */}
      {!isSearching && hasSearched && allRestaurants.length > 0 && filteredRestaurants.length === 0 && (
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-amber-100 rounded-2xl w-fit mx-auto mb-4">
              <Wallet className="h-12 w-12 text-amber-600 mx-auto" />
            </div>
            <p className="text-lg font-bold text-amber-800 mb-2">
              No restaurants match your budget
            </p>
            <p className="text-amber-700 mb-4">
              Found {allRestaurants.length} restaurants, but none match "{getBudgetLabel()}"
            </p>
            <Button 
              variant="outline" 
              onClick={() => setBudget("any")}
              className="border-amber-300 text-amber-800 hover:bg-amber-100"
            >
              Show All Restaurants
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State - No Results */}
      {!isSearching && hasSearched && allRestaurants.length === 0 && !error && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-white to-green-50/30">
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-gradient-to-br from-primary/10 to-green-100 rounded-2xl w-fit mx-auto mb-6">
              <Utensils className="h-16 w-16 text-primary mx-auto" />
            </div>
            <p className="text-lg font-bold text-neutral-800 mb-2">
              No restaurants found near{" "}
              <span className="text-primary">{location}</span>
            </p>
            <p className="text-neutral-600">
              Try searching for a different location or be more specific
            </p>
          </CardContent>
        </Card>
      )}

      {/* Initial State - No Search Yet */}
      {!isSearching && !hasSearched && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-white to-green-50/30">
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-gradient-to-br from-primary/10 to-green-100 rounded-2xl w-fit mx-auto mb-6">
              <Navigation className="h-16 w-16 text-primary mx-auto" />
            </div>
            <p className="text-lg font-bold text-neutral-800 mb-2">
              Enter a location to find nearby restaurants
            </p>
            <p className="text-neutral-600">
              Search by address, landmark, or area name
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
