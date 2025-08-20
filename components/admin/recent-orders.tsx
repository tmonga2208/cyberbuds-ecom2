import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Order } from "@/types/types"

interface RecentOrdersProps {
  orders: Order[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order._id} className="flex items-center space-x-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{order.shippingAddress.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{order.shippingAddress.name}</p>
            <p className="text-sm text-muted-foreground">{order.shippingAddress.email}</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <div className="text-sm font-medium">₹{order.total.toFixed(2)}</div>
            <Badge variant={order.status === "delivered" ? "default" : "secondary"}>{order.status}</Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
