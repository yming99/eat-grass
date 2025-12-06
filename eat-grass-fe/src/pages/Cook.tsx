import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, ChefHat, Clock, Users, Utensils, ShoppingCart, Filter } from 'lucide-react'
import MealCard from '@/components/MealCard'
import mealsData from '@/data/meals.json'
import ingredientsData from '@/data/ingredients.json'

export default function Cook() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDiet, setSelectedDiet] = useState('all')
  const [selectedTime, setSelectedTime] = useState('all')

  const categories = ['all', 'quick', 'budget-friendly', 'vegetarian', 'high-protein', 'chinese', 'western']
  const dietOptions = ['all', 'normal', 'vegetarian', 'high-protein']
  const timeOptions = [
    { value: 'all', label: 'All Times' },
    { value: '15', label: 'Under 15 min' },
    { value: '30', label: 'Under 30 min' },
    { value: '60', label: 'Under 1 hour' },
  ]

  // Filter meals based on search and filters
  const filteredMeals = mealsData.filter((meal) => {
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' ||
      meal.tags?.includes(selectedCategory)

    const matchesDiet = selectedDiet === 'all' ||
      (selectedDiet === 'vegetarian' && meal.tags?.includes('vegetarian')) ||
      (selectedDiet === 'high-protein' && meal.protein && meal.protein >= 25) ||
      (selectedDiet === 'normal' && !meal.tags?.includes('vegetarian'))

    const totalTime = (meal.prepTime || 0) + (meal.cookTime || 0)
    const matchesTime = selectedTime === 'all' ||
      (selectedTime === '15' && totalTime <= 15) ||
      (selectedTime === '30' && totalTime <= 30) ||
      (selectedTime === '60' && totalTime <= 60)

    return matchesSearch && matchesCategory && matchesDiet && matchesTime
  })

  // Get ingredient suggestions based on search
  const ingredientSuggestions = ingredientsData
    .filter(ing => 
      ing.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      searchQuery.length > 0
    )
    .slice(0, 5)

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Cook at Home</h1>
        </div>
        <p className="text-neutral-600">
          Discover recipes, find ingredients, and plan your home-cooked meals
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search recipes or ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Category
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Diet Type</label>
                <Select value={selectedDiet} onValueChange={setSelectedDiet}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dietOptions.map((diet) => (
                      <SelectItem key={diet} value={diet}>
                        {diet === 'all' ? 'All Diets' : diet.charAt(0).toUpperCase() + diet.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Prep Time</label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredient Suggestions */}
      {ingredientSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ingredient Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ingredientSuggestions.map((ing) => (
                <Badge key={ing.id} variant="outline" className="px-3 py-1.5">
                  <ShoppingCart className="h-3 w-3 mr-1.5" />
                  {ing.name} - RM{ing.price.toFixed(2)}/{ing.unit}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/planner">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Utensils className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Meal Planner</h3>
                  <p className="text-sm text-neutral-600">Create a personalized meal plan</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Grocery List</h3>
                <p className="text-sm text-neutral-600">View your shopping list</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recipes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Recipes ({filteredMeals.length})
          </h2>
        </div>

        {filteredMeals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ChefHat className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">No recipes found</p>
              <p className="text-neutral-600">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMeals.map((meal) => (
              <Card key={meal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link to={`/meal/${meal.id}`}>
                  <div className="relative h-48 bg-neutral-100">
                    <img
                      src={meal.image}
                      alt={meal.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      {meal.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{meal.name}</CardTitle>
                    {meal.description && (
                      <p className="text-sm text-neutral-600 line-clamp-2">
                        {meal.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{(meal.prepTime || 0) + (meal.cookTime || 0)}m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{meal.servings} servings</span>
                      </div>
                      {meal.protein && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{meal.protein}g protein</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

