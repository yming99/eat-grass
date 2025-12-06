import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Receipt, Trophy, RotateCcw } from 'lucide-react'
import receiptsData from '@/data/receipts.json'

interface ReceiptItem {
  name: string
  price: number
  qty: number
}

interface Receipt {
  id: string
  store: string
  date: string
  time: string
  total: number
  items: ReceiptItem[]
  correct: boolean
}

export default function ReceiptVerification() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [gameComplete, setGameComplete] = useState(false)

  // Load receipts on mount
  useEffect(() => {
    loadNewRound()
  }, [])

  const loadNewRound = () => {
    // Shuffle receipts and take 4
    const shuffled = [...receiptsData].sort(() => Math.random() - 0.5)
    setReceipts(shuffled.slice(0, 4) as Receipt[])
    setSelectedReceipt(null)
    setShowResult(false)
    setGameComplete(false)
  }

  const handleSelectReceipt = (receiptId: string) => {
    if (showResult) return

    setSelectedReceipt(receiptId)
    const receipt = receipts.find((r) => r.id === receiptId)
    
    if (receipt) {
      setShowResult(true)
      setGameComplete(true)
      
      if (receipt.correct) {
        setScore((prev) => ({
          correct: prev.correct + 1,
          total: prev.total + 1,
        }))
      } else {
        setScore((prev) => ({
          ...prev,
          total: prev.total + 1,
        }))
      }
    }
  }

  const getCorrectReceipt = () => {
    return receipts.find((r) => r.correct)
  }

  const isCorrect = (receiptId: string) => {
    const receipt = receipts.find((r) => r.id === receiptId)
    return receipt?.correct || false
  }

  return (
    <div className="space-y-6 pb-20 bg-gradient-to-b from-green-50/30 to-white">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-green-600 rounded-xl shadow-lg">
            <Receipt className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
            Receipt Verification
          </h1>
        </div>
        <p className="text-neutral-700 font-medium">
          Click on the correct receipt that matches the items shown
        </p>
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
              onClick={loadNewRound}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              New Round
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question/Challenge Card */}
      {receipts.length > 0 && getCorrectReceipt() && (
        <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-50/50 rounded-t-lg">
            <CardTitle className="text-primary font-bold flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Which receipt matches these items?
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {getCorrectReceipt()!.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-primary/10 shadow-sm"
                >
                  <span className="font-medium text-neutral-800">{item.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-neutral-600">Qty: {item.qty}</span>
                    <span className="font-bold text-primary">RM{item.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t-2 border-primary/20 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-neutral-800">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    RM{getCorrectReceipt()!.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Receipt Options Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-800">Select the Correct Receipt:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {receipts.map((receipt) => {
            const isSelected = selectedReceipt === receipt.id
            const isCorrectReceipt = receipt.correct
            const showFeedback = showResult && isSelected

            return (
              <Card
                key={receipt.id}
                onClick={() => handleSelectReceipt(receipt.id)}
                className={`
                  cursor-pointer transition-all duration-300 overflow-hidden
                  ${isSelected && showResult
                    ? isCorrectReceipt
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
                    <div>
                      <CardTitle className="text-lg font-bold text-neutral-800">
                        {receipt.store}
                      </CardTitle>
                      <p className="text-xs text-neutral-600 mt-1">
                        {receipt.date} • {receipt.time}
                      </p>
                    </div>
                    {showFeedback && (
                      <div className="flex-shrink-0">
                        {isCorrectReceipt ? (
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
                    {receipt.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm py-1.5 px-2 bg-white/50 rounded"
                      >
                        <span className="text-neutral-700">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-neutral-500">x{item.qty}</span>
                          <span className="font-semibold text-neutral-800">
                            RM{item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t-2 border-primary/10">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-800">Total:</span>
                      <span className="text-xl font-bold text-primary">
                        RM{receipt.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {showFeedback && (
                    <div className="pt-3 mt-3 border-t-2 border-primary/10">
                      {isCorrectReceipt ? (
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

      {/* Show Correct Receipt if Wrong Selection */}
      {showResult && selectedReceipt && !isCorrect(selectedReceipt) && getCorrectReceipt() && (
        <Card className="border-4 border-green-500 bg-green-50 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-100/50">
            <CardTitle className="text-green-700 font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              The Correct Receipt:
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {getCorrectReceipt()!.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm py-1.5 px-2 bg-white rounded"
                >
                  <span className="text-neutral-700">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500">x{item.qty}</span>
                    <span className="font-semibold text-neutral-800">
                      RM{item.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t-2 border-green-200 mt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-800">Total:</span>
                  <span className="text-xl font-bold text-green-600">
                    RM{getCorrectReceipt()!.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

