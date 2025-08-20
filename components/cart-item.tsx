"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2 } from "lucide-react"
import type { CartItem as CartItemType } from "@/types/types"
import { useCartStore } from "@/lib/store"

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()

  const price = item.salePrice || item.price
  const itemTotal = price * item.quantity

  return (
    <div className="flex items-center space-x-4 py-4">
      <Image
        src={item.image || "/placeholder.svg?height=80&width=80"}
        alt={item.name}
        width={80}
        height={80}
        className="rounded-md object-cover"
      />

      <div className="flex-1 space-y-2">
        <h4 className="font-medium line-clamp-2">{item.name}</h4>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => removeItem(item.productId)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">₹{price.toFixed(2)} each</span>
          <span className="font-semibold">₹{itemTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
