import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChefHat, Navigation, Utensils, Trophy } from 'lucide-react'

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 -left-20 w-64 h-64 bg-[#DDEB9D] rounded-full opacity-40 blur-3xl"></div>
        <div className="absolute top-40 right-10 w-48 h-48 bg-[#DDEB9D] rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-56 h-56 bg-[#DDEB9D] rounded-full opacity-35 blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <section className="py-12 md:py-20 relative">
        <div className="max-w-[620px]">
          <h1 className="text-[32px] md:text-[48px] font-bold mb-4 md:mb-6 leading-tight">
            Plan Your Meals, Save Your Budget
          </h1>
          <p className="text-xl font-medium text-neutral-700 mb-6 md:mb-8">
            Discover delicious, budget-friendly meal plans tailored to your preferences and dietary needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              className="rounded-full bg-primary hover:bg-primary/90 text-white px-8 py-6 text-base md:text-lg font-semibold"
            >
              <Link to="/planner">Start Planning</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 md:py-12">
        <h2 className="text-2xl font-bold mb-6">Get Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cook at Home */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link to="/cook">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <ChefHat className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Cook at Home</h3>
                    <p className="text-neutral-600 mb-4">
                      Browse recipes, find ingredients, and plan your home-cooked meals
                    </p>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Explore Recipes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Find Food Nearby */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link to="/find-food-nearby">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Navigation className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Find Food Nearby</h3>
                    <p className="text-neutral-600 mb-4">
                      Discover restaurants, takeout options, and grocery stores near you
                    </p>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Find Nearby
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Grocery Price Game */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link to="/grocery-game">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Price Guessing Game</h3>
                    <p className="text-neutral-600 mb-4">
                      Test your knowledge! Guess prices at Lotus vs AEON and earn XP
                    </p>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Play Game
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  )
}

