/**
 * Price Comparison Modal Component
 * 
 * Displays a modal comparing ingredient prices across different stores.
 * Features:
 * - Highlights cheapest price in green
 * - Closes on outside click or ESC key (handled by Dialog)
 * - Add to shopping list functionality
 * 
 * Usage example:
 * ```tsx
 * const [modalOpen, setModalOpen] = useState(false)
 * 
 * <PriceComparisonModal
 *   open={modalOpen}
 *   onOpenChange={setModalOpen}
 *   ingredientName="Salmon"
 *   storePrices={[
 *     { store: "Lotus", price: 5.50 },
 *     { store: "AEON", price: 6.20 },
 *     { store: "Tesco", price: 5.80 }
 *   ]}
 *   onAddToShoppingList={(store, price) => {
 *     console.log(`Added ${store} at RM${price}`)
 *   }}
 * />
 * ```
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'

interface StorePrice {
  store: string
  price: number
}

interface PriceComparisonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ingredientName: string
  storePrices: StorePrice[]
  onAddToShoppingList?: (store: string, price: number) => void
}

export default function PriceComparisonModal({
  open,
  onOpenChange,
  ingredientName,
  storePrices,
  onAddToShoppingList,
}: PriceComparisonModalProps) {
  const [addedToCart, setAddedToCart] = useState<string | null>(null)

  // Find cheapest price
  const cheapestPrice = Math.min(...storePrices.map((sp) => sp.price))

  const handleAddToShoppingList = (store: string, price: number) => {
    if (onAddToShoppingList) {
      onAddToShoppingList(store, price)
    }
    setAddedToCart(store)
    setTimeout(() => setAddedToCart(null), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{ingredientName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-neutral-600 mb-4">
            Compare prices across different stores
          </p>

          <div className="space-y-3">
            {storePrices.map((storePrice, index) => {
              const isCheapest = storePrice.price === cheapestPrice
              return (
                <Card
                  key={index}
                  className={`transition-all ${
                    isCheapest
                      ? 'border-2 border-primary bg-primary/5'
                      : 'border border-neutral-200'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {storePrice.store}
                          </h3>
                          {isCheapest && (
                            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full font-medium">
                              Best Price
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-2xl font-bold ${
                            isCheapest ? 'text-primary' : 'text-neutral-700'
                          }`}
                        >
                          RM {storePrice.price.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        onClick={() =>
                          handleAddToShoppingList(storePrice.store, storePrice.price)
                        }
                        variant={isCheapest ? 'default' : 'outline'}
                        className="ml-4"
                        disabled={addedToCart === storePrice.store}
                      >
                        {addedToCart === storePrice.store ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Added
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Add to Shopping List
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

