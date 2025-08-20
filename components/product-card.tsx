"use client"

import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart } from "lucide-react"
import type { Product } from "@/types/types"
import { useCartStore } from "@/lib/store"
import { toast } from "sonner"
import { useState } from "react"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const salePrice =
    product.sale && product.salePercentage ? product.price * (1 - product.salePercentage / 100) : undefined

  const handleAddToCart = () => {
    addItem({
      productId: product._id!,
      name: product.name,
      price: product.price,
      salePrice,
      image: product.images[0],
    })
    toast.success("Added to cart!")
  }

  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg w-[300px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <Image
            src={product.images[0] || "/placeholder.svg?height=300&width=300"}
            alt={product.name}
            width={300}
            height={300}
            className={`w-full h-64 object-cover transition-transform duration-300 ${
              isHovered ? "scale-105" : "scale-100"
            }`}
          />

          {product.sale && product.salePercentage && (
            <Badge variant="destructive" className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              {product.salePercentage}% OFF
            </Badge>
          )}

          <div
            className={`absolute top-2 right-2 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <Button variant="secondary" size="icon" className="h-8 w-8">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {salePrice ? (
                <>
                  <span className="text-lg font-bold text-primary">₹{salePrice.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground line-through">₹{product.price.toFixed(2)}</span>
                </>
              ) : (
                <span className="text-lg font-bold text-primary">₹{product.price.toFixed(2)}</span>
              )}
            </div>

            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button onClick={handleAddToCart} className="w-full" disabled={product.stock === 0}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  )
}
