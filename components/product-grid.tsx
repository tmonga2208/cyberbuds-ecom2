"use client"

import { trpc } from "@/lib/trpc-client"
import { ProductCard } from "./product-card"
import { ProductCardSkeleton } from "./product-card-skeleton"
import { useState } from "react"
import type { ProductFilters, ProductSort } from "@/types/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ProductGrid() {
  const [filters, setFilters] = useState<ProductFilters>({})
  const [sort, setSort] = useState<ProductSort>("newest")
  const [limit] = useState(12)
  const [skip, setSkip] = useState(0)

  const {
    data: products,
    isLoading,
    error,
  } = trpc.products.getAll.useQuery({
    filters,
    sort,
    limit,
    skip,
  })

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load products. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Products</h2>

        <div className="flex items-center gap-4">
          <Select value={sort} onValueChange={(value) => setSort(value as ProductSort)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="popularity">Popularity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products?.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {products && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
