"use client"

import { trpc } from "@/lib/trpc-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

export function CategoryFilter() {
  const { data: categories, isLoading } = trpc.categories.getAll.useQuery()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {categories?.map((category) => (
          <div key={category._id} className="flex items-center space-x-2">
            <Checkbox id={category._id} />
            <Label htmlFor={category._id} className="text-sm font-normal cursor-pointer">
              {category.name}
            </Label>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
