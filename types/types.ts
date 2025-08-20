import { z } from "zod"

// Product schemas
export const ProductSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be positive"),
  category: z.string().min(1, "Category is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  stock: z.number().min(0, "Stock must be non-negative"),
  sale: z.boolean().default(false),
  salePercentage: z.number().min(0).max(100).optional(),
  featured: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const CategorySchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  image: z.string().optional(),
  createdAt: z.date().optional(),
})

// Cart schemas
export const CartItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  salePrice: z.number().optional(),
  image: z.string(),
  quantity: z.number().min(1),
})

export const CartSchema = z.object({
  items: z.array(CartItemSchema),
  total: z.number(),
})

// Order schemas
export const OrderSchema = z.object({
  _id: z.string().optional(),
  userId: z.string().optional(),
  items: z.array(CartItemSchema),
  total: z.number(),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]),
  paymentId: z.string().optional(),
  shippingAddress: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
  }),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// User schema
export const UserSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  password: z.string().optional(),
  role: z.enum(["user", "admin"]).default("user"),
  createdAt: z.date().optional(),
})

// Export types
export type Product = z.infer<typeof ProductSchema>
export type Category = z.infer<typeof CategorySchema>
export type CartItem = z.infer<typeof CartItemSchema>
export type Cart = z.infer<typeof CartSchema>
export type Order = z.infer<typeof OrderSchema>
export type User = z.infer<typeof UserSchema>

// Filter and sort types
export type ProductFilters = {
  category?: string
  minPrice?: number
  maxPrice?: number
  onSale?: boolean
  search?: string
}

export type ProductSort = "name" | "price-asc" | "price-desc" | "newest" | "popularity"
