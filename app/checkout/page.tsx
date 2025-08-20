"use client"

import { useState } from "react"
import { useCartStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { trpc } from "@/lib/trpc-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const checkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const createOrder = trpc.orders.create.useMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  })

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    setIsProcessing(true)

    try {
      // Create order
      const order = await createOrder.mutateAsync({
        items,
        total,
        status: "pending",
        paymentStatus: "pending",
        shippingAddress: data,
      })

      // Simulate Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: total * 100, // Amount in paise
        currency: "INR",
        name: "eCommerce Store",
        description: "Order Payment",
        order_id: order.id,
        handler: (response: any) => {
          toast.success("Payment successful!")
          clearCart()
          router.push("/order-success")
        },
        prefill: {
          name: data.name,
          email: data.email,
          contact: data.phone,
        },
        theme: {
          color: "#000000",
        },
      }

      // Load Razorpay script and open payment modal
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => {
        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      }
      document.body.appendChild(script)
    } catch (error) {
      toast.error("Failed to process order")
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button onClick={() => router.push("/")}>Continue Shopping</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...register("name")} className={errors.name ? "border-destructive" : ""} />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" {...register("phone")} className={errors.phone ? "border-destructive" : ""} />
                {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register("address")} className={errors.address ? "border-destructive" : ""} />
                {errors.address && <p className="text-sm text-destructive mt-1">{errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register("city")} className={errors.city ? "border-destructive" : ""} />
                  {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" {...register("state")} className={errors.state ? "border-destructive" : ""} />
                  {errors.state && <p className="text-sm text-destructive mt-1">{errors.state.message}</p>}
                </div>

                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" {...register("pincode")} className={errors.pincode ? "border-destructive" : ""} />
                  {errors.pincode && <p className="text-sm text-destructive mt-1">{errors.pincode.message}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                {isProcessing ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">₹{((item.salePrice || item.price) * item.quantity).toFixed(2)}</p>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
