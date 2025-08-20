import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, Cart } from "../types/types"

interface CartStore extends Cart {
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      addItem: (newItem) => {
        const items = get().items
        const existingItem = items.find((item) => item.productId === newItem.productId)

        if (existingItem) {
          set((state) => ({
            items: state.items.map((item) =>
              item.productId === newItem.productId ? { ...item, quantity: item.quantity + 1 } : item,
            ),
            total: state.total + (newItem.salePrice || newItem.price),
          }))
        } else {
          set((state) => ({
            items: [...state.items, { ...newItem, quantity: 1 }],
            total: state.total + (newItem.salePrice || newItem.price),
          }))
        }
      },

      removeItem: (productId) => {
        const item = get().items.find((item) => item.productId === productId)
        if (item) {
          set((state) => ({
            items: state.items.filter((item) => item.productId !== productId),
            total: state.total - (item.salePrice || item.price) * item.quantity,
          }))
        }
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        const item = get().items.find((item) => item.productId === productId)
        if (item) {
          const priceDiff = (quantity - item.quantity) * (item.salePrice || item.price)
          set((state) => ({
            items: state.items.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
            total: state.total + priceDiff,
          }))
        }
      },

      clearCart: () => set({ items: [], total: 0 }),

      getItemCount: () => get().items.reduce((count, item) => count + item.quantity, 0),
    }),
    {
      name: "cart-storage",
    },
  ),
)

// Admin store for managing admin state
interface AdminStore {
  selectedProduct: string | null
  setSelectedProduct: (id: string | null) => void
  isProductDialogOpen: boolean
  setProductDialogOpen: (open: boolean) => void
}

export const useAdminStore = create<AdminStore>((set) => ({
  selectedProduct: null,
  setSelectedProduct: (id) => set({ selectedProduct: id }),
  isProductDialogOpen: false,
  setProductDialogOpen: (open) => set({ isProductDialogOpen: open }),
}))
