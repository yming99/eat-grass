import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, ChefHat, Trophy, RotateCcw } from 'lucide-react'
import cookingChallengesData from '@/data/cooking-challenges.json'

interface Ingredient {
  name: string
  quantity: string
  unit?: string
}

interface Option {
  id: string
  ingredients: Ingredient[]
  correct: boolean
}

interface CookingChallenge {
  id: string
  dish: string
  description: string
  requiredIngredients: Ingredient[]
  options: Option[]
}

export default function ReceiptVerification() {
  const [currentChallenge, setCurrentChallenge] = useState<CookingChallenge | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [level, setLevel] = useState(1)

  // Load challenge on mount
  useEffect(() => {
    loadNewChallenge()
  }, [])

  const loadNewChallenge = () => {
    // Get random challenge
    const randomIndex = Math.floor(Math.random() * cookingChallengesData.length)
    const challenge = cookingChallengesData[randomIndex] as CookingChallenge
    setCurrentChallenge(challenge)
    setSelectedOption(null)
    setShowResult(false)
  }

  const handleSelectOption = (optionId: string) => {
    if (showResult) return

    setSelectedOption(optionId)
    const option = currentChallenge?.options.find((opt) => opt.id === optionId)
    
    if (option) {
      setShowResult(true)
      
      if (option.correct) {
        setScore((prev) => ({
          correct: prev.correct + 1,
          total: prev.total + 1,
        }))
        // Move to next level if correct
        if (level < 30) {
          setTimeout(() => {
            setLevel(level + 1)
            loadNewChallenge()
          }, 2000)
        }
      } else {
        setScore((prev) => ({
          ...prev,
          total: prev.total + 1,
        }))
      }
    }
  }

  const getCorrectOption = () => {
    return currentChallenge?.options.find((opt) => opt.correct)
  }

  const isCorrect = (optionId: string) => {
    const option = currentChallenge?.options.find((opt) => opt.id === optionId)
    return option?.correct || false
  }

  return (
    <div className="space-y-6 pb-20 bg-gradient-to-b from-green-50/30 to-white">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-green-600 rounded-xl shadow-lg">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
            Cooking Ingredient Challenge
          </h1>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-neutral-700 font-medium">
            Select the correct ingredients and quantities needed for the recipe
          </p>
          <Badge className="bg-primary text-white px-3 py-1">
            Level {level}/30
          </Badge>
        </div>
      </div>

      {/* Score Card */}
      <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-white to-green-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{score.correct}</p>
                <p className="text-xs text-neutral-600">Correct</p>
              </div>
              <div className="h-12 w-px bg-neutral-300"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-neutral-700">{score.total}</p>
                <p className="text-xs text-neutral-600">Total</p>
              </div>
            </div>
            <Button
              onClick={loadNewChallenge}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              New Challenge
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question/Challenge Card */}
      {currentChallenge && (
        <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-50/50 rounded-t-lg">
            <CardTitle className="text-primary font-bold flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              {currentChallenge.dish}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-lg font-semibold text-neutral-800 mb-4">
              {currentChallenge.description}
            </p>
            <div className="space-y-3">
              {currentChallenge.requiredIngredients.map((ingredient, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-primary/10 shadow-sm"
                >
                  <span className="font-medium text-neutral-800">{ingredient.name}</span>
                  <span className="font-bold text-primary text-lg">
                    {ingredient.quantity}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ingredient Options Grid */}
      {currentChallenge && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-neutral-800">Select the Correct Ingredients:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentChallenge.options.map((option) => {
              const isSelected = selectedOption === option.id
              const isCorrectOption = option.correct
              const showFeedback = showResult && isSelected

              return (
                <Card
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  className={`
                    cursor-pointer transition-all duration-300 overflow-hidden
                    ${isSelected && showResult
                      ? isCorrectOption
                        ? 'border-4 border-green-500 bg-green-50 shadow-xl scale-105'
                        : 'border-4 border-red-500 bg-red-50 shadow-xl scale-105'
                      : 'border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg'
                    }
                    ${!showResult && 'hover:scale-102'}
                    bg-gradient-to-br from-white to-green-50/20
                  `}
                >
                  <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-green-50/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-neutral-800">
                        Option {option.id.split('-')[1]}
                      </CardTitle>
                      {showFeedback && (
                        <div className="flex-shrink-0">
                          {isCorrectOption ? (
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                          ) : (
                            <XCircle className="h-8 w-8 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="space-y-2">
                      {option.ingredients.map((ingredient, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm py-1.5 px-2 bg-white/50 rounded"
                        >
                          <span className="text-neutral-700">{ingredient.name}</span>
                          <span className="font-semibold text-neutral-800">
                            {ingredient.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                    {showFeedback && (
                      <div className="pt-3 mt-3 border-t-2 border-primary/10">
                        {isCorrectOption ? (
                          <div className="flex items-center justify-center gap-2 p-2 bg-green-100 rounded-lg">
                            <Trophy className="h-5 w-5 text-green-600" />
                            <span className="font-bold text-green-700">Correct! Well done!</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 p-2 bg-red-100 rounded-lg">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <span className="font-bold text-red-700">Incorrect. Try again!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Show Correct Option if Wrong Selection */}
      {showResult && selectedOption && !isCorrect(selectedOption) && getCorrectOption() && (
        <Card className="border-4 border-green-500 bg-green-50 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-100/50">
            <CardTitle className="text-green-700 font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              The Correct Ingredients:
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {getCorrectOption()!.ingredients.map((ingredient, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm py-1.5 px-2 bg-white rounded"
                >
                  <span className="text-neutral-700">{ingredient.name}</span>
                  <span className="font-semibold text-neutral-800">
                    {ingredient.quantity}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Challenge Button */}
      {showResult && selectedOption && isCorrect(selectedOption) && level < 30 && (
        <div className="text-center">
          <p className="text-sm text-neutral-600 mb-2">Moving to next level...</p>
        </div>
      )}

      {/* Game Complete */}
      {level >= 30 && (
        <Card className="border-4 border-primary bg-gradient-to-br from-primary/10 to-green-50 shadow-xl">
          <CardContent className="p-8 text-center">
            <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-primary mb-2">Congratulations!</h2>
            <p className="text-lg text-neutral-700 mb-4">
              You've completed all 30 levels!
            </p>
            <Button
              onClick={() => {
                setLevel(1)
                setScore({ correct: 0, total: 0 })
                loadNewChallenge()
              }}
              className="bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90"
            >
              Play Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

