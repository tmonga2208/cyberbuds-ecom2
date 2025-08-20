"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { trpc } from "@/lib/trpc-client"
import { ProductDialog } from "@/components/admin/product-dialog"
import { useAdminStore } from "@/lib/store"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ProductsPage() {
  const [search, setSearch] = useState("")
  const { setProductDialogOpen, setSelectedProduct } = useAdminStore()

  const {
    data: products,
    isLoading,
    refetch,
  } = trpc.products.getAll.useQuery({
    filters: { search },
  })

  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted successfully")
      refetch()
    },
    onError: () => {
      toast.error("Failed to delete product")
    },
  })

  const handleEdit = (productId: string) => {
    setSelectedProduct(productId)
    setProductDialogOpen(true)
  }

  const handleDelete = async (productId: string) => {
    await deleteProduct.mutateAsync(productId)
  }

  const handleAddNew = () => {
    setSelectedProduct(null)
    setProductDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading products...</div>
          ) : (
            <div className="space-y-4">
              {products?.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.images[0] || "/placeholder.svg?height=60&width=60"}
                      alt={product.name}
                      className="w-15 h-15 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">{product.category}</Badge>
                        <span className="text-sm font-medium">₹{product.price.toFixed(2)}</span>
                        {product.sale && <Badge variant="destructive">{product.salePercentage}% OFF</Badge>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(product._id!)}>
                      <Edit className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this product? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product._id!)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}

              {products?.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No products found.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ProductDialog />
    </div>
  )
}
