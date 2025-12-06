import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

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
          <Button
            asChild
            className="w-full md:w-auto rounded-full bg-primary hover:bg-primary/90 text-white px-8 py-6 text-base md:text-lg font-semibold"
          >
            <Link to="/planner">Start Planning</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

