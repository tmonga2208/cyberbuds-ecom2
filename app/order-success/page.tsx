import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function OrderSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Order Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been placed successfully and you will receive a confirmation
            email shortly.
          </p>
          <div className="space-y-2">
            <Link href="/">
              <Button className="w-full">Continue Shopping</Button>
            </Link>
            <Link href="/orders">
              <Button variant="outline" className="w-full bg-transparent">
                View Orders
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
