import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Gift, TrendingUp, CheckCircle2, XCircle } from 'lucide-react'
import groceryData from '@/data/grocery-game.json'
import GroceryItemDisplay from '@/components/three/GroceryItemDisplay'

interface GroceryItem {
  id: string
  name: string
  image: string
  lotus_price: number
  aeon_price: number
  category: string
}

interface GameState {
  currentItem: GroceryItem | null
  currentIndex: number
  totalXP: number
  gamesPlayed: number
  correctGuesses: number
  badges: string[]
  tier: number
}

interface GuessResult {
  minGuess: number
  maxGuess: number
  actualPrice: number
  isCorrect: boolean
  xpEarned: number
}

const TIERS = [
  { level: 1, name: 'Beginner', xpRequired: 0, range: 5 },
  { level: 2, name: 'Smart Shopper', xpRequired: 50, range: 4 },
  { level: 3, name: 'Price Master', xpRequired: 150, range: 3 },
  { level: 4, name: 'Deal Hunter', xpRequired: 300, range: 2 },
  { level: 5, name: 'Budget Expert', xpRequired: 500, range: 1 },
]

const PRIZE_IMAGES = [
  '/prizes1.png',
  '/prizes2.png',
  '/prizes3.png',
  '/prizes4.png',
  '/prizes5.png',
]

export default function GroceryGame() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('grocery-game-state')
    if (saved) {
      return JSON.parse(saved)
    }
    return {
      currentItem: null,
      currentIndex: 0,
      totalXP: 0,
      gamesPlayed: 0,
      correctGuesses: 0,
      badges: [],
      tier: 1,
    }
  })

  const [minGuess, setMinGuess] = useState('')
  const [maxGuess, setMaxGuess] = useState('')
  const [result, setResult] = useState<GuessResult | null>(null)
  const [showResult, setShowResult] = useState(false)

  // Calculate current tier based on XP
  const currentTier = TIERS.reduce((prev, tier) => {
    return gameState.totalXP >= tier.xpRequired ? tier : prev
  }, TIERS[0])

  // Load next item on mount or when needed
  useEffect(() => {
    if (!gameState.currentItem && groceryData.length > 0) {
      loadNextItem()
    }
  }, [])

  // Save game state to localStorage
  useEffect(() => {
    localStorage.setItem('grocery-game-state', JSON.stringify(gameState))
  }, [gameState])

  const loadNextItem = () => {
    const randomIndex = Math.floor(Math.random() * groceryData.length)
    const item = groceryData[randomIndex] as GroceryItem
    setGameState((prev) => ({
      ...prev,
      currentItem: item,
      currentIndex: randomIndex,
    }))
    setMinGuess('')
    setMaxGuess('')
    setResult(null)
    setShowResult(false)
  }

  const handleSubmit = () => {
    if (!gameState.currentItem) return

    const minGuessNum = parseFloat(minGuess)
    const maxGuessNum = parseFloat(maxGuess)

    if (isNaN(minGuessNum) || isNaN(maxGuessNum)) {
      alert('Please enter valid price range')
      return
    }

    if (minGuessNum >= maxGuessNum) {
      alert('Minimum price must be less than maximum price')
      return
    }

    const actualPrice = gameState.currentItem.lotus_price
    const isCorrect = actualPrice >= minGuessNum && actualPrice <= maxGuessNum

    // Calculate XP based on tier and accuracy
    let xpEarned = 0
    if (isCorrect) {
      // Base XP for correct guess, more XP for smaller range
      const rangeSize = maxGuessNum - minGuessNum
      const rangePercentage = (rangeSize / actualPrice) * 100
      
      if (rangePercentage <= currentTier.range) {
        xpEarned = 50 // Perfect range
      } else if (rangePercentage <= currentTier.range * 1.5) {
        xpEarned = 30 // Good range
      } else {
        xpEarned = 20 // Correct but wide range
      }
    } else {
      // Small XP for trying
      xpEarned = 5
    }

    const guessResult: GuessResult = {
      minGuess: minGuessNum,
      maxGuess: maxGuessNum,
      actualPrice,
      isCorrect,
      xpEarned,
    }

    setResult(guessResult)
    setShowResult(true)

    // Update game state
    const newTotalXP = gameState.totalXP + xpEarned
    const newGamesPlayed = gameState.gamesPlayed + 1
    const newCorrectGuesses = gameState.correctGuesses + (isCorrect ? 1 : 0)

    // Calculate new tier
    const newTier = TIERS.reduce((prev, tier) => {
      return newTotalXP >= tier.xpRequired ? tier : prev
    }, TIERS[0])

    // Check for new badges (tier changes)
    const newBadges = [...gameState.badges]
    if (newTier.level > gameState.tier && !newBadges.includes(newTier.name)) {
      newBadges.push(newTier.name)
    }

    setGameState({
      ...gameState,
      totalXP: newTotalXP,
      gamesPlayed: newGamesPlayed,
      correctGuesses: newCorrectGuesses,
      badges: newBadges,
      tier: newTier.level,
    })
  }

  const getNextTier = () => {
    return TIERS.find((tier) => tier.xpRequired > gameState.totalXP) || TIERS[TIERS.length - 1]
  }

  const getProgressPercentage = () => {
    const nextTier = getNextTier()
    const previousTier = TIERS.find((t) => t.xpRequired < nextTier.xpRequired)
    const startXP = previousTier?.xpRequired || 0
    const endXP = nextTier.xpRequired
    const progress = endXP > 0 ? ((gameState.totalXP - startXP) / (endXP - startXP)) * 100 : 100
    return Math.min(100, Math.max(0, progress))
  }

  const getPrizeImage = (tier: number) => {
    const index = Math.min(tier - 1, PRIZE_IMAGES.length - 1)
    return PRIZE_IMAGES[index]
  }

  return (
    <div className="space-y-6 pb-20 bg-gradient-to-b from-green-50/30 to-white">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-green-600 rounded-xl shadow-lg">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
            Grocery Price Guessing Game
          </h1>
        </div>
        <p className="text-neutral-700 font-medium">
          How much do you think this item costs at Lotus vs AEON?
        </p>
      </div>

      {/* XP Progress & Stats */}
      <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-white to-green-50/50">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-green-50/50 rounded-t-lg">
          <CardTitle className="text-primary font-bold">Your Progress</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* Current Tier & Prize */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-center">
                  <p className="text-xs text-neutral-600 mb-1">Current Tier</p>
                  <p className="text-2xl font-bold text-primary">{currentTier.name}</p>
                  <p className="text-xs text-neutral-500">Level {currentTier.level}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-neutral-600 mb-1">Target Range</p>
                  <p className="text-lg font-semibold text-neutral-800">±{currentTier.range}%</p>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <img
                src={getPrizeImage(currentTier.level)}
                alt={`Prize Tier ${currentTier.level}`}
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          </div>

          {/* XP Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-700">
                Total XP: <span className="text-primary">{gameState.totalXP}</span>
              </span>
              <span className="text-sm text-neutral-600">
                Next Tier: {getNextTier().name} ({getNextTier().xpRequired} XP)
              </span>
            </div>
            <div className="w-full h-4 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-green-600 transition-all duration-500 rounded-full"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{gameState.gamesPlayed}</p>
              <p className="text-xs text-blue-700 font-medium">Games Played</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{gameState.correctGuesses}</p>
              <p className="text-xs text-green-700 font-medium">Correct Guesses</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{gameState.badges.length}</p>
              <p className="text-xs text-purple-700 font-medium">Badges</p>
            </div>
          </div>

          {/* Badges */}
          {gameState.badges.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm font-bold text-neutral-700 mb-3">Your Badges:</p>
              <div className="flex flex-wrap gap-2 justify-start">
                {gameState.badges.map((badge, idx) => {
                  const tier = TIERS.find((t) => t.name === badge)
                  const badgeImagePath = tier ? `/badges${tier.level}.png` : '/badges1.png'
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <img
                        src={badgeImagePath}
                        alt={badge}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          // Fallback to badge component if image doesn't exist
                          e.currentTarget.style.display = 'none'
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                      <Badge
                        className="px-3 py-1.5 bg-gradient-to-r from-primary/10 to-green-50 text-primary border border-primary/20 font-medium text-xs hidden"
                      >
                        {badge}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game Card */}
      {gameState.currentItem && (
        <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-white to-green-50/30">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-green-50/50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-primary font-bold">Guess the Price</CardTitle>
              <Badge variant="outline" className="text-xs">
                {gameState.currentItem.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Item Display */}
            <div className="text-center space-y-4">
              <GroceryItemDisplay
                imageUrl={gameState.currentItem.image}
                itemName={gameState.currentItem.name}
              />
              <h2 className="text-2xl font-bold text-neutral-800">
                {gameState.currentItem.name}
              </h2>
            </div>

            {/* Guess Inputs */}
            {!showResult && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <p className="text-sm font-semibold text-blue-700 mb-3 text-center">
                    Guess the price range at Lotus (RM)
                  </p>
                  <p className="text-xs text-blue-600 mb-4 text-center">
                    Target range: ±{currentTier.range}% for maximum XP
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-neutral-700">
                        Minimum Price
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={minGuess}
                        onChange={(e) => setMinGuess(e.target.value)}
                        className="h-12 text-lg font-semibold border-2 border-primary/20 focus:border-primary"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-neutral-700">
                        Maximum Price
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={maxGuess}
                        onChange={(e) => setMaxGuess(e.target.value)}
                        className="h-12 text-lg font-semibold border-2 border-primary/20 focus:border-primary"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleSubmit}
                  className="w-full h-12 bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90 shadow-lg text-lg font-bold"
                >
                  Submit Guess
                </Button>
              </div>
            )}

            {/* Results */}
            {showResult && result && (
              <div className="space-y-4 pt-4 border-t-2 border-primary/10">
                <h3 className="text-xl font-bold text-center text-neutral-800 mb-4">
                  Results
                </h3>
                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-blue-700">Lotus Price</h4>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-blue-600">+{result.xpEarned} XP</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Your Range:</span>
                      <span className="font-semibold">RM{result.minGuess.toFixed(2)} - RM{result.maxGuess.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Actual Price:</span>
                      <span className="font-bold text-blue-600 text-lg">RM{result.actualPrice.toFixed(2)}</span>
                    </div>
                    <div className="pt-3 border-t border-blue-200">
                      <div className="flex items-center justify-center gap-2">
                        {result.isCorrect ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="font-bold text-green-600">Correct! Price is within your range</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-600" />
                            <span className="font-bold text-red-600">
                              Price is outside your range
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total XP Earned */}
                <div className="p-4 bg-gradient-to-r from-primary/10 to-green-50 rounded-xl border-2 border-primary/20 text-center">
                  <p className="text-sm text-neutral-600 mb-1">XP Earned This Round</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
                    +{result.xpEarned} XP
                  </p>
                </div>

                {/* Next Item Button */}
                <Button
                  onClick={loadNextItem}
                  className="w-full h-12 bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90 shadow-lg text-lg font-bold"
                >
                  Try Another Item
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

