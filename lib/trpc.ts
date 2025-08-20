import { initTRPC, TRPCError } from "@trpc/server"
import { z } from "zod"
import { getDb } from "./db"
import { ProductSchema, CategorySchema, OrderSchema } from "../types/types"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { UserSchema } from "../types/types"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"

const t = initTRPC.create()

export const router = t.router
export const publicProcedure = t.procedure

const adminProcedure = t.procedure.use(async ({ next, ctx }) => {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user as { role?: string })?.role !== "admin") {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  return next({
    ctx: {
      ...ctx,
      user: session.user,
    },
  })
})

export const appRouter = router({
  // Product procedures
  products: router({
    getAll: publicProcedure
      .input(
        z.object({
          filters: z
            .object({
              category: z.string().optional(),
              minPrice: z.number().optional(),
              maxPrice: z.number().optional(),
              onSale: z.boolean().optional(),
              search: z.string().optional(),
            })
            .optional(),
          sort: z.enum(["name", "price-asc", "price-desc", "newest", "popularity"]).optional(),
          limit: z.number().optional(),
          skip: z.number().optional(),
        }),
      )
      .query(async ({ input }) => {
        const db = await getDb()
        const { filters = {}, sort = "newest", limit = 20, skip = 0 } = input

        const query: Record<string, unknown> = {}

        if (filters.category) query.category = filters.category
        if (filters.onSale) query.sale = true
        if (filters.minPrice || filters.maxPrice) {
          query.price = {}
          if (filters.minPrice) (query.price as Record<string, number>)["$gte"] = filters.minPrice
          if (filters.maxPrice) (query.price as Record<string, number>)["$lte"] = filters.maxPrice
        }
        if (filters.search) {
          query.$or = [
            { name: { $regex: filters.search, $options: "i" } },
            { description: { $regex: filters.search, $options: "i" } },
          ]
        }

        let sortQuery: Record<string, 1 | -1> = {}
        switch (sort) {
          case "name":
            sortQuery = { name: 1 }
            break
          case "price-asc":
            sortQuery = { price: 1 }
            break
          case "price-desc":
            sortQuery = { price: -1 }
            break
          case "newest":
            sortQuery = { createdAt: -1 }
            break
          case "popularity":
            sortQuery = { featured: -1, createdAt: -1 }
            break
        }

        const products = await db.collection("products").find(query).sort(sortQuery).skip(skip).limit(limit).toArray()

        return products.map((product) => ({
          ...product,
          _id: product._id.toString(),
        }))
      }),

    getById: publicProcedure.input(z.string()).query(async ({ input }) => {
      const db = await getDb()
      const product = await db.collection("products").findOne({ _id: new ObjectId(input) })

      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" })
      }

      return {
        ...product,
        _id: product._id.toString(),
      }
    }),

    create: adminProcedure
      .input(ProductSchema.omit({ _id: true, createdAt: true, updatedAt: true }))
      .mutation(async ({ input }) => {
        const db = await getDb()
        const now = new Date()

        const result = await db.collection("products").insertOne({
          ...input,
          createdAt: now,
          updatedAt: now,
        })

        return { id: result.insertedId.toString() }
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.string(),
          data: ProductSchema.omit({ _id: true, createdAt: true, updatedAt: true }).partial(),
        }),
      )
      .mutation(async ({ input }) => {
        const db = await getDb()

        await db.collection("products").updateOne(
          { _id: new ObjectId(input.id) },
          {
            $set: {
              ...input.data,
              updatedAt: new Date(),
            },
          },
        )

        return { success: true }
      }),

    delete: adminProcedure.input(z.string()).mutation(async ({ input }) => {
      const db = await getDb()
      await db.collection("products").deleteOne({ _id: new ObjectId(input) })
      return { success: true }
    }),
  }),

  // Category procedures
  categories: router({
    getAll: publicProcedure.query(async () => {
      const db = await getDb()
      const categories = await db.collection("categories").find({}).toArray()

      return categories.map((category) => ({
        ...category,
        _id: category._id.toString(),
        name : category.name, 
      }))
    }),

    create: adminProcedure.input(CategorySchema.omit({ _id: true, createdAt: true })).mutation(async ({ input }) => {
      const db = await getDb()

      const result = await db.collection("categories").insertOne({
        ...input,
        createdAt: new Date(),
      })

      return { id: result.insertedId.toString() }
    }),
  }),

  // Order procedures
  orders: router({
    create: publicProcedure
      .input(OrderSchema.omit({ _id: true, createdAt: true, updatedAt: true }))
      .mutation(async ({ input }) => {
        const db = await getDb()
        const now = new Date()

        const result = await db.collection("orders").insertOne({
          ...input,
          createdAt: now,
          updatedAt: now,
        })

        return { id: result.insertedId.toString() }
      }),

    getAll: adminProcedure.query(async () => {
      const db = await getDb()
      const orders = await db.collection("orders").find({}).sort({ createdAt: -1 }).toArray()

      return orders.map((order) => ({
        ...order,
        _id: order._id.toString(),
      }))
    }),

    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.string(),
          status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
        }),
      )
      .mutation(async ({ input }) => {
        const db = await getDb()

        await db.collection("orders").updateOne(
          { _id: new ObjectId(input.id) },
          {
            $set: {
              status: input.status,
              updatedAt: new Date(),
            },
          },
        )

        return { success: true }
      }),
  }),

  // Analytics procedures
  analytics: router({
    getDashboard: adminProcedure.query(async () => {
      const db = await getDb()

      const [totalProducts, totalOrders, totalRevenue, recentOrders] = await Promise.all([
        db.collection("products").countDocuments(),
        db.collection("orders").countDocuments(),
        db
          .collection("orders")
          .aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }])
          .toArray(),
        db.collection("orders").find({}).sort({ createdAt: -1 }).limit(5).toArray(),
      ])

      return {
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders: recentOrders.map((order) => ({
          ...order,
          _id: order._id.toString(),
        })),
      }
    }),
  }),

  users: router({
    getAll: adminProcedure.query(async () => {
      const db = await getDb()
      const users = await db.collection("users").find({}).sort({ createdAt: -1 }).toArray()

      return users.map((user) => ({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      }))
    }),

    signup: publicProcedure
      .input(
        UserSchema.omit({ _id: true, createdAt: true, role: true }) // Only name, email, password
      )
      .mutation(async ({ input }) => {
        const db = await getDb()
        const existing = await db.collection("users").findOne({ email: input.email })
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Email already registered" })
        }
        const hashed = await bcrypt.hash(input.password!, 10)
        const now = new Date()
        const result = await db.collection("users").insertOne({
          name: input.name,
          email: input.email,
          password: hashed,
          role: "user",
          createdAt: now,
        })
        return { id: result.insertedId.toString() }
      }),
  }),
})

export type AppRouter = typeof appRouter
