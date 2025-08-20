"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductSchema, type Product } from "@/types/types"
import { trpc } from "@/lib/trpc-client"
import { useAdminStore } from "@/lib/store"
import { toast } from "sonner"

type ProductForm = Omit<Product, "_id" | "createdAt" | "updatedAt">

export function ProductDialog() {
  const { isProductDialogOpen, setProductDialogOpen, selectedProduct, setSelectedProduct } = useAdminStore()

  const { data: categories } = trpc.categories.getAll.useQuery()
  const { data: product } = trpc.products.getById.useQuery(selectedProduct!, {
    enabled: !!selectedProduct,
  })

  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully")
      handleClose()
    },
    onError: () => {
      toast.error("Failed to create product")
    },
  })

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully")
      handleClose()
    },
    onError: () => {
      toast.error("Failed to update product")
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ProductForm>({
    resolver: zodResolver(ProductSchema.omit({ _id: true, createdAt: true, updatedAt: true })),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      images: [""],
      stock: 0,
      sale: false,
      salePercentage: 0,
      featured: false,
    },
  })

  const watchSale = watch("sale")

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        images: product.images,
        stock: product.stock,
        sale: product.sale,
        salePercentage: product.salePercentage || 0,
        featured: product.featured,
      })
    } else {
      reset({
        name: "",
        description: "",
        price: 0,
        category: "",
        images: [""],
        stock: 0,
        sale: false,
        salePercentage: 0,
        featured: false,
      })
    }
  }, [product, reset])

  const handleClose = () => {
    setProductDialogOpen(false)
    setSelectedProduct(null)
    reset()
  }

  const onSubmit = async (data: ProductForm) => {
    try {
      if (selectedProduct) {
        await updateProduct.mutateAsync({
          id: selectedProduct,
          data,
        })
      } else {
        await createProduct.mutateAsync(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={isProductDialogOpen} onOpenChange={setProductDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" {...register("name")} className={errors.name ? "border-destructive" : ""} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category._id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
                className={errors.price ? "border-destructive" : ""}
              />
              {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                {...register("stock", { valueAsNumber: true })}
                className={errors.stock ? "border-destructive" : ""}
              />
              {errors.stock && <p className="text-sm text-destructive mt-1">{errors.stock.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="images">Image URL</Label>
            <Input id="images" {...register("images.0")} placeholder="https://example.com/image.jpg" />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="sale" {...register("sale")} onCheckedChange={(checked) => setValue("sale", checked)} />
            <Label htmlFor="sale">On Sale</Label>
          </div>

          {watchSale && (
            <div>
              <Label htmlFor="salePercentage">Sale Percentage (%)</Label>
              <Input
                id="salePercentage"
                type="number"
                min="0"
                max="100"
                {...register("salePercentage", { valueAsNumber: true })}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              {...register("featured")}
              onCheckedChange={(checked) => setValue("featured", checked)}
            />
            <Label htmlFor="featured">Featured Product</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProduct.isLoading || updateProduct.isLoading}>
              {createProduct.isLoading || updateProduct.isLoading
                ? "Saving..."
                : selectedProduct
                  ? "Update Product"
                  : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
